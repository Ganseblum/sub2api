package service

import (
	"context"
	"strings"
	"testing"
	"time"
)

type pelicanRepoStub struct {
	ChannelMonitorRepository
	monitor *ChannelMonitor
	config  PelicanConfig
	writes  int
}

func (r *pelicanRepoStub) GetByID(_ context.Context, _ int64) (*ChannelMonitor, error) {
	return r.monitor, nil
}
func (r *pelicanRepoStub) GetPelicanConfig(context.Context, int64) (PelicanConfig, error) {
	return r.config, nil
}
func (r *pelicanRepoStub) SetPelicanConfig(_ context.Context, _ int64, c PelicanConfig) error {
	r.config = c
	r.writes++
	return nil
}
func (r *pelicanRepoStub) SavePelicanResult(context.Context, *PelicanResult) error { return nil }
func (r *pelicanRepoStub) ListPelicanResults(context.Context, int64) ([]PelicanResult, error) {
	return nil, nil
}
func (r *pelicanRepoStub) PelicanLastStarted(context.Context, int64) (map[string]time.Time, error) {
	return nil, nil
}
func (r *pelicanRepoStub) TryLockPelican(context.Context, int64) (func(), bool, error) {
	return func() {}, true, nil
}

func TestPelicanConfiguration(t *testing.T) {
	repo := &pelicanRepoStub{monitor: &ChannelMonitor{Provider: MonitorProviderOpenAI, CheckMode: MonitorCheckModeProbe, PrimaryModel: "gpt-test"}}
	svc := NewChannelMonitorService(repo, nil)
	ctx := context.Background()
	if err := svc.SetPelicanConfig(ctx, 1, PelicanConfig{Enabled: true, IntervalSeconds: 1800}); err != nil {
		t.Fatal(err)
	}
	if repo.writes != 1 || !repo.config.Enabled || len(repo.config.Models) != 2 || repo.config.Models[0] != "gpt-6-astra" || repo.config.Models[1] != "gpt-test" {
		t.Fatal("valid configuration was not stored")
	}
	if err := svc.SetPelicanConfig(ctx, 1, PelicanConfig{Enabled: true, IntervalSeconds: 120}); err == nil {
		t.Fatal("invalid interval accepted")
	}
	repo.monitor.Provider = MonitorProviderAnthropic
	if err := svc.SetPelicanConfig(ctx, 1, PelicanConfig{Enabled: true, IntervalSeconds: 600}); err == nil {
		t.Fatal("non-OpenAI provider accepted")
	}
	repo.monitor.Provider = MonitorProviderOpenAI
	repo.monitor.CheckMode = MonitorCheckModeQuota
	if err := svc.SetPelicanConfig(ctx, 1, PelicanConfig{Enabled: true, IntervalSeconds: 600}); err == nil {
		t.Fatal("quota-only monitor accepted")
	}
	repo.monitor.CheckMode = MonitorCheckModeProbe
	if err := svc.SetPelicanConfig(ctx, 1, PelicanConfig{Enabled: true, IntervalSeconds: 600, Models: []string{"claude-test"}}); err == nil {
		t.Fatal("non-GPT model accepted")
	}
	if err := svc.SetPelicanConfig(ctx, 1, PelicanConfig{Enabled: true, IntervalSeconds: 600, Models: []string{"gpt-a", "gpt-b", "gpt-c", "gpt-d", "gpt-e", "gpt-f"}}); err == nil {
		t.Fatal("more than five models accepted")
	}
	if repo.writes != 1 {
		t.Fatal("invalid configuration was stored")
	}
}

func TestDefaultPelicanModelsSkipsNonGPTModels(t *testing.T) {
	monitor := &ChannelMonitor{PrimaryModel: "gpt-a", ExtraModels: []string{"other-model", "gpt-b", "gpt-a"}}
	models := defaultPelicanModels(monitor)
	if len(models) != 3 || models[0] != "gpt-6-astra" || models[1] != "gpt-a" || models[2] != "gpt-b" {
		t.Fatalf("unexpected default GPT models: %v", models)
	}
}

func TestEvaluatePelican(t *testing.T) {
	long := "<!doctype html><html><body><svg xmlns=\"http://www.w3.org/2000/svg\"><text>" + strings.Repeat("鹈", 9000) + "</text></svg></body></html>"
	for _, tc := range []struct {
		name, input string
		valid, pass bool
	}{
		{"valid long fenced response", "```html\n" + long + "\n```", true, true},
		{"valid short", "<html><svg><circle/></svg></html>", true, false},
		{"malformed long", "<html><svg><g>" + strings.Repeat("x", 9000) + "</svg></html>", false, false},
		{"no svg", strings.Repeat("x", 9000), false, false},
		{"directive rejected", "<html><svg><!DOCTYPE svg><g/></svg></html>", false, false},
		{"invalid utf8 rejected", "<html><svg>\xff</svg></html>", false, false},
		{"svg without html rejected", "<svg>" + strings.Repeat("x", 9000) + "</svg>", false, false},
	} {
		t.Run(tc.name, func(t *testing.T) {
			got := evaluatePelican(tc.input)
			if got.ValidSVG != tc.valid || got.Passed != tc.pass {
				t.Fatalf("got valid=%v passed=%v, want %v %v", got.ValidSVG, got.Passed, tc.valid, tc.pass)
			}
		})
	}
}
