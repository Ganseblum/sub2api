package service

import (
	"context"
	"time"
)

// PelicanConfig is deliberately separate from the ordinary availability probe.
type PelicanConfig struct {
	Enabled         bool     `json:"enabled"`
	IntervalSeconds int      `json:"interval_seconds"`
	Models          []string `json:"models"`
}

type PelicanResult struct {
	ID           int64     `json:"id"`
	MonitorID    int64     `json:"monitor_id"`
	Model        string    `json:"model"`
	Status       string    `json:"status"`
	SourceLength int       `json:"source_length"`
	Artifact     string    `json:"artifact,omitempty"`
	Message      string    `json:"message,omitempty"`
	StartedAt    time.Time `json:"started_at"`
	FinishedAt   time.Time `json:"finished_at"`
}

// PelicanRepository is optional for tests with lightweight monitor stubs.
type PelicanRepository interface {
	GetPelicanConfig(context.Context, int64) (PelicanConfig, error)
	SetPelicanConfig(context.Context, int64, PelicanConfig) error
	SavePelicanResult(context.Context, *PelicanResult) error
	ListPelicanResults(context.Context, int64) ([]PelicanResult, error)
	PelicanLastStarted(context.Context, int64) (map[string]time.Time, error)
	TryLockPelican(context.Context, int64) (func(), bool, error)
}
