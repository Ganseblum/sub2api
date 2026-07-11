<template>
  <AppLayout>
    <div class="space-y-6">
      <section class="page-heading">
        <div class="min-w-0">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ t('modelMarket.title') }}</h1>
          <p class="mt-1 max-w-3xl text-sm text-gray-500 dark:text-gray-400">{{ t('modelMarket.description') }}</p>
        </div>
        <button class="btn btn-secondary shrink-0 justify-center" :disabled="loading" @click="loadModels">
          <Icon name="refresh" size="sm" :class="{ 'animate-spin': loading }" />
          <span>{{ t('common.refresh') }}</span>
        </button>
      </section>

      <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div class="card p-4">
          <span class="block text-xs font-semibold uppercase text-gray-500 dark:text-dark-400">{{ t('modelMarket.stats.models') }}</span>
          <strong class="mt-2 block min-h-[30px] break-words text-2xl font-bold tabular-nums text-gray-900 dark:text-white">{{ filteredRows.length }}</strong>
          <small class="mt-1 block truncate text-xs text-gray-500 dark:text-gray-400">{{ t('modelMarket.stats.modelsHint') }}</small>
        </div>
        <div class="card p-4">
          <span class="block text-xs font-semibold uppercase text-gray-500 dark:text-dark-400">{{ t('modelMarket.stats.lowestRate') }}</span>
          <strong class="mt-2 block min-h-[30px] break-words text-2xl font-bold tabular-nums text-gray-900 dark:text-white">{{ formatRate(summary.lowestRate) }}</strong>
          <small class="mt-1 block truncate text-xs text-gray-500 dark:text-gray-400">{{ summary.lowestGroupName || t('modelMarket.noGroup') }}</small>
        </div>
        <div class="card p-4">
          <span class="block text-xs font-semibold uppercase text-gray-500 dark:text-dark-400">{{ t('modelMarket.stats.lowestInput') }}</span>
          <strong class="mt-2 block min-h-[30px] break-words text-2xl font-bold tabular-nums text-gray-900 dark:text-white">{{ formatPrice(summary.lowestInput, '/1M token') }}</strong>
          <small class="mt-1 block truncate text-xs text-gray-500 dark:text-gray-400">{{ t('modelMarket.stats.lowestInputHint') }}</small>
        </div>
        <div class="card p-4">
          <span class="block text-xs font-semibold uppercase text-gray-500 dark:text-dark-400">{{ t('modelMarket.stats.groups') }}</span>
          <strong class="mt-2 block min-h-[30px] break-words text-2xl font-bold tabular-nums text-gray-900 dark:text-white">{{ groupOptions.length }}</strong>
          <small class="mt-1 block truncate text-xs text-gray-500 dark:text-gray-400">{{ t('modelMarket.stats.groupsHint') }}</small>
        </div>
      </section>

      <section class="card p-4">
        <div class="mb-4 flex flex-wrap gap-2">
          <button
            v-for="option in familyOptions"
            :key="option.value"
            type="button"
            class="rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
            :class="familyFilter === option.value
              ? 'bg-primary-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-700 dark:text-gray-300 dark:hover:bg-dark-600'"
            @click="familyFilter = option.value as FamilyFilter"
          >
            {{ option.label }}
          </button>
        </div>

        <div class="market-toolbar">
          <div class="relative min-w-0 xl:col-span-2">
            <Icon
              name="search"
              size="md"
              class="search-input-icon pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
            />
            <input
              v-model="searchQuery"
              class="input pl-10"
              :placeholder="t('modelMarket.searchPlaceholder')"
              type="search"
            />
          </div>

          <Select
            v-model="familyFilter"
            :options="familyOptions"
            :searchable="false"
          />

          <Select
            v-model="tierFilter"
            :options="tierFilterOptions"
            :searchable="false"
          />

          <Select
            v-model="groupFilter"
            :options="groupFilterOptions"
            :searchable="false"
          />

          <Select
            v-model="sortKey"
            :options="sortOptions"
            :searchable="false"
          />

          <div class="seg-control h-10 shrink-0">
            <button
              class="seg-control-btn view-toggle"
              :class="{ 'seg-control-btn-active': viewMode === 'table' }"
              :title="t('modelMarket.view.table')"
              @click="viewMode = 'table'"
            >
              <Icon name="menu" size="sm" />
            </button>
            <button
              class="seg-control-btn view-toggle"
              :class="{ 'seg-control-btn-active': viewMode === 'cards' }"
              :title="t('modelMarket.view.cards')"
              @click="viewMode = 'cards'"
            >
              <Icon name="grid" size="sm" />
            </button>
          </div>
        </div>
      </section>

      <section v-if="loading" class="card flex items-center justify-center py-16">
        <Icon name="refresh" size="lg" class="animate-spin text-gray-400" />
      </section>

      <section v-else-if="filteredRows.length === 0" class="card py-16 text-center">
        <Icon name="inbox" size="xl" class="mx-auto mb-3 text-gray-400" />
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ t('modelMarket.empty') }}</p>
      </section>

      <section v-else-if="viewMode === 'table'" class="card overflow-hidden">
        <div class="table-container">
          <table class="table min-w-[1180px]">
            <thead>
              <tr>
                <th class="text-left">{{ t('modelMarket.table.model') }}</th>
                <th class="text-left">{{ t('modelMarket.table.platform') }}</th>
                <th class="text-left">{{ t('modelMarket.table.context') }}</th>
                <th class="text-left">{{ t('modelMarket.table.basePrice') }}</th>
                <th class="text-left">{{ t('modelMarket.table.lowestRate') }}</th>
                <th class="text-left">{{ t('modelMarket.table.lowestActualPrice') }}</th>
                <th class="text-center">{{ t('modelMarket.table.groups') }}</th>
                <th class="text-right">{{ t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in pagedRows"
                :key="row.id"
              >
                <td class="align-top">
                  <div class="model-name-block">
                    <span class="break-words font-semibold text-gray-900 dark:text-white">{{ row.name }}</span>
                    <div class="flex flex-wrap gap-1.5">
                      <span class="badge badge-purple">{{ tierLabel(row.tier) }}</span>
                      <span v-if="row.source === 'fallback'" class="badge badge-gray">{{ t('modelMarket.source.fallback') }}</span>
                    </div>
                  </div>
                </td>
                <td class="align-top">
                  <span :class="['badge', providerBadgeClass(row.family)]">
                    {{ row.display_provider }}
                  </span>
                  <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">{{ platformList(row.group_platforms) }}</p>
                </td>
                <td class="align-top text-sm text-gray-700 dark:text-gray-300">
                  <div class="space-y-1 whitespace-nowrap">
                    <div>{{ t('modelMarket.detail.maxInput') }}: {{ formatTokens(row.context.max_input_tokens) }}</div>
                    <div>{{ t('modelMarket.detail.maxOutput') }}: {{ formatTokens(row.context.max_output_tokens) }}</div>
                  </div>
                </td>
                <td class="align-top">
                  <PriceLines :pricing="row.pricing" />
                </td>
                <td class="align-top">
                  <div class="font-semibold text-gray-900 dark:text-white">{{ formatRate(displayLowestRate(row)) }}</div>
                  <div class="mt-1 max-w-[180px] truncate text-xs text-gray-500 dark:text-gray-400">
                    {{ displayLowestGroup(row)?.group.name || t('modelMarket.noGroup') }}
                  </div>
                </td>
                <td class="align-top">
                  <PriceLines :pricing="displayActualPricing(row)" />
                </td>
                <td class="text-center align-top font-semibold text-gray-900 dark:text-white">
                  {{ displayGroupCount(row) }}
                </td>
                <td class="text-right align-top">
                  <button class="btn btn-ghost btn-sm whitespace-nowrap" @click="openDetail(row)">
                    {{ t('modelMarket.actions.viewDetail') }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section v-else class="space-y-8">
        <div v-for="group in pagedGroupedRows" :key="group.family" class="space-y-4">
          <h3 class="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
            <span class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black" :class="providerMarkClass(group.family)">
              {{ providerMarkText(group.family) }}
            </span>
            {{ group.label }}
          </h3>
          <div class="grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3">
            <article v-for="row in group.rows" :key="row.id" class="card card-hover p-5">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <div class="mb-3 flex flex-wrap gap-2">
                    <span :class="['badge', providerBadgeClass(row.family)]">
                      {{ row.display_provider }}
                    </span>
                    <span class="badge badge-purple">{{ tierLabel(row.tier) }}</span>
                  </div>
                  <h2 class="break-words text-lg font-bold leading-tight text-gray-900 dark:text-white">{{ row.name }}</h2>
                  <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {{ platformList(row.group_platforms) }} · {{ t('modelMarket.groupCount', { count: displayGroupCount(row) }) }}
                  </p>
                </div>
                <button class="btn btn-ghost btn-icon shrink-0" :title="t('modelMarket.actions.viewDetail')" @click="openDetail(row)">
                  <Icon name="arrowRight" size="md" />
                </button>
              </div>

              <div class="price-panel mt-5">
                <div>
                  <span>{{ t('modelMarket.price.input') }}</span>
                  <strong>{{ formatPrice(row.pricing.input_per_1m, '/1M token') }}</strong>
                </div>
                <div>
                  <span>{{ t('modelMarket.price.output') }}</span>
                  <strong>{{ formatPrice(row.pricing.output_per_1m, '/1M token') }}</strong>
                </div>
                <div>
                  <span>{{ t('modelMarket.price.cacheRead') }}</span>
                  <strong>{{ formatPrice(row.pricing.cache_read_per_1m, '/1M token') }}</strong>
                </div>
              </div>

              <div class="mt-5 border-t border-gray-100 pt-4 dark:border-dark-700">
                <div class="mb-2 flex items-center justify-between gap-3">
                  <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">{{ t('modelMarket.card.lowestActual') }}</span>
                  <span class="max-w-[190px] truncate text-xs text-gray-500 dark:text-gray-400">
                    {{ lowestGroupSummary(row) }}
                  </span>
                </div>
                <div v-if="displayLowestGroup(row)" class="grid grid-cols-2 gap-1.5">
                  <div class="actual-tile">
                    <span>{{ t('modelMarket.price.rate') }}</span>
                    <strong>{{ formatRate(displayLowestRate(row)) }}</strong>
                  </div>
                  <div class="actual-tile">
                    <span>{{ t('modelMarket.price.input') }}</span>
                    <strong>{{ formatPrice(displayActualPricing(row)?.input_per_1m, '/1M token') }}</strong>
                  </div>
                  <div class="actual-tile">
                    <span>{{ t('modelMarket.price.output') }}</span>
                    <strong>{{ formatPrice(displayActualPricing(row)?.output_per_1m, '/1M token') }}</strong>
                  </div>
                  <div class="actual-tile">
                    <span>{{ t('modelMarket.price.cacheReadShort') }}</span>
                    <strong>{{ formatPrice(displayActualPricing(row)?.cache_read_per_1m, '/1M token') }}</strong>
                  </div>
                </div>
                <div v-else class="no-group-panel">{{ t('modelMarket.noGroup') }}</div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <Pagination
        v-if="filteredRows.length > pageSize"
        v-model:page="page"
        v-model:pageSize="pageSize"
        :total="filteredRows.length"
      />
    </div>

    <BaseDialog
      :show="Boolean(detailRow)"
      :title="detailRow?.name || ''"
      width="extra-wide"
      @close="detailRow = null"
    >
      <template v-if="detailRow">
        <div class="space-y-6">
          <section class="detail-hero">
            <div class="model-mark" :class="providerMarkClass(detailRow.family)">
              {{ providerMarkText(detailRow.family) }}
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <span :class="['badge', providerBadgeClass(detailRow.family)]">
                  {{ detailRow.display_provider }}
                </span>
                <span class="badge badge-purple">{{ tierLabel(detailRow.tier) }}</span>
                <span class="badge badge-primary">{{ detailRow.mode }}</span>
                <span class="badge badge-gray">{{ t('modelMarket.groupCount', { count: detailRow.groups.length }) }}</span>
              </div>
              <p class="mt-4 text-sm leading-6 text-gray-700 dark:text-gray-300">
                {{ t('modelMarket.detail.descriptionText', {
                  family: detailRow.display_provider,
                  platform: platformList(detailRow.group_platforms),
                }) }}
              </p>
            </div>
          </section>

          <section class="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div class="detail-stat">
              <span>{{ t('modelMarket.detail.maxInput') }}</span>
              <strong>{{ formatTokens(detailRow.context.max_input_tokens) }}</strong>
            </div>
            <div class="detail-stat">
              <span>{{ t('modelMarket.detail.maxOutput') }}</span>
              <strong>{{ formatTokens(detailRow.context.max_output_tokens) }}</strong>
            </div>
            <div class="detail-stat">
              <span>{{ t('modelMarket.detail.lowestRate') }}</span>
              <strong>{{ formatRate(detailRow.lowest_group?.group.effective_rate) }}</strong>
            </div>
            <div class="detail-stat">
              <span>{{ t('modelMarket.detail.priceUnit') }}</span>
              <strong>/1M token</strong>
            </div>
          </section>

          <section>
            <h3 class="detail-heading">{{ t('modelMarket.detail.basePrice') }}</h3>
            <div class="mt-3 rounded-md border border-gray-200 p-3 dark:border-dark-700">
              <PriceLines :pricing="detailRow.pricing" />
            </div>
          </section>

          <section>
            <h3 class="detail-heading">{{ t('modelMarket.detail.groupPricing') }}</h3>
            <div class="table-container mt-3">
              <table class="table min-w-[960px]">
                <thead>
                  <tr>
                    <th class="text-left">{{ t('modelMarket.detail.group') }}</th>
                    <th class="text-left">{{ t('modelMarket.table.platform') }}</th>
                    <th class="text-left">{{ t('modelMarket.detail.defaultRate') }}</th>
                    <th class="text-left">{{ t('modelMarket.detail.userRate') }}</th>
                    <th class="text-left">{{ t('modelMarket.detail.effectiveRate') }}</th>
                    <th class="text-left">{{ t('modelMarket.detail.finalPrice') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="offer in detailRow.groups"
                    :key="`${detailRow.id}-${offer.group.id}`"
                  >
                    <td>
                      <GroupBadge
                        :name="offer.group.name"
                        :platform="offer.group.platform as any"
                        :subscription-type="(offer.group.subscription_type || 'standard') as any"
                        :rate-multiplier="offer.group.rate_multiplier"
                        :user-rate-multiplier="offer.group.user_rate_multiplier"
                        always-show-rate
                      />
                    </td>
                    <td class="text-gray-700 dark:text-gray-300">{{ platformLabel(offer.group.platform) }}</td>
                    <td>{{ formatRate(offer.group.rate_multiplier) }}</td>
                    <td>{{ offer.group.user_rate_multiplier == null ? '-' : formatRate(offer.group.user_rate_multiplier) }}</td>
                    <td class="font-semibold text-gray-900 dark:text-white">{{ formatRate(offer.group.effective_rate) }}</td>
                    <td>
                      <PriceLines :pricing="offer.pricing" />
                    </td>
                  </tr>
                  <tr v-if="detailRow.groups.length === 0">
                    <td colspan="6" class="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                      {{ t('modelMarket.noGroup') }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </template>

      <template #footer>
        <DialogFooter :show-cancel="false" :show-confirm="false">
          <template #actions>
            <button type="button" class="btn btn-secondary" @click="copyDetailModelName">
              <Icon name="copy" size="sm" />
              <span>{{ t('modelMarket.actions.copyModel') }}</span>
            </button>
            <button type="button" class="btn btn-primary" @click="detailRow = null">
              {{ t('common.close') }}
            </button>
          </template>
        </DialogFooter>
      </template>
    </BaseDialog>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import AppLayout from '@/components/layout/AppLayout.vue'
import Icon from '@/components/icons/Icon.vue'
import Select, { type SelectOption } from '@/components/common/Select.vue'
import BaseDialog from '@/components/common/BaseDialog.vue'
import DialogFooter from '@/components/common/DialogFooter.vue'
import Pagination from '@/components/common/Pagination.vue'
import GroupBadge from '@/components/common/GroupBadge.vue'
import userGroupsAPI from '@/api/groups'
import modelMarketAPI, {
  type ModelMarketGroup,
  type ModelMarketGroupPrice,
  type ModelMarketModel,
  type ModelMarketPricing,
  type ModelMarketResponse,
} from '@/api/modelMarket'
import { useAppStore } from '@/stores/app'
import { extractApiErrorMessage } from '@/utils/apiError'
import type { Group } from '@/types'

type ModelFamily = 'gpt' | 'claude' | 'gemini'
type FamilyFilter = 'all' | ModelFamily
type ViewMode = 'table' | 'cards'
type SortKey = 'newest' | 'family_name' | 'lowest_input' | 'lowest_output' | 'lowest_rate'

interface SummaryStats {
  lowestRate: number | null
  lowestInput: number | null
  lowestGroupName: string
}

interface FilterOption extends SelectOption {
  value: string
  label: string
}

const { t } = useI18n()
const appStore = useAppStore()

const market = ref<ModelMarketResponse | null>(null)
const loading = ref(false)
const searchQuery = ref('')
const familyFilter = ref<FamilyFilter>('all')
const tierFilter = ref('all')
const groupFilter = ref('all')
const sortKey = ref<SortKey>('newest')
const viewMode = ref<ViewMode>('cards')
const page = ref(1)
const pageSize = ref(20)
const detailRow = ref<ModelMarketModel | null>(null)

const staticModelSpecs: ModelMarketModel[] = [
  makeStaticModel('claude-opus-4-6-thinking', 'Claude Opus 4.6 Thinking', 2600, 'claude', 'Claude', 'opus', ['anthropic', 'antigravity'], { input: 5, output: 25, cacheWrite: 6.25, cacheWrite1h: 10, cacheRead: 0.5 }, { input: 1_000_000, output: 128_000, total: 128_000 }),
  makeStaticModel('claude-opus-4-6', 'Claude Opus 4.6', 2550, 'claude', 'Claude', 'opus', ['anthropic', 'antigravity'], { input: 5, output: 25, cacheWrite: 6.25, cacheWrite1h: 10, cacheRead: 0.5 }, { input: 1_000_000, output: 128_000, total: 128_000 }),
  makeStaticModel('claude-opus-4-7', 'Claude Opus 4.7', 2500, 'claude', 'Claude', 'opus', ['anthropic', 'antigravity'], { input: 5, output: 25, cacheWrite: 6.25, cacheWrite1h: 10, cacheRead: 0.5 }, { input: 1_000_000, output: 128_000, total: 128_000 }),
  makeStaticModel('claude-opus-4-8', 'Claude Opus 4.8', 2450, 'claude', 'Claude', 'opus', ['anthropic', 'antigravity'], { input: 5, output: 25, cacheWrite: 6.25, cacheWrite1h: 10, cacheRead: 0.5 }, { input: 1_000_000, output: 128_000, total: 128_000 }),
  makeStaticModel('claude-fable-5', 'Claude Code (Fable 5)', 2400, 'claude', 'Claude', 'fable', ['anthropic', 'antigravity'], { input: 10, output: 50, cacheWrite: 12.5, cacheWrite1h: 20, cacheRead: 1 }, { input: 1_000_000, output: 128_000, total: 128_000 }),
  makeStaticModel('claude-sonnet-5', 'Claude Sonnet 5', 2350, 'claude', 'Claude', 'sonnet', ['anthropic', 'antigravity'], { input: 3, output: 15, cacheWrite: 3.75, cacheWrite1h: 6, cacheRead: 0.3 }, { input: 1_000_000, output: 128_000, total: 128_000 }),
  makeStaticModel('claude-sonnet-4-6', 'Claude Sonnet 4.6', 2300, 'claude', 'Claude', 'sonnet', ['anthropic', 'antigravity'], { input: 3, output: 15, cacheWrite: 3.75, cacheWrite1h: 6, cacheRead: 0.3 }, { input: 1_000_000, output: 64_000, total: 64_000 }),
  makeStaticModel('claude-haiku-4-5', 'Claude Haiku 4.5', 2200, 'claude', 'Claude', 'haiku', ['anthropic', 'antigravity'], { input: 1, output: 5, cacheWrite: 1.25, cacheWrite1h: 2, cacheRead: 0.1 }, { input: 200_000, output: 64_000, total: 64_000 }),
  makeStaticModel('gemini-3.5-flash', 'Gemini 3.5 Flash', 2150, 'gemini', 'Gemini', 'flagship', ['gemini'], { input: 1.5, output: 9, cacheRead: 0.15 }, { input: 1_048_576, output: 65_535, total: 65_535 }),
  makeStaticModel('gemini-3.5-flash-low', 'Gemini 3.5 Flash Low', 2125, 'gemini', 'Gemini', 'standard', ['gemini'], { input: 1.5, output: 9, cacheRead: 0.15 }, { input: 1_048_576, output: 65_535, total: 65_535 }),
  makeStaticModel('gemini-3.1-pro-preview', 'Gemini 3.1 Pro Preview', 2100, 'gemini', 'Gemini', 'flagship', ['gemini'], { input: 2, output: 12, cacheRead: 0.2 }, { input: 1_048_576, output: 65_536, total: 65_536 }),
  makeStaticModel('gemini-3.1-pro-preview-thinking-128', 'Gemini 3.1 Pro Preview Thinking 128K', 2050, 'gemini', 'Gemini', 'flagship', ['gemini'], { input: 2, output: 12, cacheRead: 0.2 }, { input: 1_048_576, output: 65_536, total: 65_536 }),
  makeStaticModel('gemini-3.1-flash', 'Gemini 3.1 Flash', 2000, 'gemini', 'Gemini', 'standard', ['gemini'], { input: 0.25, output: 1.5, cacheRead: 0.025 }, { input: 1_048_576, output: 65_536, total: 65_536 }),
  makeStaticModel('gemini-3.1-flash-image', 'Gemini 3.1 Flash Image', 1950, 'gemini', 'Gemini', 'standard', ['gemini'], { input: 0.5, output: 3, cacheRead: 0.05 }, { input: 65_536, output: 32_768, total: 32_768 }),
  makeStaticModel('gemini-3-flash', 'Gemini 3 Flash', 1900, 'gemini', 'Gemini', 'standard', ['gemini'], { input: 0.5, output: 3, cacheRead: 0.05 }, { input: 1_048_576, output: 65_535, total: 65_535 }),
  makeStaticModel('gemini-3-flash-thinking-128', 'Gemini 3 Flash Thinking 128K', 1850, 'gemini', 'Gemini', 'standard', ['gemini'], { input: 0.5, output: 3, cacheRead: 0.05 }, { input: 1_048_576, output: 65_535, total: 65_535 }),
  makeStaticModel('gemini-3-pro', 'Gemini 3 Pro', 1800, 'gemini', 'Gemini', 'flagship', ['gemini'], { input: 2, output: 12, cacheRead: 0.2 }, { input: 1_048_576, output: 65_535, total: 65_535 }),
  makeStaticModel('gemini-3-pro-preview', 'Gemini 3 Pro Preview', 1750, 'gemini', 'Gemini', 'flagship', ['gemini'], { input: 2, output: 12, cacheRead: 0.2 }, { input: 1_048_576, output: 65_535, total: 65_535 }),
  makeStaticModel('gemini-2.5-pro', 'Gemini 2.5 Pro', 1500, 'gemini', 'Gemini', 'flagship', ['gemini'], { input: 1.25, output: 10, cacheRead: 0.125 }, { input: 1_048_576, output: 65_535, total: 65_535 }),
  makeStaticModel('gemini-2.5-flash', 'Gemini 2.5 Flash', 1450, 'gemini', 'Gemini', 'standard', ['gemini'], { input: 0.3, output: 2.5, cacheRead: 0.03 }, { input: 1_048_576, output: 65_535, total: 65_535 }),
  makeStaticModel('gemini-2.5-flash-lite', 'Gemini 2.5 Flash Lite', 1400, 'gemini', 'Gemini', 'mini', ['gemini'], { input: 0.1, output: 0.4, cacheRead: 0.01 }, { input: 1_048_576, output: 65_535, total: 65_535 }),
  makeStaticModel('gemini-2.0-flash', 'Gemini 2.0 Flash', 1000, 'gemini', 'Gemini', 'standard', ['gemini'], { input: 0.1, output: 0.4, cacheRead: 0.025 }, { input: 1_048_576, output: 8_192, total: 8_192 }),
  makeStaticModel('gemini-2.0-flash-lite', 'Gemini 2.0 Flash Lite', 950, 'gemini', 'Gemini', 'mini', ['gemini'], { input: 0.075, output: 0.3, cacheRead: 0.01875 }, { input: 1_048_576, output: 8_192, total: 8_192 }),
  makeStaticModel('gpt-5.6-sol', 'GPT-5.6 Sol', 900, 'gpt', 'OpenAI', 'flagship', ['openai'], { input: 5, output: 30, cacheRead: 0.5 }, { input: 1_050_000, output: 128_000, total: 128_000 }),
  makeStaticModel('gpt-5.6-terra', 'GPT-5.6 Terra', 850, 'gpt', 'OpenAI', 'standard', ['openai'], { input: 2.5, output: 15, cacheRead: 0.25 }, { input: 1_050_000, output: 128_000, total: 128_000 }),
  makeStaticModel('gpt-5.6-luna', 'GPT-5.6 Luna', 800, 'gpt', 'OpenAI', 'mini', ['openai'], { input: 1, output: 6, cacheRead: 0.1 }, { input: 1_050_000, output: 128_000, total: 128_000 }),
  makeStaticModel('gpt-5.5', 'GPT-5.5', 700, 'gpt', 'OpenAI', 'flagship', ['openai'], { input: 5, output: 30, cacheRead: 0.5 }, { input: 1_050_000, output: 128_000, total: 128_000 }),
  makeStaticModel('gpt-5.4', 'GPT-5.4', 600, 'gpt', 'OpenAI', 'flagship', ['openai'], { input: 2.5, output: 15, cacheRead: 0.25 }, { input: 1_050_000, output: 128_000, total: 128_000 }),
]

const PriceLines = defineComponent({
  name: 'PriceLines',
  props: {
    pricing: { type: Object as () => ModelMarketPricing | null | undefined, required: false, default: null },
  },
  setup(props) {
    return () => {
      const pricing = props.pricing
      if (!pricing) return h('span', { class: 'text-gray-400' }, '-')
      const rows = [
        ['input', pricing.input_per_1m, '/1M token'],
        ['output', pricing.output_per_1m, '/1M token'],
        ['cacheWrite', pricing.cache_write_per_1m, '/1M token'],
        ['cacheWrite1h', pricing.cache_write_1h_per_1m, '/1M token'],
        ['cacheRead', pricing.cache_read_per_1m, '/1M token'],
        ['perRequest', pricing.per_request, '/req'],
        ['imageOutput', pricing.image_output_per_1m, '/1M token'],
      ] as const
      const visible = rows.filter(([, value]) => value != null && value > 0)
      if (visible.length === 0) return h('span', { class: 'text-gray-400' }, '-')
      return h(
        'div',
        { class: 'price-lines' },
        visible.map(([key, value, unit]) =>
          h('div', { class: 'price-line', key }, [
            h('span', { class: 'price-line-label' }, t(`modelMarket.price.${key}`)),
            h('span', { class: 'price-line-value' }, formatPrice(value, unit)),
          ]),
        ),
      )
    }
  },
})

const rows = computed<ModelMarketModel[]>(() => market.value?.models ?? [])

const groupOptions = computed<ModelMarketGroup[]>(() => {
  const groups = new Map<number, ModelMarketGroup>()
  for (const model of rows.value) {
    for (const offer of model.groups) {
      groups.set(offer.group.id, offer.group)
    }
  }
  return [...groups.values()].sort((a, b) => a.platform.localeCompare(b.platform) || a.effective_rate - b.effective_rate || a.name.localeCompare(b.name))
})

const tierOptions = computed(() => {
  return [...new Set(rows.value.map((row) => row.tier).filter(Boolean))].sort()
})

const familyOptions = computed<FilterOption[]>(() => [
  { value: 'all', label: t('modelMarket.filters.allPlatforms') },
  { value: 'gpt', label: 'GPT' },
  { value: 'claude', label: t('modelMarket.filters.claude') },
  { value: 'gemini', label: 'Gemini' },
])

const tierFilterOptions = computed<FilterOption[]>(() => [
  { value: 'all', label: t('modelMarket.filters.allTiers') },
  ...tierOptions.value.map((tier) => ({ value: tier, label: tierLabel(tier) })),
])

const groupFilterOptions = computed<FilterOption[]>(() => [
  { value: 'all', label: t('modelMarket.filters.allGroups') },
  ...groupOptions.value.map((group) => ({
    value: String(group.id),
    label: `${group.name} · ${platformLabel(group.platform)} · ${formatRate(group.effective_rate)}`,
  })),
])

const sortOptions = computed<FilterOption[]>(() => [
  { value: 'newest', label: t('modelMarket.sort.newest') },
  { value: 'family_name', label: t('modelMarket.sort.platformName') },
  { value: 'lowest_input', label: t('modelMarket.sort.lowestInput') },
  { value: 'lowest_output', label: t('modelMarket.sort.lowestOutput') },
  { value: 'lowest_rate', label: t('modelMarket.sort.lowestRate') },
])

const filteredRows = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  const selectedGroupID = groupFilter.value === 'all' ? null : Number(groupFilter.value)
  let result = rows.value.filter((row) => {
    if (query) {
      const haystack = [
        row.name,
        row.display_provider,
        row.tier,
        row.provider,
        row.mode,
        row.groups.map((offer) => offer.group.name).join(' '),
      ].join(' ').toLowerCase()
      if (!haystack.includes(query)) return false
    }
    if (familyFilter.value !== 'all' && row.family !== familyFilter.value) return false
    if (tierFilter.value !== 'all' && row.tier !== tierFilter.value) return false
    if (selectedGroupID != null && !row.groups.some((offer) => offer.group.id === selectedGroupID)) return false
    return true
  })

  result = [...result].sort((a, b) => {
    switch (sortKey.value) {
      case 'newest':
        return b.display_order - a.display_order || a.name.localeCompare(b.name)
      case 'lowest_input':
        return nullableSort(displayActualPricing(a)?.input_per_1m ?? null, displayActualPricing(b)?.input_per_1m ?? null) || a.name.localeCompare(b.name)
      case 'lowest_output':
        return nullableSort(displayActualPricing(a)?.output_per_1m ?? null, displayActualPricing(b)?.output_per_1m ?? null) || a.name.localeCompare(b.name)
      case 'lowest_rate':
        return nullableSort(displayLowestRate(a), displayLowestRate(b)) || a.name.localeCompare(b.name)
      default:
        return `${a.family}:${a.name}`.localeCompare(`${b.family}:${b.name}`)
    }
  })
  return result
})

const pagedRows = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredRows.value.slice(start, start + pageSize.value)
})

const summary = computed<SummaryStats>(() => {
  let lowestRate: number | null = null
  let lowestInput: number | null = null
  let lowestGroupName = ''

  for (const row of filteredRows.value) {
    const group = displayLowestGroup(row)
    const pricing = group?.pricing
    if (group && (lowestRate == null || group.group.effective_rate < lowestRate)) {
      lowestRate = group.group.effective_rate
      lowestGroupName = group.group.name
    }
    if (pricing?.input_per_1m != null && (lowestInput == null || pricing.input_per_1m < lowestInput)) {
      lowestInput = pricing.input_per_1m
    }
  }

  return { lowestRate, lowestInput, lowestGroupName }
})

watch([searchQuery, familyFilter, tierFilter, groupFilter, sortKey], () => {
  page.value = 1
})

watch(page, () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
})

async function loadModels() {
  loading.value = true
  try {
    market.value = await modelMarketAPI.getModelMarket()
  } catch (err: unknown) {
    if (isNotFoundError(err)) {
      market.value = await buildFallbackMarket()
      return
    }
    appStore.showError(extractApiErrorMessage(err, t('modelMarket.loadError')))
  } finally {
    loading.value = false
  }
}

async function buildFallbackMarket(): Promise<ModelMarketResponse> {
  const [groups, userRates] = await Promise.all([
    userGroupsAPI.getAvailable().catch(() => [] as Group[]),
    userGroupsAPI.getUserGroupRates().catch(() => ({} as Record<number, number>)),
  ])
  const marketGroups = groups.map((group) => toMarketGroup(group, userRates))
  const models = staticModelSpecs.map((model) => attachGroupsToStaticModel(model, marketGroups))
  return {
    models,
    groups: marketGroups,
    meta: {
      unit: 'USD / 1M tokens',
      price_source: 'frontend_fallback',
    },
  }
}

function isNotFoundError(err: unknown): boolean {
  const record = err as Record<string, unknown>
  return record?.status === 404 || String(record?.message || '').includes('404')
}

function toMarketGroup(group: Group, rates: Record<number, number>): ModelMarketGroup {
  const userRate = rates[group.id] ?? null
  const effectiveRate = userRate ?? group.rate_multiplier ?? 1
  return {
    id: group.id,
    name: group.name,
    platform: group.platform,
    subscription_type: group.subscription_type,
    rate_multiplier: group.rate_multiplier,
    user_rate_multiplier: userRate,
    effective_rate: effectiveRate,
    is_exclusive: group.is_exclusive,
  }
}

function attachGroupsToStaticModel(model: ModelMarketModel, groups: ModelMarketGroup[]): ModelMarketModel {
  const allowedPlatforms = new Set(model.group_platforms)
  const groupPrices = groups
    .filter((group) => allowedPlatforms.has(group.platform))
    .map((group) => ({
      group,
      pricing: scalePricing(model.pricing, group.effective_rate),
    }))
    .sort((a, b) => a.group.effective_rate - b.group.effective_rate || a.group.name.localeCompare(b.group.name))
  return {
    ...model,
    groups: groupPrices,
    lowest_group: groupPrices[0] ?? null,
  }
}

function makeStaticModel(
  id: string,
  displayName: string,
  displayOrder: number,
  family: ModelFamily,
  displayProvider: string,
  tier: string,
  groupPlatforms: string[],
  prices: { input: number; output: number; cacheRead?: number; cacheWrite?: number; cacheWrite1h?: number },
  context: { input: number; output: number; total: number },
): ModelMarketModel {
  const provider = family === 'gpt' ? 'openai' : family === 'gemini' ? 'gemini' : 'anthropic'
  return {
    id,
    name: displayName,
    display_order: displayOrder,
    family,
    provider,
    display_provider: displayProvider,
    tier,
    mode: 'chat',
    source: 'litellm_catalog',
    pricing: {
      input_per_1m: prices.input,
      output_per_1m: prices.output,
      cache_write_per_1m: prices.cacheWrite ?? null,
      cache_write_1h_per_1m: prices.cacheWrite1h ?? null,
      cache_read_per_1m: prices.cacheRead ?? null,
      image_output_per_1m: null,
      per_request: null,
    },
    context: {
      max_input_tokens: context.input,
      max_output_tokens: context.output,
      max_tokens: context.total,
    },
    capabilities: [],
    group_platforms: groupPlatforms,
    groups: [],
    lowest_group: null,
  }
}

function scalePricing(pricing: ModelMarketPricing, rate: number): ModelMarketPricing {
  return {
    input_per_1m: scalePrice(pricing.input_per_1m, rate),
    output_per_1m: scalePrice(pricing.output_per_1m, rate),
    cache_write_per_1m: scalePrice(pricing.cache_write_per_1m, rate),
    cache_write_1h_per_1m: scalePrice(pricing.cache_write_1h_per_1m, rate),
    cache_read_per_1m: scalePrice(pricing.cache_read_per_1m, rate),
    image_output_per_1m: scalePrice(pricing.image_output_per_1m, rate),
    per_request: scalePrice(pricing.per_request, rate),
  }
}

function scalePrice(value: number | null, rate: number): number | null {
  if (value == null) return null
  return value * rate
}

function displayGroupPrices(row: ModelMarketModel): ModelMarketGroupPrice[] {
  if (groupFilter.value === 'all') return row.groups
  const groupID = Number(groupFilter.value)
  return row.groups.filter((offer) => offer.group.id === groupID)
}

function displayLowestGroup(row: ModelMarketModel): ModelMarketGroupPrice | null {
  const groups = displayGroupPrices(row)
  return groups.length > 0 ? groups[0] : null
}

function displayActualPricing(row: ModelMarketModel): ModelMarketPricing | null {
  return displayLowestGroup(row)?.pricing ?? null
}

function displayLowestRate(row: ModelMarketModel): number | null {
  return displayLowestGroup(row)?.group.effective_rate ?? null
}

function displayGroupCount(row: ModelMarketModel): number {
  return new Set(displayGroupPrices(row).map((offer) => offer.group.id)).size
}

function lowestGroupSummary(row: ModelMarketModel): string {
  const offer = displayLowestGroup(row)
  if (!offer) return t('modelMarket.noGroup')
  return `${offer.group.name} · ${formatRate(offer.group.effective_rate)}`
}

function nullableSort(a: number | null, b: number | null): number {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  return a - b
}

function formatRate(value: number | null | undefined): string {
  if (value == null) return '-'
  return `x${Number(value).toFixed(2)}`
}

function formatPrice(value: number | null | undefined, unit: string): string {
  if (value == null || value <= 0) return '-'
  const digits = value < 1 ? 4 : value < 10 ? 3 : 2
  return `$${value.toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: 4,
  })} ${unit}`
}

function formatTokens(value: number | null | undefined): string {
  if (!value || value <= 0) return '-'
  if (value >= 1_000_000) return `${Number(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`
  if (value >= 1_000) return `${Number(value / 1_000).toFixed(value % 1_000 === 0 ? 0 : 1)}K`
  return String(value)
}

function platformLabel(platform: string): string {
  switch (platform) {
    case 'openai':
      return 'OpenAI'
    case 'anthropic':
      return 'Anthropic'
    case 'antigravity':
      return 'Claude Code'
    case 'gemini':
      return 'Gemini'
    default:
      return platform || '-'
  }
}

function providerBadgeClass(family: ModelFamily): string {
  switch (family) {
    case 'gpt':
      return 'badge-success'
    case 'gemini':
      return 'badge-primary'
    default:
      return 'badge-warning'
  }
}

function providerMarkClass(family: ModelFamily): string {
  switch (family) {
    case 'gpt':
      return 'model-mark-openai'
    case 'gemini':
      return 'model-mark-gemini'
    default:
      return 'model-mark-claude'
  }
}

function providerMarkText(family: ModelFamily): string {
  switch (family) {
    case 'gpt':
      return 'GPT'
    case 'gemini':
      return 'G'
    default:
      return 'C'
  }
}

const familyDisplayOrder: ModelFamily[] = ['gpt', 'claude', 'gemini']

const pagedGroupedRows = computed(() => {
  const groups = new Map<ModelFamily, { family: ModelFamily; label: string; rows: ModelMarketModel[] }>()
  for (const row of pagedRows.value) {
    const family = row.family as ModelFamily
    const existing = groups.get(family)
    if (existing) {
      existing.rows.push(row)
    } else {
      const label = familyOptions.value.find((o) => o.value === family)?.label || family.toUpperCase()
      groups.set(family, { family, label, rows: [row] })
    }
  }
  return familyDisplayOrder
    .map((family) => groups.get(family))
    .filter((g): g is { family: ModelFamily; label: string; rows: ModelMarketModel[] } => Boolean(g && g.rows.length > 0))
})

function platformList(platforms: string[]): string {
  return platforms.map(platformLabel).join(' / ')
}

function tierLabel(tier: string): string {
  const key = `modelMarket.tiers.${tier}`
  const translated = t(key)
  return translated === key ? tier : translated
}

function openDetail(row: ModelMarketModel) {
  detailRow.value = row
}

async function copyDetailModelName() {
  if (!detailRow.value) return
  try {
    await navigator.clipboard.writeText(detailRow.value.name)
    appStore.showSuccess(t('modelMarket.actions.copied'))
  } catch {
    appStore.showError(t('modelMarket.actions.copyFailed'))
  }
}

onMounted(loadModels)
</script>

<style scoped>
.page-heading {
  @apply flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between;
}

.market-toolbar {
  @apply grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(260px,2fr)_minmax(150px,1fr)_minmax(150px,1fr)_minmax(220px,1.2fr)_minmax(170px,1fr)_auto] xl:items-center;
}

.model-name-block {
  @apply flex max-w-[310px] flex-col gap-2;
}

.seg-control {
  @apply inline-flex items-center rounded-lg border border-gray-200 bg-gray-50 p-0.5 dark:border-dark-600 dark:bg-dark-800;
}

.seg-control-btn {
  @apply inline-flex items-center justify-center rounded-md px-3 text-gray-600 transition-colors hover:bg-white hover:text-gray-900 dark:text-gray-300 dark:hover:bg-dark-700 dark:hover:text-white;
}

.seg-control-btn-active {
  @apply bg-white text-gray-900 shadow-sm dark:bg-dark-700 dark:text-white;
}

.view-toggle {
  @apply inline-flex h-full min-h-[2rem] w-9 items-center justify-center;
}

.price-panel {
  @apply grid grid-cols-1 gap-2 rounded-md bg-gray-50 p-3 dark:bg-dark-800/50;
}

.price-panel div {
  @apply grid grid-cols-[80px_minmax(0,1fr)] items-center gap-3;
}

.price-panel span {
  @apply text-xs text-gray-500 dark:text-gray-400;
}

.price-panel strong {
  @apply min-w-0 break-words text-right text-sm font-semibold tabular-nums text-gray-900 dark:text-white;
}

.actual-tile {
  @apply rounded-md bg-gray-50 p-3 dark:bg-dark-800/50;
}

.actual-tile span {
  @apply block text-xs text-gray-500 dark:text-gray-400;
}

.actual-tile strong {
  @apply mt-1 block break-words text-sm font-bold tabular-nums text-gray-900 dark:text-white;
}

.no-group-panel {
  @apply rounded-md border border-dashed border-gray-200 bg-gray-50 px-3 py-6 text-center text-sm text-gray-500 dark:border-dark-600 dark:bg-dark-800/50 dark:text-dark-300;
}

.price-lines {
  @apply space-y-1;
}

.price-line {
  @apply flex min-w-0 items-center gap-2;
}

.price-line-label {
  @apply shrink-0 text-xs text-gray-500 dark:text-gray-400;
}

.price-line-value {
  @apply min-w-0 break-words font-medium tabular-nums text-gray-900 dark:text-white;
}

.detail-heading {
  @apply text-sm font-bold text-gray-700 dark:text-dark-200;
}

.detail-hero {
  @apply flex flex-col gap-4 rounded-lg bg-gray-50 p-4 dark:bg-dark-800/50 sm:flex-row;
}

.model-mark {
  @apply grid h-14 w-14 shrink-0 place-items-center rounded-lg text-sm font-black tracking-wide;
}

.model-mark-openai {
  @apply bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200;
}

.model-mark-claude {
  @apply bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-200;
}

.model-mark-gemini {
  @apply bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200;
}

.detail-stat {
  @apply rounded-lg bg-gray-50 p-4 dark:bg-dark-800/50;
}

.detail-stat span {
  @apply block text-xs font-semibold uppercase text-gray-500 dark:text-dark-400;
}

.detail-stat strong {
  @apply mt-2 block break-words text-sm font-semibold text-gray-900 dark:text-white;
}
</style>
