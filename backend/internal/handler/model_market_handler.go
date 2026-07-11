package handler

import (
	"sort"
	"strings"

	"github.com/Wei-Shaw/sub2api/internal/pkg/response"
	"github.com/Wei-Shaw/sub2api/internal/server/middleware"
	"github.com/Wei-Shaw/sub2api/internal/service"

	"github.com/gin-gonic/gin"
)

// ModelMarketHandler serves the logged-in model pricing view.
type ModelMarketHandler struct {
	pricingService *service.PricingService
	apiKeyService  *service.APIKeyService
}

// NewModelMarketHandler creates a model market handler.
func NewModelMarketHandler(pricingService *service.PricingService, apiKeyService *service.APIKeyService) *ModelMarketHandler {
	return &ModelMarketHandler{
		pricingService: pricingService,
		apiKeyService:  apiKeyService,
	}
}

type modelMarketSpec struct {
	ID              string
	DisplayName     string
	DisplayOrder    int
	Family          string
	Provider        string
	DisplayProvider string
	Tier            string
	GroupPlatforms  []string
	// PricingID is the model ID used to look up pricing when the canonical ID
	// is not present in the catalog. The response still uses ID/DisplayName so
	// users see the exact model name while prices are shown from the closest
	// available entry.
	PricingID string
}

// modelMarketSpecs is the curated model list for the market page. Keep it in
// one place so it can be moved to runtime settings later without touching the
// response shape or frontend. Higher DisplayOrder means newer/recommended and
// is surfaced first by default.
var modelMarketSpecs = []modelMarketSpec{
	// Claude — newest first
	{ID: "claude-opus-4-6-thinking", DisplayName: "Claude Opus 4.6 Thinking", DisplayOrder: 2600, Family: "claude", Provider: service.PlatformAnthropic, DisplayProvider: "Claude", Tier: "opus", GroupPlatforms: []string{service.PlatformAnthropic, service.PlatformAntigravity}},
	{ID: "claude-opus-4-6", DisplayName: "Claude Opus 4.6", DisplayOrder: 2550, Family: "claude", Provider: service.PlatformAnthropic, DisplayProvider: "Claude", Tier: "opus", GroupPlatforms: []string{service.PlatformAnthropic, service.PlatformAntigravity}},
	{ID: "claude-opus-4-7", DisplayName: "Claude Opus 4.7", DisplayOrder: 2500, Family: "claude", Provider: service.PlatformAnthropic, DisplayProvider: "Claude", Tier: "opus", GroupPlatforms: []string{service.PlatformAnthropic, service.PlatformAntigravity}},
	{ID: "claude-opus-4-8", DisplayName: "Claude Opus 4.8", DisplayOrder: 2450, Family: "claude", Provider: service.PlatformAnthropic, DisplayProvider: "Claude", Tier: "opus", GroupPlatforms: []string{service.PlatformAnthropic, service.PlatformAntigravity}},
	{ID: "claude-fable-5", DisplayName: "Claude Code (Fable 5)", DisplayOrder: 2400, Family: "claude", Provider: service.PlatformAnthropic, DisplayProvider: "Claude", Tier: "fable", GroupPlatforms: []string{service.PlatformAnthropic, service.PlatformAntigravity}},
	{ID: "claude-sonnet-5", DisplayName: "Claude Sonnet 5", DisplayOrder: 2350, Family: "claude", Provider: service.PlatformAnthropic, DisplayProvider: "Claude", Tier: "sonnet", GroupPlatforms: []string{service.PlatformAnthropic, service.PlatformAntigravity}},
	{ID: "claude-sonnet-4-6", DisplayName: "Claude Sonnet 4.6", DisplayOrder: 2300, Family: "claude", Provider: service.PlatformAnthropic, DisplayProvider: "Claude", Tier: "sonnet", GroupPlatforms: []string{service.PlatformAnthropic, service.PlatformAntigravity}},
	{ID: "claude-haiku-4-5", DisplayName: "Claude Haiku 4.5", DisplayOrder: 2200, Family: "claude", Provider: service.PlatformAnthropic, DisplayProvider: "Claude", Tier: "haiku", GroupPlatforms: []string{service.PlatformAnthropic, service.PlatformAntigravity}},

	// Gemini — newest first (3.5 / 3.1 / 3.0 series)
	{ID: "gemini-3.5-flash", DisplayName: "Gemini 3.5 Flash", DisplayOrder: 2150, Family: "gemini", Provider: service.PlatformGemini, DisplayProvider: "Gemini", Tier: "flagship", GroupPlatforms: []string{service.PlatformGemini}},
	{ID: "gemini-3.5-flash-low", DisplayName: "Gemini 3.5 Flash Low", DisplayOrder: 2125, Family: "gemini", Provider: service.PlatformGemini, DisplayProvider: "Gemini", Tier: "standard", GroupPlatforms: []string{service.PlatformGemini}, PricingID: "gemini-3.5-flash"},
	{ID: "gemini-3.1-pro-preview", DisplayName: "Gemini 3.1 Pro Preview", DisplayOrder: 2100, Family: "gemini", Provider: service.PlatformGemini, DisplayProvider: "Gemini", Tier: "flagship", GroupPlatforms: []string{service.PlatformGemini}},
	{ID: "gemini-3.1-pro-preview-thinking-128", DisplayName: "Gemini 3.1 Pro Preview Thinking 128K", DisplayOrder: 2050, Family: "gemini", Provider: service.PlatformGemini, DisplayProvider: "Gemini", Tier: "flagship", GroupPlatforms: []string{service.PlatformGemini}, PricingID: "gemini-3.1-pro-preview"},
	{ID: "gemini-3.1-flash", DisplayName: "Gemini 3.1 Flash", DisplayOrder: 2000, Family: "gemini", Provider: service.PlatformGemini, DisplayProvider: "Gemini", Tier: "standard", GroupPlatforms: []string{service.PlatformGemini}, PricingID: "gemini-3.1-flash-lite"},
	{ID: "gemini-3.1-flash-image", DisplayName: "Gemini 3.1 Flash Image", DisplayOrder: 1950, Family: "gemini", Provider: service.PlatformGemini, DisplayProvider: "Gemini", Tier: "standard", GroupPlatforms: []string{service.PlatformGemini}},
	{ID: "gemini-3-flash", DisplayName: "Gemini 3 Flash", DisplayOrder: 1900, Family: "gemini", Provider: service.PlatformGemini, DisplayProvider: "Gemini", Tier: "standard", GroupPlatforms: []string{service.PlatformGemini}},
	{ID: "gemini-3-flash-thinking-128", DisplayName: "Gemini 3 Flash Thinking 128K", DisplayOrder: 1850, Family: "gemini", Provider: service.PlatformGemini, DisplayProvider: "Gemini", Tier: "standard", GroupPlatforms: []string{service.PlatformGemini}, PricingID: "gemini-3-flash"},
	{ID: "gemini-3-pro", DisplayName: "Gemini 3 Pro", DisplayOrder: 1800, Family: "gemini", Provider: service.PlatformGemini, DisplayProvider: "Gemini", Tier: "flagship", GroupPlatforms: []string{service.PlatformGemini}, PricingID: "gemini-3-pro-preview"},
	{ID: "gemini-3-pro-preview", DisplayName: "Gemini 3 Pro Preview", DisplayOrder: 1750, Family: "gemini", Provider: service.PlatformGemini, DisplayProvider: "Gemini", Tier: "flagship", GroupPlatforms: []string{service.PlatformGemini}},

	// OpenAI GPT
	{ID: "gpt-5.6-sol", DisplayName: "GPT-5.6 Sol", DisplayOrder: 900, Family: "gpt", Provider: service.PlatformOpenAI, DisplayProvider: "OpenAI", Tier: "flagship", GroupPlatforms: []string{service.PlatformOpenAI}},
	{ID: "gpt-5.6-terra", DisplayName: "GPT-5.6 Terra", DisplayOrder: 850, Family: "gpt", Provider: service.PlatformOpenAI, DisplayProvider: "OpenAI", Tier: "standard", GroupPlatforms: []string{service.PlatformOpenAI}},
	{ID: "gpt-5.6-luna", DisplayName: "GPT-5.6 Luna", DisplayOrder: 800, Family: "gpt", Provider: service.PlatformOpenAI, DisplayProvider: "OpenAI", Tier: "mini", GroupPlatforms: []string{service.PlatformOpenAI}},
	{ID: "gpt-5.5", DisplayName: "GPT-5.5", DisplayOrder: 700, Family: "gpt", Provider: service.PlatformOpenAI, DisplayProvider: "OpenAI", Tier: "flagship", GroupPlatforms: []string{service.PlatformOpenAI}},
	{ID: "gpt-5.4", DisplayName: "GPT-5.4", DisplayOrder: 600, Family: "gpt", Provider: service.PlatformOpenAI, DisplayProvider: "OpenAI", Tier: "flagship", GroupPlatforms: []string{service.PlatformOpenAI}},
}

type modelMarketResponse struct {
	Models []modelMarketModelDTO `json:"models"`
	Groups []modelMarketGroupDTO `json:"groups"`
	Meta   modelMarketMetaDTO    `json:"meta"`
}

type modelMarketMetaDTO struct {
	Unit        string `json:"unit"`
	PriceSource string `json:"price_source"`
}

type modelMarketModelDTO struct {
	ID              string                     `json:"id"`
	Name            string                     `json:"name"`
	DisplayOrder    int                        `json:"display_order"`
	Family          string                     `json:"family"`
	Provider        string                     `json:"provider"`
	DisplayProvider string                     `json:"display_provider"`
	Tier            string                     `json:"tier"`
	Mode            string                     `json:"mode"`
	Source          string                     `json:"source"`
	Pricing         modelMarketPricingDTO      `json:"pricing"`
	Context         modelMarketContextDTO      `json:"context"`
	Capabilities    []string                   `json:"capabilities"`
	GroupPlatforms  []string                   `json:"group_platforms"`
	Groups          []modelMarketGroupPriceDTO `json:"groups"`
	LowestGroup     *modelMarketGroupPriceDTO  `json:"lowest_group"`
}

type modelMarketContextDTO struct {
	MaxInputTokens  int `json:"max_input_tokens"`
	MaxOutputTokens int `json:"max_output_tokens"`
	MaxTokens       int `json:"max_tokens"`
}

type modelMarketPricingDTO struct {
	InputPer1M        *float64 `json:"input_per_1m"`
	OutputPer1M       *float64 `json:"output_per_1m"`
	CacheWritePer1M   *float64 `json:"cache_write_per_1m"`
	CacheWrite1hPer1M *float64 `json:"cache_write_1h_per_1m"`
	CacheReadPer1M    *float64 `json:"cache_read_per_1m"`
	ImageOutputPer1M  *float64 `json:"image_output_per_1m"`
	PerRequest        *float64 `json:"per_request"`
}

type modelMarketGroupDTO struct {
	ID                 int64    `json:"id"`
	Name               string   `json:"name"`
	Platform           string   `json:"platform"`
	SubscriptionType   string   `json:"subscription_type"`
	RateMultiplier     float64  `json:"rate_multiplier"`
	UserRateMultiplier *float64 `json:"user_rate_multiplier"`
	EffectiveRate      float64  `json:"effective_rate"`
	IsExclusive        bool     `json:"is_exclusive"`
}

type modelMarketGroupPriceDTO struct {
	Group   modelMarketGroupDTO   `json:"group"`
	Pricing modelMarketPricingDTO `json:"pricing"`
}

// List returns curated OpenAI GPT, Claude and Gemini model pricing for the current user.
// GET /api/v1/model-market
func (h *ModelMarketHandler) List(c *gin.Context) {
	subject, ok := middleware.GetAuthSubjectFromContext(c)
	if !ok {
		response.Unauthorized(c, "User not authenticated")
		return
	}
	if h.pricingService == nil || h.apiKeyService == nil {
		response.Success(c, modelMarketResponse{
			Models: []modelMarketModelDTO{},
			Groups: []modelMarketGroupDTO{},
			Meta:   modelMarketMetaDTO{Unit: "USD / 1M tokens", PriceSource: "litellm"},
		})
		return
	}

	groups, err := h.apiKeyService.GetAvailableGroups(c.Request.Context(), subject.UserID)
	if err != nil {
		response.ErrorFrom(c, err)
		return
	}
	userRates, err := h.apiKeyService.GetUserGroupRates(c.Request.Context(), subject.UserID)
	if err != nil {
		response.ErrorFrom(c, err)
		return
	}

	marketGroups := toModelMarketGroups(groups, userRates)
	models := make([]modelMarketModelDTO, 0, len(modelMarketSpecs))
	for _, spec := range modelMarketSpecs {
		pricingID := spec.PricingID
		if pricingID == "" {
			pricingID = spec.ID
		}
		pricing := h.pricingService.GetModelPricing(pricingID)
		if pricing == nil {
			continue
		}
		exact := h.pricingService.HasExactModelPricing(spec.ID)
		if !exact && spec.Family == "claude" {
			continue
		}

		basePricing := toModelMarketPricing(pricing)
		groupPrices := groupPricesForModel(basePricing, marketGroups, spec.GroupPlatforms)
		model := modelMarketModelDTO{
			ID:              spec.ID,
			Name:            spec.DisplayName,
			DisplayOrder:    spec.DisplayOrder,
			Family:          spec.Family,
			Provider:        firstNonEmpty(strings.ToLower(pricing.LiteLLMProvider), spec.Provider),
			DisplayProvider: spec.DisplayProvider,
			Tier:            spec.Tier,
			Mode:            firstNonEmpty(pricing.Mode, "chat"),
			Source:          pricingSource(exact),
			Pricing:         basePricing,
			Context: modelMarketContextDTO{
				MaxInputTokens:  pricing.MaxInputTokens,
				MaxOutputTokens: pricing.MaxOutputTokens,
				MaxTokens:       pricing.MaxTokens,
			},
			Capabilities:   capabilitiesForModel(spec, pricing),
			GroupPlatforms: append([]string(nil), spec.GroupPlatforms...),
			Groups:         groupPrices,
		}
		if len(groupPrices) > 0 {
			lowest := groupPrices[0]
			model.LowestGroup = &lowest
		}
		models = append(models, model)
	}

	sort.SliceStable(models, func(i, j int) bool {
		return models[i].DisplayOrder > models[j].DisplayOrder
	})

	response.Success(c, modelMarketResponse{
		Models: models,
		Groups: marketGroups,
		Meta: modelMarketMetaDTO{
			Unit:        "USD / 1M tokens",
			PriceSource: "litellm",
		},
	})
}

func toModelMarketGroups(groups []service.Group, userRates map[int64]float64) []modelMarketGroupDTO {
	out := make([]modelMarketGroupDTO, 0, len(groups))
	for _, group := range groups {
		rate := group.RateMultiplier
		if rate < 0 {
			rate = 1
		}
		var userRate *float64
		if userRates != nil {
			if v, ok := userRates[group.ID]; ok {
				rv := v
				userRate = &rv
				rate = rv
			}
		}
		out = append(out, modelMarketGroupDTO{
			ID:                 group.ID,
			Name:               group.Name,
			Platform:           strings.ToLower(strings.TrimSpace(group.Platform)),
			SubscriptionType:   group.SubscriptionType,
			RateMultiplier:     group.RateMultiplier,
			UserRateMultiplier: userRate,
			EffectiveRate:      rate,
			IsExclusive:        group.IsExclusive,
		})
	}
	sort.SliceStable(out, func(i, j int) bool {
		if out[i].Platform != out[j].Platform {
			return out[i].Platform < out[j].Platform
		}
		if out[i].EffectiveRate != out[j].EffectiveRate {
			return out[i].EffectiveRate < out[j].EffectiveRate
		}
		return strings.ToLower(out[i].Name) < strings.ToLower(out[j].Name)
	})
	return out
}

func groupPricesForModel(
	base modelMarketPricingDTO,
	groups []modelMarketGroupDTO,
	platforms []string,
) []modelMarketGroupPriceDTO {
	platformSet := make(map[string]struct{}, len(platforms))
	for _, p := range platforms {
		platformSet[strings.ToLower(strings.TrimSpace(p))] = struct{}{}
	}

	out := make([]modelMarketGroupPriceDTO, 0, len(groups))
	for _, group := range groups {
		if _, ok := platformSet[group.Platform]; !ok {
			continue
		}
		out = append(out, modelMarketGroupPriceDTO{
			Group:   group,
			Pricing: scaleMarketPricing(base, group.EffectiveRate),
		})
	}
	sort.SliceStable(out, func(i, j int) bool {
		if out[i].Group.EffectiveRate != out[j].Group.EffectiveRate {
			return out[i].Group.EffectiveRate < out[j].Group.EffectiveRate
		}
		return strings.ToLower(out[i].Group.Name) < strings.ToLower(out[j].Group.Name)
	})
	return out
}

func toModelMarketPricing(pricing *service.LiteLLMModelPricing) modelMarketPricingDTO {
	if pricing == nil {
		return modelMarketPricingDTO{}
	}
	return modelMarketPricingDTO{
		InputPer1M:        perMillionPtr(pricing.InputCostPerToken),
		OutputPer1M:       perMillionPtr(pricing.OutputCostPerToken),
		CacheWritePer1M:   perMillionPtr(pricing.CacheCreationInputTokenCost),
		CacheWrite1hPer1M: perMillionPtr(pricing.CacheCreationInputTokenCostAbove1hr),
		CacheReadPer1M:    perMillionPtr(pricing.CacheReadInputTokenCost),
		ImageOutputPer1M:  perMillionPtr(pricing.OutputCostPerImageToken),
		PerRequest:        nonZeroFloatPtr(pricing.OutputCostPerImage),
	}
}

func scaleMarketPricing(pricing modelMarketPricingDTO, rate float64) modelMarketPricingDTO {
	return modelMarketPricingDTO{
		InputPer1M:        scaleFloatPtr(pricing.InputPer1M, rate),
		OutputPer1M:       scaleFloatPtr(pricing.OutputPer1M, rate),
		CacheWritePer1M:   scaleFloatPtr(pricing.CacheWritePer1M, rate),
		CacheWrite1hPer1M: scaleFloatPtr(pricing.CacheWrite1hPer1M, rate),
		CacheReadPer1M:    scaleFloatPtr(pricing.CacheReadPer1M, rate),
		ImageOutputPer1M:  scaleFloatPtr(pricing.ImageOutputPer1M, rate),
		PerRequest:        scaleFloatPtr(pricing.PerRequest, rate),
	}
}

func perMillionPtr(value float64) *float64 {
	if value == 0 {
		return nil
	}
	out := value * 1_000_000
	return &out
}

func nonZeroFloatPtr(value float64) *float64 {
	if value == 0 {
		return nil
	}
	out := value
	return &out
}

func scaleFloatPtr(value *float64, rate float64) *float64 {
	if value == nil {
		return nil
	}
	out := *value * rate
	return &out
}

func pricingSource(exact bool) string {
	if exact {
		return "litellm_catalog"
	}
	return "fallback"
}

func capabilitiesForModel(spec modelMarketSpec, pricing *service.LiteLLMModelPricing) []string {
	caps := make([]string, 0, 8)
	add := func(enabled bool, cap string) {
		if enabled {
			caps = append(caps, cap)
		}
	}
	add(pricing.SupportsReasoning || strings.Contains(spec.Tier, "opus") || strings.Contains(spec.ID, "gpt-5"), "reasoning")
	add(pricing.SupportsVision, "vision")
	add(pricing.SupportsFunctionCalling || pricing.SupportsToolChoice, "tools")
	add(pricing.SupportsWebSearch, "webSearch")
	add(pricing.SupportsPromptCaching || pricing.CacheCreationInputTokenCost > 0 || pricing.CacheReadInputTokenCost > 0, "promptCache")
	add(pricing.SupportsPDFInput, "pdf")
	add(pricing.SupportsComputerUse, "computerUse")
	add(pricing.SupportsServiceTier, "serviceTier")
	if spec.Family == "claude" || strings.Contains(spec.ID, "codex") {
		caps = append(caps, "code")
	}
	return dedupeStrings(caps)
}

func dedupeStrings(values []string) []string {
	seen := make(map[string]struct{}, len(values))
	out := make([]string, 0, len(values))
	for _, value := range values {
		if _, ok := seen[value]; ok {
			continue
		}
		seen[value] = struct{}{}
		out = append(out, value)
	}
	return out
}
