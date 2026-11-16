package repository

import (
	"context"

	"github.com/Wei-Shaw/sub2api/internal/service"
)

func (r *channelMonitorRepository) SavePelicanPlaygroundResult(ctx context.Context, item *service.PelicanPlaygroundResult, userID int64) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback() }()
	if _, err := tx.ExecContext(ctx, `DELETE FROM pelican_playground_results WHERE expires_at <= NOW()`); err != nil {
		return err
	}
	err = tx.QueryRowContext(ctx, `INSERT INTO pelican_playground_results
		(created_by, endpoint, model, api_key_masked, prompt, status, content, artifact, message, source_length, started_at, finished_at, expires_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING id`,
		userID, item.Endpoint, item.Model, item.APIKeyMasked, item.Prompt, item.Status, item.Content, item.Artifact,
		item.Message, item.SourceLength, item.StartedAt, item.FinishedAt, item.ExpiresAt).Scan(&item.ID)
	if err != nil {
		return err
	}
	return tx.Commit()
}

func (r *channelMonitorRepository) ListPelicanPlaygroundResults(ctx context.Context, userID int64, limit int) ([]service.PelicanPlaygroundResult, error) {
	rows, err := r.db.QueryContext(ctx, `SELECT id, endpoint, model, api_key_masked, prompt, status, content, artifact, message, source_length, started_at, finished_at, expires_at
		FROM pelican_playground_results WHERE created_by=$1 AND expires_at > NOW() ORDER BY started_at DESC, id DESC LIMIT $2`, userID, limit)
	if err != nil {
		return nil, err
	}
	defer func() { _ = rows.Close() }()
	items := make([]service.PelicanPlaygroundResult, 0)
	for rows.Next() {
		var item service.PelicanPlaygroundResult
		if err := rows.Scan(&item.ID, &item.Endpoint, &item.Model, &item.APIKeyMasked, &item.Prompt, &item.Status, &item.Content, &item.Artifact, &item.Message, &item.SourceLength, &item.StartedAt, &item.FinishedAt, &item.ExpiresAt); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r *channelMonitorRepository) DeleteExpiredPelicanPlaygroundResults(ctx context.Context) (int64, error) {
	result, err := r.db.ExecContext(ctx, `DELETE FROM pelican_playground_results WHERE expires_at <= NOW()`)
	if err != nil {
		return 0, err
	}
	return result.RowsAffected()
}
