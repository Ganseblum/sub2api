package repository

import (
	"context"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/Wei-Shaw/sub2api/internal/service"
	"github.com/stretchr/testify/require"
)

func TestOpsRepositoryGetAnalytics_AccountDimensionFiltersAndScans(t *testing.T) {
	db, mock := newSQLMock(t)
	repo := &opsRepository{db: db}

	start := time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC)
	end := start.Add(time.Hour)
	accountID := int64(3)

	filter := &service.OpsAnalyticsFilter{
		StartTime: start,
		EndTime:   end,
		Dimension: service.OpsAnalyticsDimensionAccount,
		Platform:  " OpenAI ",
		AccountID: &accountID,
		Model:     "gpt-5.1",
		Sort:      "avg_duration_desc",
		Limit:     20,
	}

	rows := sqlmock.NewRows([]string{
		"id",
		"name",
		"platform",
		"request_count",
		"success_count",
		"error_count",
		"business_limited_count",
		"token_consumed",
		"error_rate",
		"duration_min_ms",
		"duration_max_ms",
		"duration_avg_ms",
		"duration_p95_ms",
		"duration_p99_ms",
		"duration_samples",
		"ttft_min_ms",
		"ttft_max_ms",
		"ttft_avg_ms",
		"ttft_p95_ms",
		"ttft_p99_ms",
		"ttft_samples",
	}).AddRow(
		int64(3),
		"primary-openai",
		"openai",
		int64(10),
		int64(8),
		int64(2),
		int64(1),
		int64(12345),
		0.2,
		int64(100),
		int64(2500),
		500.4,
		1900.2,
		2400.9,
		int64(10),
		int64(80),
		int64(900),
		210.5,
		800.4,
		890.5,
		int64(8),
	)

	mock.ExpectQuery(`GROUP BY account_id, COALESCE`).
		WithArgs(start, end, "openai", accountID, "gpt-5.1", 20).
		WillReturnRows(rows)

	out, err := repo.GetAnalytics(context.Background(), filter)
	require.NoError(t, err)
	require.Len(t, out, 1)

	row := out[0]
	require.Equal(t, service.OpsAnalyticsDimensionAccount, row.Dimension)
	require.NotNil(t, row.ID)
	require.Equal(t, int64(3), *row.ID)
	require.Equal(t, "primary-openai", row.Name)
	require.Equal(t, "openai", row.Platform)
	require.Equal(t, int64(10), row.RequestCount)
	require.Equal(t, int64(8), row.SuccessCount)
	require.Equal(t, int64(2), row.ErrorCount)
	require.InDelta(t, 0.2, row.ErrorRate, 0.0001)
	require.Equal(t, 500, *row.Duration.Avg)
	require.Equal(t, 1900, *row.Duration.P95)
	require.Equal(t, 2401, *row.Duration.P99)
	require.Equal(t, int64(10), row.Duration.Samples)
	require.Equal(t, 211, *row.TTFT.Avg)
	require.Equal(t, 800, *row.TTFT.P95)
	require.Equal(t, 891, *row.TTFT.P99)
	require.Equal(t, int64(8), row.TTFT.Samples)

	require.NoError(t, mock.ExpectationsWereMet())
}

func TestOpsRepositoryGetAnalytics_InvalidSort(t *testing.T) {
	db, _ := newSQLMock(t)
	repo := &opsRepository{db: db}

	_, err := repo.GetAnalytics(context.Background(), &service.OpsAnalyticsFilter{
		StartTime: time.Now().Add(-time.Hour),
		EndTime:   time.Now(),
		Dimension: service.OpsAnalyticsDimensionGroup,
		Sort:      "bad",
	})
	require.ErrorContains(t, err, "invalid sort")
}
