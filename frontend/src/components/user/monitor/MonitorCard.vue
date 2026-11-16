<template>
  <div
    role="button"
    tabindex="0"
    class="group text-left p-5 rounded-2xl min-h-[280px] w-full bg-white/70 backdrop-blur-xl border border-gray-200/80 shadow-card dark:bg-dark-800/60 dark:border-dark-700/70 hover:-translate-y-1 hover:shadow-card-hover dark:hover:border-primary-500/30 hover:border-gray-300 transition-all duration-300 ease-out flex flex-col"
    @click="emit('click')"
    @keydown.enter.self="emit('click')"
    @keydown.space.self.prevent="emit('click')"
  >
    <!-- Header: icon + name/model + status chip -->
    <div class="flex items-start gap-3">
      <ProviderIconBadge :provider="item.provider" />
      <div class="flex-1 min-w-0">
        <div class="text-base font-semibold truncate text-gray-900 dark:text-gray-100">
          {{ item.name }}
        </div>
        <div class="mt-1 flex flex-wrap items-center gap-1.5 min-w-0">
          <span
            class="inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium flex-shrink-0"
            :class="providerBadgeClass(item.provider)"
          >
            {{ providerLabel(item.provider) }}
          </span>
          <!-- 纯配额模式主模型是占位符 "quota"，展示层替换为本地化「配额」标签 -->
          <span class="font-mono text-xs truncate text-gray-500 dark:text-gray-400">
            {{ formatMonitorModel(item.primary_model) }}
          </span>
          <span
            v-if="item.group_name"
            class="inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-600 dark:bg-dark-700 dark:text-gray-300 flex-shrink-0"
          >
            {{ item.group_name }}
          </span>
          <span class="inline-flex items-center rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-dark-700 dark:text-gray-300">倍率 {{ item.display_metrics?.display_rate != null ? `${item.display_metrics.display_rate}×` : '未设置' }}</span>
        </div>
      </div>
      <span
        class="px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0"
        :class="statusBadgeClass(item.primary_status)"
      >
        {{ statusLabel(item.primary_status) }}
      </span>
    </div>

    <!-- Metrics -->
    <div class="mt-5 grid grid-cols-3 gap-2">
      <div class="min-w-0 rounded-xl border border-gray-100 bg-gray-50/80 p-3 dark:border-dark-700/50 dark:bg-dark-900/40" title="关联分组近 3 天缓存读取 Token 占输入 Token 的比例">
        <div class="text-[10px] font-semibold tracking-wider text-gray-400">缓存率</div>
        <div class="mt-1.5 text-lg font-bold font-mono tabular-nums text-gray-900 dark:text-gray-100">{{ item.display_metrics?.cache_rate == null ? '—' : `${item.display_metrics.cache_rate.toFixed(1)}%` }}</div>
        <div class="mt-1 text-[10px] text-gray-400">近 3 天 · 分组</div>
      </div>
      <div class="min-w-0 rounded-xl border border-gray-100 bg-gray-50/80 p-3 dark:border-dark-700/50 dark:bg-dark-900/40">
        <div class="text-[10px] font-semibold tracking-wider text-gray-400">可用率 · {{ window }}</div>
        <div class="mt-1.5 text-lg font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">{{ availabilityValue == null ? '—' : `${availabilityValue.toFixed(2)}%` }}</div>
      </div>
      <div class="min-w-0 rounded-xl border border-gray-100 bg-gray-50/80 p-3 dark:border-dark-700/50 dark:bg-dark-900/40" title="关联分组近 90 分钟有效请求的平均首 Token 时间">
        <div class="text-[10px] font-semibold tracking-wider text-gray-400">首 Token</div>
        <div class="mt-1.5 text-lg font-bold font-mono tabular-nums text-gray-900 dark:text-gray-100">{{ item.display_metrics?.first_token_ms == null ? '—' : `${(item.display_metrics.first_token_ms / 1000).toFixed(2)}s` }}</div>
        <div class="mt-1 text-[10px] text-gray-400">近 90 分钟 · 分组</div>
      </div>
    </div>
    <div class="mt-3 text-xs text-gray-500 dark:text-gray-400">探活延迟 {{ formatLatency(item.primary_latency_ms) }} ms · Ping {{ formatLatency(item.primary_ping_latency_ms) }} ms</div>

    <!-- 配额模式：最新用量/余额快照（服务端已按系统开关剥离，此处 flag 为纵深防御） -->
    <MonitorQuotaView v-if="quotaVisible" :snapshot="item.latest_quota" class="mt-2" />

    <!-- Timeline -->
    <MonitorTimeline
      :buckets="item.timeline"
      :countdown-seconds="countdownSeconds"
    />
    <PelicanMonitor v-if="item.provider === 'openai'" :monitor-id="item.id" :monitor-name="item.name" @click.stop />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { UserMonitorView } from '@/api/channelMonitor'
import { useChannelMonitorFormat } from '@/composables/useChannelMonitorFormat'
import { isChannelMonitorQuotaVisible } from '@/utils/featureFlags'
import ProviderIconBadge from './ProviderIconBadge.vue'
import MonitorTimeline from './MonitorTimeline.vue'
import MonitorQuotaView from '@/components/common/MonitorQuotaView.vue'
import PelicanMonitor from './PelicanMonitor.vue'

const props = defineProps<{
  item: UserMonitorView
  window: '7d' | '15d' | '30d'
  availabilityValue: number | null
  countdownSeconds: number
}>()

const emit = defineEmits<{
  (e: 'click'): void
}>()

const {
  statusLabel,
  statusBadgeClass,
  providerLabel,
  providerBadgeClass,
  formatLatency,
  formatMonitorModel,
} = useChannelMonitorFormat()

const quotaVisible = computed(
  () => isChannelMonitorQuotaVisible() && !!props.item.latest_quota
)

</script>
