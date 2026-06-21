package service

import (
	"context"
	"fmt"
	"strings"
	"time"
)

const (
	OpsAnalyticsDimensionAccount = "account"
	OpsAnalyticsDimensionGroup   = "group"
)

type OpsAnalyticsFilter struct {
	StartTime time.Time
	EndTime   time.Time

	Dimension string
	Platform  string
	GroupID   *int64
	AccountID *int64
	Model     string

	Sort  string
	Limit int
}

type OpsAnalyticsLatencySummary struct {
	Min     *int  `json:"min_ms"`
	Max     *int  `json:"max_ms"`
	Avg     *int  `json:"avg_ms"`
	P95     *int  `json:"p95_ms"`
	P99     *int  `json:"p99_ms"`
	Samples int64 `json:"samples"`
}

type OpsAnalyticsRow struct {
	Dimension string `json:"dimension"`

	ID       *int64 `json:"id"`
	Name     string `json:"name"`
	Platform string `json:"platform"`

	RequestCount         int64 `json:"request_count"`
	SuccessCount         int64 `json:"success_count"`
	ErrorCount           int64 `json:"error_count"`
	BusinessLimitedCount int64 `json:"business_limited_count"`
	TokenConsumed        int64 `json:"token_consumed"`

	ErrorRate float64 `json:"error_rate"`

	Duration OpsAnalyticsLatencySummary `json:"duration"`
	TTFT     OpsAnalyticsLatencySummary `json:"ttft"`
}

type OpsAnalyticsResponse struct {
	StartTime time.Time `json:"start_time"`
	EndTime   time.Time `json:"end_time"`

	Dimension string `json:"dimension"`
	Platform  string `json:"platform"`
	GroupID   *int64 `json:"group_id"`
	AccountID *int64 `json:"account_id"`
	Model     string `json:"model"`

	Rows []*OpsAnalyticsRow `json:"rows"`
}

func (f *OpsAnalyticsFilter) Normalize() {
	if f == nil {
		return
	}
	f.Dimension = strings.ToLower(strings.TrimSpace(f.Dimension))
	if f.Dimension == "" {
		f.Dimension = OpsAnalyticsDimensionAccount
	}
	f.Platform = strings.TrimSpace(strings.ToLower(f.Platform))
	f.Model = strings.TrimSpace(f.Model)
	f.Sort = strings.TrimSpace(strings.ToLower(f.Sort))
	if f.Limit <= 0 {
		f.Limit = 100
	}
	if f.Limit > 200 {
		f.Limit = 200
	}
	if f.StartTime.After(f.EndTime) {
		f.StartTime, f.EndTime = f.EndTime, f.StartTime
	}
}

func (f *OpsAnalyticsFilter) ValidDimension() bool {
	if f == nil {
		return true
	}
	switch strings.ToLower(strings.TrimSpace(f.Dimension)) {
	case "", OpsAnalyticsDimensionAccount, OpsAnalyticsDimensionGroup:
		return true
	default:
		return false
	}
}

func (s *OpsService) GetAnalytics(ctx context.Context, filter *OpsAnalyticsFilter) (*OpsAnalyticsResponse, error) {
	if err := s.RequireMonitoringEnabled(ctx); err != nil {
		return nil, err
	}
	if filter == nil {
		filter = &OpsAnalyticsFilter{}
	}
	if !filter.ValidDimension() {
		return nil, fmt.Errorf("invalid dimension")
	}

	filterCopy := *filter
	filterCopy.Normalize()
	if s.opsRepo == nil {
		return &OpsAnalyticsResponse{
			StartTime: filterCopy.StartTime,
			EndTime:   filterCopy.EndTime,
			Dimension: filterCopy.Dimension,
			Platform:  filterCopy.Platform,
			GroupID:   filterCopy.GroupID,
			AccountID: filterCopy.AccountID,
			Model:     filterCopy.Model,
			Rows:      []*OpsAnalyticsRow{},
		}, nil
	}

	rows, err := s.opsRepo.GetAnalytics(ctx, &filterCopy)
	if err != nil {
		return nil, err
	}
	if rows == nil {
		rows = []*OpsAnalyticsRow{}
	}

	return &OpsAnalyticsResponse{
		StartTime: filterCopy.StartTime,
		EndTime:   filterCopy.EndTime,

		Dimension: filterCopy.Dimension,
		Platform:  filterCopy.Platform,
		GroupID:   filterCopy.GroupID,
		AccountID: filterCopy.AccountID,
		Model:     filterCopy.Model,

		Rows: rows,
	}, nil
}
