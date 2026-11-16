package repository

import (
	"context"
	"database/sql"
	"errors"
	"github.com/Wei-Shaw/sub2api/internal/service"
	"github.com/lib/pq"
)

func (r *channelMonitorRepository) GetMonitorDisplayConfig(ctx context.Context, id int64) (service.MonitorDisplayConfig, error) {
	var c service.MonitorDisplayConfig
	err := r.db.QueryRowContext(ctx, `SELECT group_id, display_rate, sort_order FROM channel_monitor_display_configs WHERE monitor_id=$1`, id).Scan(&c.GroupID, &c.DisplayRate, &c.SortOrder)
	if errors.Is(err, sql.ErrNoRows) {
		return c, nil
	}
	return c, err
}

func (r *channelMonitorRepository) SetMonitorDisplayConfig(ctx context.Context, id int64, c service.MonitorDisplayConfig) error {
	_, err := r.db.ExecContext(ctx, `INSERT INTO channel_monitor_display_configs (monitor_id, group_id, display_rate, sort_order) VALUES ($1,$2,$3,$4) ON CONFLICT (monitor_id) DO UPDATE SET group_id=EXCLUDED.group_id, display_rate=EXCLUDED.display_rate, sort_order=EXCLUDED.sort_order, updated_at=NOW()`, id, c.GroupID, c.DisplayRate, c.SortOrder)
	return err
}

func (r *channelMonitorRepository) ListMonitorDisplayMetrics(ctx context.Context, ids []int64) (map[int64]service.MonitorDisplayMetrics, error) {
	rows, err := r.db.QueryContext(ctx, `WITH selected AS (SELECT m.id AS monitor_id, c.group_id, COALESCE(c.display_rate,g.rate_multiplier) AS display_rate, COALESCE(c.sort_order,0) AS sort_order, COALESCE(p.sort_order,0) AS provider_order FROM channel_monitors m LEFT JOIN channel_monitor_display_configs c ON c.monitor_id=m.id LEFT JOIN groups g ON g.id=c.group_id LEFT JOIN channel_monitor_provider_order p ON p.provider=m.provider WHERE m.id = ANY($1)),
    aggregates AS (
      SELECT ul.group_id,
        SUM(ul.cache_read_tokens) FILTER (WHERE ul.created_at >= NOW() - INTERVAL '3 days') AS cached,
        SUM(ul.input_tokens + ul.cache_creation_tokens + ul.cache_read_tokens) FILTER (WHERE ul.created_at >= NOW() - INTERVAL '3 days') AS total,
        AVG(ul.first_token_ms) FILTER (WHERE ul.created_at >= NOW() - INTERVAL '90 minutes' AND ul.first_token_ms IS NOT NULL AND ul.first_token_ms >= 0 AND ul.first_token_ms <= 60000) AS ttft
      FROM usage_logs ul WHERE ul.group_id IN (SELECT DISTINCT group_id FROM selected WHERE group_id IS NOT NULL)
        AND ul.created_at >= NOW() - INTERVAL '3 days' AND ul.actual_cost > 0 GROUP BY ul.group_id)
    SELECT s.monitor_id, s.display_rate, 100.0*a.cached/NULLIF(a.total,0), a.ttft, s.sort_order, s.provider_order FROM selected s LEFT JOIN aggregates a ON a.group_id=s.group_id`, pq.Array(ids))
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	result := make(map[int64]service.MonitorDisplayMetrics)
	for rows.Next() {
		var id int64
		var m service.MonitorDisplayMetrics
		if err := rows.Scan(&id, &m.DisplayRate, &m.CacheRate, &m.FirstTokenMs, &m.SortOrder, &m.ProviderOrder); err != nil {
			return nil, err
		}
		result[id] = m
	}
	return result, rows.Err()
}

func (r *channelMonitorRepository) GetMonitorProviderOrders(ctx context.Context) ([]service.MonitorProviderOrder, error) {
	rows, err := r.db.QueryContext(ctx, `SELECT provider, sort_order FROM channel_monitor_provider_order ORDER BY provider`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []service.MonitorProviderOrder{}
	for rows.Next() {
		var item service.MonitorProviderOrder
		if err := rows.Scan(&item.Provider, &item.SortOrder); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r *channelMonitorRepository) SetMonitorProviderOrders(ctx context.Context, items []service.MonitorProviderOrder) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()
	for _, item := range items {
		if _, err := tx.ExecContext(ctx, `INSERT INTO channel_monitor_provider_order (provider, sort_order) VALUES ($1,$2) ON CONFLICT (provider) DO UPDATE SET sort_order=EXCLUDED.sort_order`, item.Provider, item.SortOrder); err != nil {
			return err
		}
	}
	return tx.Commit()
}
