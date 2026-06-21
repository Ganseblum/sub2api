package repository

import (
	"context"
	"database/sql"
	"fmt"
	"math"
	"strings"

	"github.com/Wei-Shaw/sub2api/internal/service"
)

func (r *opsRepository) GetAnalytics(ctx context.Context, filter *service.OpsAnalyticsFilter) ([]*service.OpsAnalyticsRow, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("nil ops repository")
	}
	if filter == nil {
		return nil, fmt.Errorf("nil filter")
	}

	filter.Normalize()
	if !filter.ValidDimension() {
		return nil, fmt.Errorf("invalid dimension")
	}

	dimensionIDExpr := "account_id"
	dimensionNameExpr := "COALESCE(NULLIF(account_name, ''), CASE WHEN account_id IS NULL THEN 'Unassigned account' ELSE 'Account #' || account_id::TEXT END)"
	if filter.Dimension == service.OpsAnalyticsDimensionGroup {
		dimensionIDExpr = "group_id"
		dimensionNameExpr = "COALESCE(NULLIF(group_name, ''), CASE WHEN group_id IS NULL THEN 'Ungrouped' ELSE 'Group #' || group_id::TEXT END)"
	}

	args := []any{filter.StartTime.UTC(), filter.EndTime.UTC()}
	conditions := make([]string, 0, 4)
	addCondition := func(condition string, values ...any) {
		conditions = append(conditions, condition)
		args = append(args, values...)
	}

	if filter.Platform != "" {
		addCondition(fmt.Sprintf("LOWER(platform) = $%d", len(args)+1), filter.Platform)
	}
	if filter.GroupID != nil && *filter.GroupID > 0 {
		addCondition(fmt.Sprintf("group_id = $%d", len(args)+1), *filter.GroupID)
	}
	if filter.AccountID != nil && *filter.AccountID > 0 {
		addCondition(fmt.Sprintf("account_id = $%d", len(args)+1), *filter.AccountID)
	}
	if filter.Model != "" {
		addCondition(fmt.Sprintf("model = $%d", len(args)+1), filter.Model)
	}

	where := ""
	if len(conditions) > 0 {
		where = "WHERE " + strings.Join(conditions, " AND ")
	}

	sort := "request_count DESC, error_rate DESC, name ASC"
	switch strings.TrimSpace(strings.ToLower(filter.Sort)) {
	case "", "request_count_desc":
	case "error_rate_desc":
		sort = "error_rate DESC, request_count DESC, name ASC"
	case "avg_duration_desc":
		sort = "duration_avg_ms DESC NULLS LAST, request_count DESC, name ASC"
	case "avg_ttft_desc":
		sort = "ttft_avg_ms DESC NULLS LAST, request_count DESC, name ASC"
	default:
		return nil, fmt.Errorf("invalid sort")
	}

	query := fmt.Sprintf(`
WITH combined AS (
  SELECT
    ul.account_id AS account_id,
    COALESCE(NULLIF(a.name, ''), '') AS account_name,
    ul.group_id AS group_id,
    COALESCE(NULLIF(g.name, ''), '') AS group_name,
    COALESCE(NULLIF(g.platform, ''), NULLIF(a.platform, ''), '') AS platform,
    COALESCE(NULLIF(ul.requested_model, ''), ul.model) AS model,
    ul.duration_ms::BIGINT AS duration_ms,
    ul.first_token_ms::BIGINT AS ttft_ms,
    FALSE AS is_error,
    FALSE AS is_business_limited,
    (
      COALESCE(ul.input_tokens, 0)
      + COALESCE(ul.output_tokens, 0)
      + COALESCE(ul.cache_creation_tokens, 0)
      + COALESCE(ul.cache_read_tokens, 0)
    )::BIGINT AS token_consumed
  FROM usage_logs ul
  LEFT JOIN accounts a ON a.id = ul.account_id
  LEFT JOIN groups g ON g.id = ul.group_id
  WHERE ul.created_at >= $1 AND ul.created_at < $2

  UNION ALL

  SELECT
    o.account_id AS account_id,
    COALESCE(NULLIF(a.name, ''), '') AS account_name,
    o.group_id AS group_id,
    COALESCE(NULLIF(g.name, ''), '') AS group_name,
    COALESCE(NULLIF(o.platform, ''), NULLIF(g.platform, ''), NULLIF(a.platform, ''), '') AS platform,
    COALESCE(NULLIF(o.requested_model, ''), o.model) AS model,
    o.duration_ms::BIGINT AS duration_ms,
    o.time_to_first_token_ms::BIGINT AS ttft_ms,
    TRUE AS is_error,
    COALESCE(o.is_business_limited, FALSE) AS is_business_limited,
    0::BIGINT AS token_consumed
  FROM ops_error_logs o
  LEFT JOIN accounts a ON a.id = o.account_id
  LEFT JOIN groups g ON g.id = o.group_id
  WHERE o.created_at >= $1 AND o.created_at < $2
    AND COALESCE(o.status_code, 0) >= 400
    AND COALESCE(o.is_count_tokens, FALSE) = FALSE
)
SELECT
  %s AS id,
  %s AS name,
  COALESCE(NULLIF(MAX(NULLIF(platform, '')), ''), 'unknown') AS platform,
  COUNT(*)::BIGINT AS request_count,
  COUNT(*) FILTER (WHERE NOT is_error)::BIGINT AS success_count,
  COUNT(*) FILTER (WHERE is_error)::BIGINT AS error_count,
  COUNT(*) FILTER (WHERE is_error AND is_business_limited)::BIGINT AS business_limited_count,
  COALESCE(SUM(token_consumed), 0)::BIGINT AS token_consumed,
  COALESCE(ROUND((COUNT(*) FILTER (WHERE is_error))::NUMERIC / NULLIF(COUNT(*), 0), 4), 0)::FLOAT8 AS error_rate,

  MIN(duration_ms) FILTER (WHERE duration_ms IS NOT NULL) AS duration_min_ms,
  MAX(duration_ms) FILTER (WHERE duration_ms IS NOT NULL) AS duration_max_ms,
  AVG(duration_ms) FILTER (WHERE duration_ms IS NOT NULL) AS duration_avg_ms,
  percentile_cont(0.95) WITHIN GROUP (ORDER BY duration_ms) FILTER (WHERE duration_ms IS NOT NULL) AS duration_p95_ms,
  percentile_cont(0.99) WITHIN GROUP (ORDER BY duration_ms) FILTER (WHERE duration_ms IS NOT NULL) AS duration_p99_ms,
  COUNT(duration_ms)::BIGINT AS duration_samples,

  MIN(ttft_ms) FILTER (WHERE ttft_ms IS NOT NULL) AS ttft_min_ms,
  MAX(ttft_ms) FILTER (WHERE ttft_ms IS NOT NULL) AS ttft_max_ms,
  AVG(ttft_ms) FILTER (WHERE ttft_ms IS NOT NULL) AS ttft_avg_ms,
  percentile_cont(0.95) WITHIN GROUP (ORDER BY ttft_ms) FILTER (WHERE ttft_ms IS NOT NULL) AS ttft_p95_ms,
  percentile_cont(0.99) WITHIN GROUP (ORDER BY ttft_ms) FILTER (WHERE ttft_ms IS NOT NULL) AS ttft_p99_ms,
  COUNT(ttft_ms)::BIGINT AS ttft_samples
FROM combined
%s
GROUP BY %s, %s
ORDER BY %s
LIMIT $%d
`, dimensionIDExpr, dimensionNameExpr, where, dimensionIDExpr, dimensionNameExpr, sort, len(args)+1)

	args = append(args, filter.Limit)

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer func() { _ = rows.Close() }()

	out := make([]*service.OpsAnalyticsRow, 0, filter.Limit)
	for rows.Next() {
		var (
			id       sql.NullInt64
			name     sql.NullString
			platform sql.NullString

			requestCount         int64
			successCount         int64
			errorCount           int64
			businessLimitedCount int64
			tokenConsumed        int64
			errorRate            float64

			durationMin     sql.NullInt64
			durationMax     sql.NullInt64
			durationAvg     sql.NullFloat64
			durationP95     sql.NullFloat64
			durationP99     sql.NullFloat64
			durationSamples int64

			ttftMin     sql.NullInt64
			ttftMax     sql.NullInt64
			ttftAvg     sql.NullFloat64
			ttftP95     sql.NullFloat64
			ttftP99     sql.NullFloat64
			ttftSamples int64
		)

		if err := rows.Scan(
			&id,
			&name,
			&platform,
			&requestCount,
			&successCount,
			&errorCount,
			&businessLimitedCount,
			&tokenConsumed,
			&errorRate,
			&durationMin,
			&durationMax,
			&durationAvg,
			&durationP95,
			&durationP99,
			&durationSamples,
			&ttftMin,
			&ttftMax,
			&ttftAvg,
			&ttftP95,
			&ttftP99,
			&ttftSamples,
		); err != nil {
			return nil, err
		}

		item := &service.OpsAnalyticsRow{
			Dimension:            filter.Dimension,
			ID:                   nullInt64Ptr(id),
			Name:                 strings.TrimSpace(name.String),
			Platform:             strings.TrimSpace(platform.String),
			RequestCount:         requestCount,
			SuccessCount:         successCount,
			ErrorCount:           errorCount,
			BusinessLimitedCount: businessLimitedCount,
			TokenConsumed:        tokenConsumed,
			ErrorRate:            math.Round(errorRate*10000) / 10000,
			Duration: service.OpsAnalyticsLatencySummary{
				Min:     nullIntToIntPtr(durationMin),
				Max:     nullIntToIntPtr(durationMax),
				Avg:     nullFloatToRoundedIntPtr(durationAvg),
				P95:     nullFloatToRoundedIntPtr(durationP95),
				P99:     nullFloatToRoundedIntPtr(durationP99),
				Samples: durationSamples,
			},
			TTFT: service.OpsAnalyticsLatencySummary{
				Min:     nullIntToIntPtr(ttftMin),
				Max:     nullIntToIntPtr(ttftMax),
				Avg:     nullFloatToRoundedIntPtr(ttftAvg),
				P95:     nullFloatToRoundedIntPtr(ttftP95),
				P99:     nullFloatToRoundedIntPtr(ttftP99),
				Samples: ttftSamples,
			},
		}
		if item.Name == "" {
			item.Name = "Unknown"
		}
		if item.Platform == "" {
			item.Platform = "unknown"
		}

		out = append(out, item)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return out, nil
}

func nullInt64Ptr(v sql.NullInt64) *int64 {
	if !v.Valid {
		return nil
	}
	out := v.Int64
	return &out
}

func nullIntToIntPtr(v sql.NullInt64) *int {
	if !v.Valid {
		return nil
	}
	out := int(v.Int64)
	return &out
}

func nullFloatToRoundedIntPtr(v sql.NullFloat64) *int {
	if !v.Valid {
		return nil
	}
	out := int(math.Round(v.Float64))
	return &out
}
