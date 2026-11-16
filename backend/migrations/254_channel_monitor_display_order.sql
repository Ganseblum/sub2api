ALTER TABLE channel_monitor_display_configs ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;
CREATE TABLE IF NOT EXISTS channel_monitor_provider_order (
    provider TEXT PRIMARY KEY,
    sort_order INTEGER NOT NULL DEFAULT 0
);
