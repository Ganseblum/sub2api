package service

import (
	"context"
	"fmt"
	"math"
)

type MonitorDisplayConfig struct {
	GroupID     *int64   `json:"group_id"`
	DisplayRate *float64 `json:"display_rate"`
	SortOrder   int      `json:"sort_order"`
}

type MonitorDisplayMetrics struct {
	CacheRate     *float64 `json:"cache_rate"`
	FirstTokenMs  *float64 `json:"first_token_ms"`
	DisplayRate   *float64 `json:"display_rate"`
	SortOrder     int      `json:"sort_order"`
	ProviderOrder int      `json:"provider_order"`
}

type MonitorProviderOrder struct {
	Provider  string `json:"provider"`
	SortOrder int    `json:"sort_order"`
}

type MonitorDisplayRepository interface {
	GetMonitorDisplayConfig(context.Context, int64) (MonitorDisplayConfig, error)
	SetMonitorDisplayConfig(context.Context, int64, MonitorDisplayConfig) error
	ListMonitorDisplayMetrics(context.Context, []int64) (map[int64]MonitorDisplayMetrics, error)
	GetMonitorProviderOrders(context.Context) ([]MonitorProviderOrder, error)
	SetMonitorProviderOrders(context.Context, []MonitorProviderOrder) error
}

func (s *ChannelMonitorService) GetMonitorProviderOrders(ctx context.Context) ([]MonitorProviderOrder, error) {
	repo, ok := s.repo.(MonitorDisplayRepository)
	if !ok {
		return nil, fmt.Errorf("display repository unavailable")
	}
	return repo.GetMonitorProviderOrders(ctx)
}

func (s *ChannelMonitorService) SetMonitorProviderOrders(ctx context.Context, orders []MonitorProviderOrder) error {
	allowed := map[string]bool{"openai": true, "anthropic": true, "gemini": true, "grok": true, "antigravity": true, "kimi": true, "zhipu": true, "deepseek": true, "minimax": true, "opencode_go": true}
	seen := map[string]bool{}
	for _, item := range orders {
		if !allowed[item.Provider] || seen[item.Provider] || item.SortOrder < -10000 || item.SortOrder > 10000 {
			return fmt.Errorf("invalid provider order")
		}
		seen[item.Provider] = true
	}
	repo, ok := s.repo.(MonitorDisplayRepository)
	if !ok {
		return fmt.Errorf("display repository unavailable")
	}
	return repo.SetMonitorProviderOrders(ctx, orders)
}

func (s *ChannelMonitorService) GetMonitorDisplayConfig(ctx context.Context, id int64) (MonitorDisplayConfig, error) {
	if _, err := s.repo.GetByID(ctx, id); err != nil {
		return MonitorDisplayConfig{}, err
	}
	repo, ok := s.repo.(MonitorDisplayRepository)
	if !ok {
		return MonitorDisplayConfig{}, fmt.Errorf("display repository unavailable")
	}
	return repo.GetMonitorDisplayConfig(ctx, id)
}

func (s *ChannelMonitorService) SetMonitorDisplayConfig(ctx context.Context, id int64, config MonitorDisplayConfig) error {
	if _, err := s.repo.GetByID(ctx, id); err != nil {
		return err
	}
	if config.GroupID != nil && *config.GroupID <= 0 {
		return fmt.Errorf("invalid group")
	}
	if config.SortOrder < -10000 || config.SortOrder > 10000 {
		return fmt.Errorf("invalid sort order")
	}
	if config.DisplayRate != nil && (math.IsNaN(*config.DisplayRate) || math.IsInf(*config.DisplayRate, 0) || *config.DisplayRate < 0 || *config.DisplayRate > 100000) {
		return fmt.Errorf("invalid display rate")
	}
	repo, ok := s.repo.(MonitorDisplayRepository)
	if !ok {
		return fmt.Errorf("display repository unavailable")
	}
	return repo.SetMonitorDisplayConfig(ctx, id, config)
}
