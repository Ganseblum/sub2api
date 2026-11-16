-- Pelican checks have their own schedule and do not affect uptime probes.
CREATE TABLE IF NOT EXISTS channel_monitor_pelican_configs (
    monitor_id BIGINT PRIMARY KEY REFERENCES channel_monitors(id) ON DELETE CASCADE,
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    interval_seconds INTEGER NOT NULL DEFAULT 1800 CHECK (interval_seconds IN (600, 1800, 3600)),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS channel_monitor_pelican_results (
    id BIGSERIAL PRIMARY KEY,
    monitor_id BIGINT NOT NULL REFERENCES channel_monitors(id) ON DELETE CASCADE,
    model TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('passed', 'failed', 'error')),
    source_length INTEGER NOT NULL DEFAULT 0,
    artifact TEXT NOT NULL DEFAULT '',
    message TEXT NOT NULL DEFAULT '',
    started_at TIMESTAMPTZ NOT NULL,
    finished_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_channel_monitor_pelican_results_recent
    ON channel_monitor_pelican_results (monitor_id, model, finished_at DESC, id DESC);
