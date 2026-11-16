package repository

import (
	"context"
	"database/sql"
	"math"
	"os"
	"testing"
)

func TestMonitorDisplayMetrics(t *testing.T) {
	dsn := os.Getenv("PELICAN_TEST_DATABASE_URL")
	if dsn == "" {
		t.Skip("PELICAN_TEST_DATABASE_URL not set")
	}
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	db.SetMaxOpenConns(1)
	ctx := context.Background()
	_, err = db.ExecContext(ctx, `CREATE TEMP TABLE channel_monitors (id bigint, provider text);
	CREATE TEMP TABLE groups (id bigint, rate_multiplier float8);
	CREATE TEMP TABLE channel_monitor_provider_order (provider text, sort_order integer);
	CREATE TEMP TABLE channel_monitor_display_configs (monitor_id bigint, group_id bigint, display_rate float8, sort_order integer);
	CREATE TEMP TABLE usage_logs (group_id bigint, created_at timestamptz, input_tokens bigint, cache_creation_tokens bigint, cache_read_tokens bigint, first_token_ms integer, actual_cost numeric);
	INSERT INTO channel_monitors VALUES (1, 'openai'), (2, 'openai'), (3, 'gemini'), (4, 'openai');
	INSERT INTO groups VALUES (42, 0.2);
	INSERT INTO channel_monitor_provider_order VALUES ('openai', -2);
	INSERT INTO channel_monitor_display_configs VALUES (1, 42, 0, 4), (2, 42, NULL, 2), (3, 99, 1.5, 0);
	INSERT INTO usage_logs VALUES (42, now() - interval '5 minutes', 20, 10, 70, 2000, 1), (42, now() - interval '2 days', 20, 0, 80, 10000, 1), (42, now(), 0, 0, 1000, 9000, 0), (42, now() - interval '4 days', 1000, 0, 0, 5000, 1)`)
	if err != nil {
		t.Fatal(err)
	}
	got, err := (&channelMonitorRepository{db: db}).ListMonitorDisplayMetrics(ctx, []int64{1, 2, 3, 4})
	if err != nil {
		t.Fatal(err)
	}
	for _, id := range []int64{1, 2} {
		m := got[id]
		if m.CacheRate == nil || math.Abs(*m.CacheRate-75) > 0.001 || m.FirstTokenMs == nil || *m.FirstTokenMs != 2000 {
			t.Fatalf("id %d: %+v", id, m)
		}
	}
	if got[1].DisplayRate == nil || *got[1].DisplayRate != 0 {
		t.Fatalf("zero rate lost: %+v", got[1])
	}
	if got[3].CacheRate != nil || got[3].FirstTokenMs != nil {
		t.Fatalf("empty group: %+v", got[3])
	}
	if got[2].DisplayRate == nil || *got[2].DisplayRate != 0.2 || got[2].ProviderOrder != -2 || got[2].SortOrder != 2 || got[4].ProviderOrder != -2 {
		t.Fatalf("unexpected order or fallback rate: %+v %+v", got[2], got[4])
	}
}
