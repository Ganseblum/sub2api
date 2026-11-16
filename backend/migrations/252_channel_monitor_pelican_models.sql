ALTER TABLE channel_monitor_pelican_configs
    ADD COLUMN IF NOT EXISTS models JSONB NOT NULL DEFAULT '[]'::jsonb;
