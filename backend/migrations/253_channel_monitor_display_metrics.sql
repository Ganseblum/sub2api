CREATE TABLE IF NOT EXISTS channel_monitor_display_configs (
    monitor_id BIGINT PRIMARY KEY REFERENCES channel_monitors(id) ON DELETE CASCADE,
    group_id BIGINT REFERENCES groups(id) ON DELETE SET NULL,
    display_rate DOUBLE PRECISION CHECK (display_rate IS NULL OR (display_rate >= 0 AND display_rate <= 100000)),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
