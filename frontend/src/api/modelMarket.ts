import { apiClient } from './client'

export interface ModelMarketPricing {
  input_per_1m: number | null
  output_per_1m: number | null
  cache_write_per_1m: number | null
  cache_write_1h_per_1m: number | null
  cache_read_per_1m: number | null
  image_output_per_1m: number | null
  per_request: number | null
}

export interface ModelMarketContext {
  max_input_tokens: number
  max_output_tokens: number
  max_tokens: number
}

export interface ModelMarketGroup {
  id: number
  name: string
  platform: string
  subscription_type: string
  rate_multiplier: number
  user_rate_multiplier: number | null
  effective_rate: number
  is_exclusive: boolean
}

export interface ModelMarketGroupPrice {
  group: ModelMarketGroup
  pricing: ModelMarketPricing
}

export interface ModelMarketModel {
  id: string
  name: string
  display_order: number
  release_date: string
  family: 'gpt' | 'claude' | 'gemini'
  provider: string
  display_provider: string
  tier: string
  mode: string
  source: 'litellm_catalog' | 'fallback'
  pricing: ModelMarketPricing
  context: ModelMarketContext
  capabilities: string[]
  group_platforms: string[]
  groups: ModelMarketGroupPrice[]
  lowest_group: ModelMarketGroupPrice | null
}

export interface ModelMarketMeta {
  unit: string
  price_source: string
}

export interface ModelMarketResponse {
  models: ModelMarketModel[]
  groups: ModelMarketGroup[]
  meta: ModelMarketMeta
}

export async function getModelMarket(options?: { signal?: AbortSignal }): Promise<ModelMarketResponse> {
  const { data } = await apiClient.get<ModelMarketResponse>('/model-market', {
    signal: options?.signal,
  })
  return data
}

export const modelMarketAPI = { getModelMarket }

export default modelMarketAPI
