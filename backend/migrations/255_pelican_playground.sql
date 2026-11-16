CREATE TABLE IF NOT EXISTS pelican_playground_results (
    id BIGSERIAL PRIMARY KEY,
    created_by BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    model TEXT NOT NULL,
    api_key_masked VARCHAR(32) NOT NULL,
    prompt TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('passed', 'failed', 'error')),
    content TEXT NOT NULL DEFAULT '',
    artifact TEXT NOT NULL DEFAULT '',
    message TEXT NOT NULL DEFAULT '',
    source_length INTEGER NOT NULL DEFAULT 0,
    started_at TIMESTAMPTZ NOT NULL,
    finished_at TIMESTAMPTZ NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_pelican_playground_results_history
    ON pelican_playground_results (created_by, started_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_pelican_playground_results_expiry
    ON pelican_playground_results (expires_at);
