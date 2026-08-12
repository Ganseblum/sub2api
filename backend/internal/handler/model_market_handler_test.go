package handler

import (
	"testing"

	"github.com/Wei-Shaw/sub2api/internal/service"
	"github.com/stretchr/testify/require"
)

func TestModelMarketSpecsUseCurrentPublicModelIDs(t *testing.T) {
	expected := []string{
		"claude-opus-4-6",
		"claude-opus-4-7",
		"claude-opus-4-8",
		"claude-opus-5",
		"claude-fable-5",
		"claude-sonnet-5",
		"claude-sonnet-4-6",
		"claude-haiku-4-5",
		"gemini-3.6-flash",
		"gemini-3.5-flash",
		"gemini-3.5-flash-lite",
		"gemini-3.1-pro-preview",
		"gemini-3.1-flash-lite",
		"gemini-3.1-flash-image",
		"gemini-3-flash-preview",
		"gpt-5.6-sol",
		"gpt-5.6-terra",
		"gpt-5.6-luna",
	}

	actual := make([]string, 0, len(modelMarketSpecs))
	displayNames := make(map[string]string, len(modelMarketSpecs))
	for _, spec := range modelMarketSpecs {
		actual = append(actual, spec.ID)
		displayNames[spec.ID] = spec.DisplayName
	}

	// 验证：市场只发布当前官方 ID，不再输出 thinking 参数别名、内部别名或退休型号。
	require.ElementsMatch(t, expected, actual)
	require.Len(t, actual, len(expected))
	require.Equal(t, "Claude Fable 5", displayNames["claude-fable-5"])
}

func TestToModelMarketPricingIncludesLongContextTier(t *testing.T) {
	pricing := toModelMarketPricing(&service.LiteLLMModelPricing{
		InputCostPerToken:               2e-6,
		OutputCostPerToken:              12e-6,
		CacheReadInputTokenCost:         0.2e-6,
		LongContextInputTokenThreshold:  200000,
		LongContextInputCostMultiplier:  2,
		LongContextOutputCostMultiplier: 1.5,
	})

	// 验证：模型市场 API 会输出可按分组倍率缩放的长上下文整档价格。
	require.NotNil(t, pricing.LongContext)
	require.Equal(t, 200000, pricing.LongContext.ThresholdTokens)
	require.InDelta(t, 4.0, *pricing.LongContext.InputPer1M, 1e-12)
	require.InDelta(t, 18.0, *pricing.LongContext.OutputPer1M, 1e-12)
	require.InDelta(t, 0.4, *pricing.LongContext.CacheReadPer1M, 1e-12)
	require.Nil(t, pricing.LongContext.CacheWritePer1M)
	require.Nil(t, pricing.LongContext.CacheWrite1hPer1M)

	scaled := scaleMarketPricing(pricing, 0.5)
	require.NotNil(t, scaled.LongContext)
	require.Equal(t, 200000, scaled.LongContext.ThresholdTokens)
	require.InDelta(t, 2.0, *scaled.LongContext.InputPer1M, 1e-12)
	require.InDelta(t, 9.0, *scaled.LongContext.OutputPer1M, 1e-12)
	require.InDelta(t, 0.2, *scaled.LongContext.CacheReadPer1M, 1e-12)
}
