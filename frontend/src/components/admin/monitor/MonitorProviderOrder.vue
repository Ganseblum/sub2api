<template>
  <details class="mb-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-900/5 dark:bg-dark-800 dark:ring-dark-700 sm:p-6" @toggle="onToggle">
    <summary class="cursor-pointer text-sm font-semibold text-gray-700 dark:text-gray-200">渠道状态供应商分组顺序</summary>
    <p class="mt-2 text-xs text-gray-400">数字越小越靠前；相同数字按供应商名称排列。各渠道组内顺序可在编辑渠道时设置。</p>
    <div v-if="loading" class="mt-4 text-sm text-gray-500 dark:text-gray-400">加载中…</div>
    <template v-else>
      <div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div v-for="entry in orders" :key="entry.provider">
          <label :for="`provider-order-${entry.provider}`" class="input-label">{{ providerLabel(entry.provider) }}</label>
          <input :id="`provider-order-${entry.provider}`" v-model.number="entry.sort_order" type="number" min="-10000" max="10000" step="1" class="input" />
        </div>
      </div>
      <div class="mt-3 flex justify-end"><button type="button" class="btn btn-primary" :disabled="saving || !loaded" @click="save">{{ saving ? '保存中…' : '保存分组顺序' }}</button></div>
    </template>
  </details>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { adminAPI } from '@/api/admin'
import type { Provider, ProviderOrder } from '@/api/admin/channelMonitor'
import { useAppStore } from '@/stores/app'
import { extractApiErrorMessage } from '@/utils/apiError'
import { useChannelMonitorFormat } from '@/composables/useChannelMonitorFormat'

const providers: Provider[] = ['openai', 'anthropic', 'gemini', 'grok', 'antigravity', 'kimi', 'zhipu', 'deepseek', 'minimax', 'opencode_go']
const orders = ref<ProviderOrder[]>([])
const loading = ref(false)
const loaded = ref(false)
const saving = ref(false)
const app = useAppStore()
const { providerLabel } = useChannelMonitorFormat()
async function onToggle(event: Event) {
  if (!(event.target as HTMLDetailsElement).open || loaded.value || loading.value) return
  loading.value = true
  try {
    const result = await adminAPI.channelMonitor.getProviderOrders()
    const values = new Map(result.items.map(item => [item.provider, item.sort_order]))
    orders.value = providers.map(provider => ({ provider, sort_order: values.get(provider) ?? 0 }))
    loaded.value = true
  } catch (error) { app.showError(extractApiErrorMessage(error, '加载分组顺序失败')) }
  finally { loading.value = false }
}
async function save() {
  if (orders.value.some(item => !Number.isInteger(item.sort_order) || item.sort_order < -10000 || item.sort_order > 10000)) {
    app.showError('请输入 -10000 到 10000 之间的整数顺序')
    return
  }
  saving.value = true
  try { await adminAPI.channelMonitor.updateProviderOrders(orders.value); app.showSuccess('分组顺序已保存') }
  catch (error) { app.showError(extractApiErrorMessage(error, '保存分组顺序失败')) }
  finally { saving.value = false }
}
</script>
