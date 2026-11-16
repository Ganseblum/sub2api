package repository

import (
	"context"
	"database/sql"
	"database/sql/driver"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/Wei-Shaw/sub2api/internal/service"
)

func (r *channelMonitorRepository) GetPelicanConfig(ctx context.Context, id int64) (service.PelicanConfig, error) {
	config := service.PelicanConfig{IntervalSeconds: 1800}
	var models []byte
	err := r.db.QueryRowContext(ctx, `SELECT enabled, interval_seconds, models FROM channel_monitor_pelican_configs WHERE monitor_id = $1`, id).Scan(&config.Enabled, &config.IntervalSeconds, &models)
	if errors.Is(err, sql.ErrNoRows) {
		return config, nil
	}
	if err == nil && len(models) > 0 {
		err = json.Unmarshal(models, &config.Models)
	}
	return config, err
}

func (r *channelMonitorRepository) TryLockPelican(ctx context.Context, id int64) (func(), bool, error) {
	conn, err := r.db.Conn(ctx)
	if err != nil {
		return nil, false, err
	}
	key := fmt.Sprintf("pelican-run:%d", id)
	var acquired bool
	if err := conn.QueryRowContext(ctx, `SELECT pg_try_advisory_lock(hashtextextended($1, 0))`, key).Scan(&acquired); err != nil || !acquired {
		_ = conn.Close()
		return nil, false, err
	}
	return func() {
		// A failed unlock must not put a locked connection back into the pool.
		if _, err := conn.ExecContext(context.Background(), `SELECT pg_advisory_unlock(hashtextextended($1, 0))`, key); err != nil {
			_ = conn.Raw(func(any) error { return driver.ErrBadConn })
		}
		_ = conn.Close()
	}, true, nil
}

func (r *channelMonitorRepository) SetPelicanConfig(ctx context.Context, id int64, config service.PelicanConfig) error {
	models, err := json.Marshal(config.Models)
	if err != nil {
		return err
	}
	_, err = r.db.ExecContext(ctx, `INSERT INTO channel_monitor_pelican_configs (monitor_id, enabled, interval_seconds, models)
		VALUES ($1, $2, $3, $4::jsonb) ON CONFLICT (monitor_id) DO UPDATE
		SET enabled = EXCLUDED.enabled, interval_seconds = EXCLUDED.interval_seconds, models = EXCLUDED.models, updated_at = NOW()`, id, config.Enabled, config.IntervalSeconds, string(models))
	return err
}

func (r *channelMonitorRepository) SavePelicanResult(ctx context.Context, result *service.PelicanResult) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback() }()
	// Serialise retention for this monitor. This also makes concurrent replicas
	// unable to exceed the ten-artifact limit for an individual model.
	if _, err = tx.ExecContext(ctx, `SELECT pg_advisory_xact_lock(hashtextextended($1, 0))`, fmt.Sprintf("pelican:%d", result.MonitorID)); err != nil {
		return err
	}
	err = tx.QueryRowContext(ctx, `INSERT INTO channel_monitor_pelican_results
		(monitor_id, model, status, source_length, artifact, message, started_at, finished_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`, result.MonitorID, result.Model, result.Status, result.SourceLength, result.Artifact, result.Message, result.StartedAt, result.FinishedAt).Scan(&result.ID)
	if err != nil {
		return err
	}
	_, err = tx.ExecContext(ctx, `DELETE FROM channel_monitor_pelican_results WHERE id IN (
		SELECT id FROM channel_monitor_pelican_results WHERE monitor_id=$1 AND model=$2
		ORDER BY finished_at DESC, id DESC OFFSET 10)`, result.MonitorID, result.Model)
	if err != nil {
		return err
	}
	return tx.Commit()
}

func (r *channelMonitorRepository) ListPelicanResults(ctx context.Context, id int64) ([]service.PelicanResult, error) {
	rows, err := r.db.QueryContext(ctx, `SELECT id, monitor_id, model, status, source_length, artifact, message, started_at, finished_at
		FROM channel_monitor_pelican_results WHERE monitor_id=$1 ORDER BY finished_at DESC, id DESC`, id)
	if err != nil {
		return nil, err
	}
	defer func() { _ = rows.Close() }()
	var results []service.PelicanResult
	for rows.Next() {
		var item service.PelicanResult
		if err := rows.Scan(&item.ID, &item.MonitorID, &item.Model, &item.Status, &item.SourceLength, &item.Artifact, &item.Message, &item.StartedAt, &item.FinishedAt); err != nil {
			return nil, err
		}
		results = append(results, item)
	}
	return results, rows.Err()
}

func (r *channelMonitorRepository) PelicanLastStarted(ctx context.Context, id int64) (map[string]time.Time, error) {
	rows, err := r.db.QueryContext(ctx, `SELECT model, MAX(started_at) FROM channel_monitor_pelican_results WHERE monitor_id=$1 GROUP BY model`, id)
	if err != nil {
		return nil, err
	}
	defer func() { _ = rows.Close() }()
	last := make(map[string]time.Time)
	for rows.Next() {
		var model string
		var started time.Time
		if err := rows.Scan(&model, &started); err != nil {
			return nil, err
		}
		last[model] = started
	}
	return last, rows.Err()
}
