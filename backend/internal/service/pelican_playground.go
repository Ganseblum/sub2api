package service

import (
	"context"
	"fmt"
	"net/url"
	"strings"
	"time"
)

const (
	PelicanPlaygroundHistoryLimit   = 50
	PelicanPlaygroundRetention      = 72 * time.Hour
	PelicanPlaygroundMaxPromptRunes = 50000
)

type PelicanPlaygroundRequest struct {
	Endpoint string `json:"endpoint"`
	APIKey   string `json:"api_key"`
	Model    string `json:"model"`
	APIMode  string `json:"api_mode"`
	Prompt   string `json:"prompt"`
}

type PelicanPlaygroundResult struct {
	ID           int64     `json:"id"`
	Endpoint     string    `json:"endpoint"`
	Model        string    `json:"model"`
	APIKeyMasked string    `json:"api_key_masked"`
	Prompt       string    `json:"prompt"`
	Status       string    `json:"status"`
	Content      string    `json:"content"`
	Artifact     string    `json:"artifact,omitempty"`
	Message      string    `json:"message,omitempty"`
	SourceLength int       `json:"source_length"`
	StartedAt    time.Time `json:"started_at"`
	FinishedAt   time.Time `json:"finished_at"`
	ExpiresAt    time.Time `json:"expires_at"`
}

type PelicanPlaygroundRepository interface {
	SavePelicanPlaygroundResult(context.Context, *PelicanPlaygroundResult, int64) error
	ListPelicanPlaygroundResults(context.Context, int64, int) ([]PelicanPlaygroundResult, error)
	DeleteExpiredPelicanPlaygroundResults(context.Context) (int64, error)
}

func (s *ChannelMonitorService) RunPelicanPlayground(ctx context.Context, userID int64, request PelicanPlaygroundRequest) (*PelicanPlaygroundResult, error) {
	request.Endpoint = strings.TrimSpace(request.Endpoint)
	request.APIKey = strings.TrimSpace(request.APIKey)
	request.Model = strings.TrimSpace(request.Model)
	request.Prompt = strings.TrimSpace(request.Prompt)
	parsedEndpoint, parseErr := url.Parse(request.Endpoint)
	if parseErr != nil || parsedEndpoint.User != nil {
		return nil, fmt.Errorf("endpoint must not contain embedded credentials")
	}
	if err := validateEndpoint(request.Endpoint); err != nil {
		return nil, err
	}
	if request.APIKey == "" || len(request.APIKey) > 2000 {
		return nil, fmt.Errorf("an API key is required")
	}
	if request.Model == "" || len(request.Model) > 200 {
		return nil, fmt.Errorf("a model is required")
	}
	if request.Prompt == "" || len([]rune(request.Prompt)) > PelicanPlaygroundMaxPromptRunes {
		return nil, fmt.Errorf("prompt must contain 1 to 50000 characters")
	}
	if request.APIMode == "" {
		request.APIMode = MonitorAPIModeChatCompletions
	}
	if request.APIMode != MonitorAPIModeChatCompletions && request.APIMode != MonitorAPIModeResponses {
		return nil, fmt.Errorf("unsupported API mode")
	}
	repo, ok := s.repo.(PelicanPlaygroundRepository)
	if !ok {
		return nil, fmt.Errorf("playground repository unavailable")
	}
	started := time.Now().UTC()
	requestCtx, cancel := context.WithTimeout(ctx, 10*time.Minute)
	defer cancel()
	content, requestErr := requestPelicanPrompt(requestCtx, request.Endpoint, request.APIKey, request.Model, request.APIMode, nil, request.Prompt)
	result := &PelicanPlaygroundResult{Endpoint: request.Endpoint, Model: request.Model, APIKeyMasked: maskPlaygroundAPIKey(request.APIKey), Prompt: request.Prompt, Status: "error", StartedAt: started, FinishedAt: time.Now().UTC(), ExpiresAt: time.Now().UTC().Add(PelicanPlaygroundRetention)}
	if requestErr != nil {
		result.Message = "Model request failed"
	} else {
		result.Content = content
		evaluation := evaluatePelican(content)
		result.Artifact = evaluation.HTML
		result.SourceLength = evaluation.Runes
		result.Status = "failed"
		if evaluation.Passed {
			result.Status = "passed"
		}
	}
	if err := repo.SavePelicanPlaygroundResult(ctx, result, userID); err != nil {
		return nil, err
	}
	return result, nil
}

func (s *ChannelMonitorService) ListPelicanPlaygroundResults(ctx context.Context, userID int64) ([]PelicanPlaygroundResult, error) {
	repo, ok := s.repo.(PelicanPlaygroundRepository)
	if !ok {
		return nil, fmt.Errorf("playground repository unavailable")
	}
	if _, err := repo.DeleteExpiredPelicanPlaygroundResults(ctx); err != nil {
		return nil, err
	}
	return repo.ListPelicanPlaygroundResults(ctx, userID, PelicanPlaygroundHistoryLimit)
}

func (s *ChannelMonitorService) CleanupPelicanPlaygroundResults(ctx context.Context) error {
	repo, ok := s.repo.(PelicanPlaygroundRepository)
	if !ok {
		return fmt.Errorf("playground repository unavailable")
	}
	_, err := repo.DeleteExpiredPelicanPlaygroundResults(ctx)
	return err
}

func maskPlaygroundAPIKey(key string) string {
	if len(key) <= 7 {
		return "••••"
	}
	return key[:4] + "••••" + key[len(key)-3:]
}
