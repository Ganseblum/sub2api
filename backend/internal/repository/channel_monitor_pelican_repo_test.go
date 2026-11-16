package repository

import (
	"context"
	"database/sql"
	"os"
	"testing"
	"time"

	"github.com/Wei-Shaw/sub2api/internal/service"
)

func TestPelicanRepositoryRetention(t *testing.T) {
	dsn := os.Getenv("PELICAN_TEST_DATABASE_URL")
	if dsn == "" {
		t.Skip("PELICAN_TEST_DATABASE_URL not set")
	}
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	ctx := context.Background()
	var id int64
	err = db.QueryRowContext(ctx, `INSERT INTO channel_monitors (name,provider,endpoint,api_key_encrypted,primary_model,enabled,interval_seconds,created_by) VALUES ('pelican-test','openai','https://example.com','test','gpt-test',false,60,1) RETURNING id`).Scan(&id)
	if err != nil {
		t.Fatal(err)
	}
	defer func() { _, _ = db.ExecContext(ctx, `DELETE FROM channel_monitors WHERE id=$1`, id) }()
	repo := &channelMonitorRepository{db: db}
	if err := repo.SetPelicanConfig(ctx, id, service.PelicanConfig{Enabled: true, IntervalSeconds: 600, Models: []string{"gpt-test", "gpt-test-2"}}); err != nil {
		t.Fatal(err)
	}
	config, err := repo.GetPelicanConfig(ctx, id)
	if err != nil || !config.Enabled || config.IntervalSeconds != 600 || len(config.Models) != 2 || config.Models[1] != "gpt-test-2" {
		t.Fatalf("unexpected config: %+v, %v", config, err)
	}
	base := time.Now().Add(-time.Hour)
	for i := 0; i < 12; i++ {
		when := base.Add(time.Duration(i) * time.Minute)
		item := &service.PelicanResult{MonitorID: id, Model: "gpt-test", Status: "passed", Artifact: "example", StartedAt: when, FinishedAt: when}
		if err := repo.SavePelicanResult(ctx, item); err != nil {
			t.Fatal(err)
		}
	}
	items, err := repo.ListPelicanResults(ctx, id)
	if err != nil {
		t.Fatal(err)
	}
	if len(items) != 10 || !items[0].StartedAt.Equal(base.Add(11*time.Minute)) || !items[9].StartedAt.Equal(base.Add(2*time.Minute)) {
		t.Fatalf("expected latest ten ordered results, got %d", len(items))
	}
	release, acquired, err := repo.TryLockPelican(ctx, id)
	if err != nil || !acquired {
		t.Fatalf("first lock: %v %v", acquired, err)
	}
	_, acquired, err = repo.TryLockPelican(ctx, id)
	if err != nil || acquired {
		release()
		t.Fatalf("second lock: %v %v", acquired, err)
	}
	release()
}
