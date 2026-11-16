import { apiClient } from '../client'
import type { APIMode } from './channelMonitor'

export interface PelicanPlaygroundRequest {
  endpoint: string
  api_key: string
  model: string
  api_mode: APIMode
  prompt: string
}

export interface PelicanPlaygroundResult {
  id: number
  endpoint: string
  model: string
  api_key_masked: string
  prompt: string
  status: 'passed' | 'failed' | 'error'
  content: string
  artifact?: string
  message?: string
  source_length: number
  started_at: string
  finished_at: string
  expires_at: string
}

export async function run(request: PelicanPlaygroundRequest): Promise<PelicanPlaygroundResult> {
  const { data } = await apiClient.post<PelicanPlaygroundResult>('/admin/pelican-playground/run', request, { timeout: 11 * 60 * 1000 })
  return data
}

export async function history(): Promise<{ items: PelicanPlaygroundResult[] }> {
  const { data } = await apiClient.get<{ items: PelicanPlaygroundResult[] }>('/admin/pelican-playground/history')
  return data
}

export default { run, history }
