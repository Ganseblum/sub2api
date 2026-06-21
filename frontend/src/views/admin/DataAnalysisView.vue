<template>
  <AppLayout>
    <div class="space-y-6 pb-10">
      <div class="card p-4">
        <div class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div class="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            <div>
              <label class="input-label">{{ t('admin.dataAnalysis.dimension') }}</label>
              <Select v-model="dimension" :options="dimensionOptions" />
            </div>
            <div>
              <label class="input-label">{{ t('admin.dataAnalysis.timeRange') }}</label>
              <Select v-model="timeRange" :options="timeRangeOptions" />
            </div>
            <div>
              <label class="input-label">{{ t('admin.dataAnalysis.sort') }}</label>
              <Select v-model="sort" :options="sortOptions" />
            </div>
            <div>
              <label class="input-label">{{ t('admin.dataAnalysis.account') }}</label>
              <Select
                v-model="accountId"
                :options="accountOptions"
                :placeholder="t('admin.dataAnalysis.allAccounts')"
                is-searchable
                clearable
              />
            </div>
            <div>
              <label class="input-label">{{ t('admin.dataAnalysis.group') }}</label>
              <Select
                v-model="groupId"
                :options="groupOptions"
                :placeholder="t('admin.dataAnalysis.allGroups')"
                is-searchable
                clearable
              />
            </div>
            <div>
              <label class="input-label">{{ t('admin.dataAnalysis.platform') }}</label>
              <input
                v-model.trim="platform"
                class="input"
                :placeholder="t('admin.dataAnalysis.platformPlaceholder')"
                @keyup.enter="loadData"
              />
            </div>
            <div>
              <label class="input-label">{{ t('admin.dataAnalysis.model') }}</label>
              <input
                v-model.trim="model"
                class="input"
                :placeholder="t('admin.dataAnalysis.modelPlaceholder')"
                @keyup.enter="loadData"
              />
            </div>
          </div>

          <div class="flex items-center gap-2 xl:pb-0.5">
            <button class="btn btn-secondary" :disabled="loading" @click="resetFilters">
              {{ t('common.reset') }}
            </button>
            <button class="btn btn-primary" :disabled="loading" @click="loadData">
              <Icon name="refresh" size="sm" :class="loading ? 'animate-spin' : ''" />
              <span>{{ t('common.refresh') }}</span>
            </button>
          </div>
        </div>
      </div>

      <div v-if="errorMessage" class="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
        {{ errorMessage }}
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div class="card p-4">
          <div class="flex items-center gap-3">
            <div class="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
              <Icon name="chartBar" size="md" class="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 dark:text-dark-300">{{ t('admin.dataAnalysis.totalRequests') }}</p>
              <p class="text-xl font-semibold text-gray-900 dark:text-white">{{ formatNumber(summary.requestCount) }}</p>
            </div>
          </div>
        </div>
        <div class="card p-4">
          <div class="flex items-center gap-3">
            <div class="rounded-lg bg-red-100 p-2 dark:bg-red-900/30">
              <Icon name="exclamationTriangle" size="md" class="text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 dark:text-dark-300">{{ t('admin.dataAnalysis.errorRate') }}</p>
              <p class="text-xl font-semibold text-gray-900 dark:text-white">{{ formatPercent(summary.errorRate) }}</p>
              <p class="text-xs text-gray-500 dark:text-dark-300">{{ formatNumber(summary.errorCount) }} {{ t('admin.dataAnalysis.errors') }}</p>
            </div>
          </div>
        </div>
        <div class="card p-4">
          <div class="flex items-center gap-3">
            <div class="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900/30">
              <Icon name="clock" size="md" class="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 dark:text-dark-300">{{ t('admin.dataAnalysis.avgDuration') }}</p>
              <p class="text-xl font-semibold text-gray-900 dark:text-white">{{ formatDuration(summary.avgDurationMs) }}</p>
              <p class="text-xs text-gray-500 dark:text-dark-300">{{ formatNumber(summary.durationSamples) }} {{ t('admin.dataAnalysis.samples') }}</p>
            </div>
          </div>
        </div>
        <div class="card p-4">
          <div class="flex items-center gap-3">
            <div class="rounded-lg bg-amber-100 p-2 dark:bg-amber-900/30">
              <Icon name="bolt" size="md" class="text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 dark:text-dark-300">{{ t('admin.dataAnalysis.avgTtft') }}</p>
              <p class="text-xl font-semibold text-gray-900 dark:text-white">{{ formatDuration(summary.avgTtftMs) }}</p>
              <p class="text-xs text-gray-500 dark:text-dark-300">{{ formatNumber(summary.ttftSamples) }} {{ t('admin.dataAnalysis.samples') }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="card overflow-hidden">
        <div class="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-dark-700">
          <div>
            <h2 class="text-base font-semibold text-gray-900 dark:text-white">{{ t('admin.dataAnalysis.tableTitle') }}</h2>
            <p class="text-xs text-gray-500 dark:text-dark-300">
              {{ responseRange }}
            </p>
          </div>
          <div class="text-xs text-gray-500 dark:text-dark-300">
            {{ t('admin.dataAnalysis.rows', { count: rows.length }) }}
          </div>
        </div>

        <div v-if="loading && !hasLoaded" class="flex items-center justify-center py-16">
          <LoadingSpinner />
        </div>

        <div v-else-if="rows.length === 0" class="py-16 text-center text-sm text-gray-500 dark:text-dark-300">
          {{ t('admin.dataAnalysis.empty') }}
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-[1180px] w-full divide-y divide-gray-200 text-sm dark:divide-dark-700">
            <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:bg-dark-800 dark:text-dark-300">
              <tr>
                <th class="px-4 py-3 text-left">{{ dimensionLabel }}</th>
                <th class="px-4 py-3 text-left">{{ t('admin.dataAnalysis.platform') }}</th>
                <th class="px-4 py-3 text-right">{{ t('admin.dataAnalysis.requests') }}</th>
                <th class="px-4 py-3 text-right">{{ t('admin.dataAnalysis.success') }}</th>
                <th class="px-4 py-3 text-right">{{ t('admin.dataAnalysis.errors') }}</th>
                <th class="px-4 py-3 text-right">{{ t('admin.dataAnalysis.errorRate') }}</th>
                <th class="px-4 py-3 text-right">{{ t('admin.dataAnalysis.durationAvg') }}</th>
                <th class="px-4 py-3 text-right">{{ t('admin.dataAnalysis.durationMin') }}</th>
                <th class="px-4 py-3 text-right">{{ t('admin.dataAnalysis.durationMax') }}</th>
                <th class="px-4 py-3 text-right">{{ t('admin.dataAnalysis.durationP95') }}</th>
                <th class="px-4 py-3 text-right">{{ t('admin.dataAnalysis.ttftAvg') }}</th>
                <th class="px-4 py-3 text-right">{{ t('admin.dataAnalysis.ttftMin') }}</th>
                <th class="px-4 py-3 text-right">{{ t('admin.dataAnalysis.ttftMax') }}</th>
                <th class="px-4 py-3 text-right">{{ t('admin.dataAnalysis.ttftP95') }}</th>
                <th class="px-4 py-3 text-right">{{ t('admin.dataAnalysis.tokens') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white dark:divide-dark-700 dark:bg-dark-900">
              <tr v-for="row in rows" :key="`${row.dimension}:${row.id ?? row.name}:${row.platform}`" class="hover:bg-gray-50 dark:hover:bg-dark-800/70">
                <td class="px-4 py-3">
                  <div class="font-medium text-gray-900 dark:text-white">{{ row.name }}</div>
                  <div class="text-xs text-gray-500 dark:text-dark-300">ID {{ row.id ?? '-' }}</div>
                </td>
                <td class="px-4 py-3">
                  <span class="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-dark-700 dark:text-dark-200">
                    {{ row.platform || '-' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right font-mono text-gray-900 dark:text-white">{{ formatNumber(row.request_count) }}</td>
                <td class="px-4 py-3 text-right font-mono text-emerald-600 dark:text-emerald-400">{{ formatNumber(row.success_count) }}</td>
                <td class="px-4 py-3 text-right font-mono text-red-600 dark:text-red-400">{{ formatNumber(row.error_count) }}</td>
                <td class="px-4 py-3 text-right">
                  <span :class="['font-mono font-medium', errorRateClass(row.error_rate)]">{{ formatPercent(row.error_rate) }}</span>
                </td>
                <td class="px-4 py-3 text-right font-mono">{{ formatDuration(row.duration.avg_ms) }}</td>
                <td class="px-4 py-3 text-right font-mono">{{ formatDuration(row.duration.min_ms) }}</td>
                <td class="px-4 py-3 text-right font-mono">{{ formatDuration(row.duration.max_ms) }}</td>
                <td class="px-4 py-3 text-right font-mono">{{ formatDuration(row.duration.p95_ms) }}</td>
                <td class="px-4 py-3 text-right font-mono">{{ formatDuration(row.ttft.avg_ms) }}</td>
                <td class="px-4 py-3 text-right font-mono">{{ formatDuration(row.ttft.min_ms) }}</td>
                <td class="px-4 py-3 text-right font-mono">{{ formatDuration(row.ttft.max_ms) }}</td>
                <td class="px-4 py-3 text-right font-mono">{{ formatDuration(row.ttft.p95_ms) }}</td>
                <td class="px-4 py-3 text-right font-mono">{{ formatCompact(row.token_consumed) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import AppLayout from '@/components/layout/AppLayout.vue'
import Icon from '@/components/icons/Icon.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import Select from '@/components/common/Select.vue'
import { adminAPI } from '@/api/admin'
import { useAppStore } from '@/stores/app'
import type { SelectOption } from '@/components/common/Select.vue'
import type {
  OpsAnalyticsDimension,
  OpsAnalyticsResponse,
  OpsAnalyticsRow,
  OpsAnalyticsSort
} from '@/api/admin/ops'

const { t } = useI18n()
const appStore = useAppStore()

const dimension = ref<OpsAnalyticsDimension>('account')
const timeRange = ref<'5m' | '30m' | '1h' | '6h' | '24h' | '7d' | '30d'>('1h')
const sort = ref<OpsAnalyticsSort>('request_count_desc')
const platform = ref('')
const model = ref('')
const accountId = ref<number | null>(null)
const groupId = ref<number | null>(null)

const loading = ref(false)
const hasLoaded = ref(false)
const errorMessage = ref('')
const response = ref<OpsAnalyticsResponse | null>(null)
const rows = ref<OpsAnalyticsRow[]>([])
const accounts = ref<Array<{ id: number; name: string; platform?: string }>>([])
const groups = ref<Array<{ id: number; name: string; platform?: string }>>([])

let abortController: AbortController | null = null

const dimensionOptions = computed<SelectOption[]>(() => [
  { value: 'account', label: t('admin.dataAnalysis.byAccount') },
  { value: 'group', label: t('admin.dataAnalysis.byGroup') }
])

const timeRangeOptions = computed<SelectOption[]>(() => [
  { value: '5m', label: t('admin.dataAnalysis.range5m') },
  { value: '30m', label: t('admin.dataAnalysis.range30m') },
  { value: '1h', label: t('admin.dataAnalysis.range1h') },
  { value: '6h', label: t('admin.dataAnalysis.range6h') },
  { value: '24h', label: t('admin.dataAnalysis.range24h') },
  { value: '7d', label: t('admin.dataAnalysis.range7d') },
  { value: '30d', label: t('admin.dataAnalysis.range30d') }
])

const sortOptions = computed<SelectOption[]>(() => [
  { value: 'request_count_desc', label: t('admin.dataAnalysis.sortRequests') },
  { value: 'error_rate_desc', label: t('admin.dataAnalysis.sortErrorRate') },
  { value: 'avg_duration_desc', label: t('admin.dataAnalysis.sortDuration') },
  { value: 'avg_ttft_desc', label: t('admin.dataAnalysis.sortTtft') }
])

const accountOptions = computed<SelectOption[]>(() => [
  { value: null, label: t('admin.dataAnalysis.allAccounts') },
  ...accounts.value.map((account) => ({
    value: account.id,
    label: `${account.name || `#${account.id}`}${account.platform ? ` · ${account.platform}` : ''}`
  }))
])

const groupOptions = computed<SelectOption[]>(() => [
  { value: null, label: t('admin.dataAnalysis.allGroups') },
  ...groups.value.map((group) => ({
    value: group.id,
    label: `${group.name || `#${group.id}`}${group.platform ? ` · ${group.platform}` : ''}`
  }))
])

const dimensionLabel = computed(() =>
  dimension.value === 'account' ? t('admin.dataAnalysis.account') : t('admin.dataAnalysis.group')
)

const responseRange = computed(() => {
  if (!response.value) return t('admin.dataAnalysis.noRange')
  return `${formatDateTime(response.value.start_time)} - ${formatDateTime(response.value.end_time)}`
})

const summary = computed(() => {
  const requestCount = rows.value.reduce((sum, row) => sum + row.request_count, 0)
  const errorCount = rows.value.reduce((sum, row) => sum + row.error_count, 0)
  const durationSamples = rows.value.reduce((sum, row) => sum + (row.duration.samples || 0), 0)
  const ttftSamples = rows.value.reduce((sum, row) => sum + (row.ttft.samples || 0), 0)
  const avgDurationMs = weightedAverage(rows.value, (row) => row.duration.avg_ms, (row) => row.duration.samples)
  const avgTtftMs = weightedAverage(rows.value, (row) => row.ttft.avg_ms, (row) => row.ttft.samples)

  return {
    requestCount,
    errorCount,
    errorRate: requestCount > 0 ? errorCount / requestCount : 0,
    durationSamples,
    ttftSamples,
    avgDurationMs,
    avgTtftMs
  }
})

function weightedAverage(
  input: OpsAnalyticsRow[],
  getValue: (row: OpsAnalyticsRow) => number | null | undefined,
  getWeight: (row: OpsAnalyticsRow) => number | null | undefined
): number | null {
  let total = 0
  let weightTotal = 0
  for (const row of input) {
    const value = getValue(row)
    const weight = getWeight(row) || 0
    if (value == null || weight <= 0) continue
    total += value * weight
    weightTotal += weight
  }
  if (weightTotal <= 0) return null
  return Math.round(total / weightTotal)
}

async function loadOptions() {
  try {
    const [groupRows, accountPage] = await Promise.all([
      adminAPI.groups.getAll(),
      adminAPI.accounts.list(1, 200, { lite: '1', sort_by: 'name', sort_order: 'asc' })
    ])
    groups.value = (groupRows || []).map((group: any) => ({
      id: Number(group.id),
      name: String(group.name || ''),
      platform: group.platform ? String(group.platform) : undefined
    })).filter((group) => Number.isFinite(group.id))
    accounts.value = (accountPage.items || []).map((account: any) => ({
      id: Number(account.id),
      name: String(account.name || ''),
      platform: account.platform ? String(account.platform) : undefined
    })).filter((account) => Number.isFinite(account.id))
  } catch (error: any) {
    appStore.showError(error?.message || t('admin.dataAnalysis.optionsLoadFailed'))
  }
}

async function loadData() {
  abortController?.abort()
  const controller = new AbortController()
  abortController = controller
  loading.value = true
  errorMessage.value = ''

  try {
    const data = await adminAPI.ops.getAnalytics({
      dimension: dimension.value,
      time_range: timeRange.value,
      sort: sort.value,
      limit: 100,
      platform: platform.value || undefined,
      model: model.value || undefined,
      account_id: accountId.value || undefined,
      group_id: groupId.value || undefined
    }, { signal: controller.signal })
    response.value = data
    rows.value = data.rows || []
    hasLoaded.value = true
  } catch (error: any) {
    if (error?.code === 'ERR_CANCELED') return
    errorMessage.value = error?.message || t('admin.dataAnalysis.loadFailed')
    rows.value = []
  } finally {
    if (abortController === controller) {
      loading.value = false
    }
  }
}

function resetFilters() {
  dimension.value = 'account'
  timeRange.value = '1h'
  sort.value = 'request_count_desc'
  platform.value = ''
  model.value = ''
  accountId.value = null
  groupId.value = null
  loadData()
}

function formatNumber(value: number | null | undefined): string {
  return new Intl.NumberFormat().format(value || 0)
}

function formatCompact(value: number | null | undefined): string {
  return new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(value || 0)
}

function formatPercent(value: number | null | undefined): string {
  return `${(((value || 0) * 100)).toFixed(2)}%`
}

function formatDuration(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '-'
  if (value < 1000) return `${Math.round(value)} ms`
  if (value < 60_000) return `${(value / 1000).toFixed(value < 10_000 ? 2 : 1)} s`
  return `${(value / 60_000).toFixed(1)} min`
}

function formatDateTime(value: string): string {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

function errorRateClass(value: number): string {
  if (value >= 0.1) return 'text-red-600 dark:text-red-400'
  if (value >= 0.03) return 'text-amber-600 dark:text-amber-400'
  return 'text-emerald-600 dark:text-emerald-400'
}

watch([dimension, timeRange, sort], () => {
  loadData()
})

onMounted(() => {
  loadOptions()
  loadData()
})
</script>
