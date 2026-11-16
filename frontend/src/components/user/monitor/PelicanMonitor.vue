<template>
  <section v-if="enabled" class="mt-4 w-full border-t border-gray-100 pt-3 dark:border-dark-700" @click.stop @keydown.stop>
    <div class="flex items-center justify-between gap-2">
      <strong class="text-[11px] font-semibold tracking-wider text-gray-500 dark:text-gray-400">降智检测</strong>
      <button type="button" class="rounded-md px-1.5 py-1 text-xs font-medium text-primary-600 transition-colors hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-500/10" @click.stop="open()">查看作品 ↗</button>
    </div>
    <div v-if="!visibleModels.length" class="mt-2 text-xs text-gray-400">等待首次检测</div>
    <div v-for="model in visibleModels" :key="model" class="mt-3">
      <div class="flex items-center justify-between gap-2 text-xs">
        <span class="min-w-0 truncate font-mono text-gray-500 dark:text-gray-400">{{ model }}</span>
        <span v-if="grouped[model]?.length" :class="statusClass(grouped[model][0])">{{ statusLabel(grouped[model][0]) }}</span>
        <span v-else class="text-gray-400">等待首次检测</span>
      </div>
      <div v-if="grouped[model]?.length" class="mt-1.5 grid grid-cols-10 gap-1">
        <button v-for="run in [...grouped[model]].reverse()" :key="run.id" type="button"
          class="h-2.5 min-w-0 rounded-sm transition-opacity hover:opacity-75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500" :class="barClass(run)"
          :title="`${new Date(run.started_at).toLocaleString()} · ${statusLabel(run)} · ${run.source_length} 字符`"
          :aria-label="`${model} ${statusLabel(run)}`" @click.stop="open(run)" />
      </div>
    </div>
    <BaseDialog :show="show" :title="`降智检测 · ${monitorName}`" width="extra-wide" @close="show = false">
      <div class="tabs mb-4 inline-flex max-w-full flex-wrap" role="tablist" aria-label="选择检测模型">
        <button v-for="model in visibleModels" :key="model" type="button"
          role="tab" :aria-selected="selectedModel === model" class="tab"
          :class="selectedModel === model ? 'tab-active' : ''"
          @click="selectModel(model)">{{ model }}</button>
      </div>
      <div class="grid min-h-[28rem] gap-4 md:grid-cols-[13rem_minmax(0,1fr)]">
        <aside class="max-h-[32rem] overflow-auto rounded-xl bg-gray-50 p-2 dark:bg-dark-900">
          <div class="px-2 py-1 text-xs font-semibold text-gray-500">{{ selectedModel }} 检测记录</div>
          <button v-for="run in selectedModelItems" :key="run.id" type="button" class="block w-full rounded-lg p-2 text-left text-xs hover:bg-white dark:hover:bg-dark-700"
            :class="selected?.id === run.id ? 'bg-white ring-1 ring-primary-300 dark:bg-dark-700' : ''" @click="selected = run">
            <span class="block font-medium">{{ new Date(run.started_at).toLocaleString() }}</span>
            <span class="block" :class="statusClass(run)">{{ statusLabel(run) }}</span>
            <span class="text-gray-400">结束 {{ new Date(run.finished_at).toLocaleString() }}</span>
          </button>
        </aside>
        <div class="min-w-0">
          <template v-if="selected">
            <div class="flex flex-wrap items-center gap-2 text-xs text-gray-500">
              <strong>{{ selected.model }}</strong><span :class="statusClass(selected)">{{ statusLabel(selected) }}</span>
              <span>源码 {{ selected.source_length }} 字符</span>
            </div>
            <div class="mt-2 grid gap-1 text-xs text-gray-500 sm:grid-cols-2">
              <span>开始：{{ new Date(selected.started_at).toLocaleString() }}</span>
              <span>结束：{{ new Date(selected.finished_at).toLocaleString() }}</span>
            </div>
            <div class="tabs my-3 inline-flex" role="group" aria-label="作品显示方式">
              <button type="button" class="tab" :class="!showSource ? 'tab-active' : ''" :aria-pressed="!showSource" @click="showSource = false">查看作品</button>
              <button type="button" class="tab" :class="showSource ? 'tab-active' : ''" :aria-pressed="showSource" @click="showSource = true">查看源码</button>
            </div>
            <pre v-if="showSource" class="h-96 overflow-auto whitespace-pre-wrap rounded-xl bg-gray-900 p-4 text-xs text-gray-100">{{ selected.artifact || selected.message || '暂无作品' }}</pre>
            <iframe v-else-if="selected.artifact" :srcdoc="previewDocument(selected.artifact)" sandbox="allow-scripts" referrerpolicy="no-referrer" title="鹈鹕作品预览" class="h-96 w-full rounded-xl border border-gray-200 bg-white dark:border-dark-700" />
            <div v-else class="p-8 text-center text-sm text-gray-400">{{ selected.message || '暂无作品' }}</div>
          </template>
          <div v-else class="p-8 text-center text-sm text-gray-400">暂无检测记录</div>
        </div>
      </div>
      <template #footer><button type="button" class="btn btn-secondary" @click="show = false">关闭</button></template>
    </BaseDialog>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import BaseDialog from '@/components/common/BaseDialog.vue'
import { pelican, type PelicanResult } from '@/api/channelMonitor'

const props = defineProps<{ monitorId: number; monitorName: string }>()
const enabled = ref(false)
const items = ref<PelicanResult[]>([])
const configuredModels = ref<string[]>([])
const selected = ref<PelicanResult | null>(null)
const selectedModel = ref('')
const show = ref(false)
const showSource = ref(false)
let requestVersion = 0
let refreshTimer: ReturnType<typeof setInterval> | undefined
const grouped = computed(() => {
  const out: Record<string, PelicanResult[]> = {}
  for (const item of items.value) (out[item.model] ||= []).push(item)
  return out
})
const models = computed(() => Object.keys(grouped.value))
const visibleModels = computed(() => [...new Set([...configuredModels.value, ...models.value])])
const selectedModelItems = computed(() => items.value.filter(item => item.model === selectedModel.value))
async function load() {
  const version = ++requestVersion
  try {
    const result = await pelican(props.monitorId)
    if (version !== requestVersion) return
    enabled.value = result.enabled
    configuredModels.value = result.models || []
    items.value = result.items || []
  } catch {
    if (version === requestVersion) enabled.value = false
  }
}
watch(() => props.monitorId, () => { void load() })
onMounted(() => {
  void load()
  refreshTimer = setInterval(() => { if (!document.hidden) void load() }, 60_000)
})
onUnmounted(() => { requestVersion++; if (refreshTimer) clearInterval(refreshTimer) })
function open(run?: PelicanResult) {
  selectedModel.value = run?.model || visibleModels.value[0] || ''
  selected.value = run || items.value.find(item => item.model === selectedModel.value) || null
  showSource.value = false
  show.value = true
}
function selectModel(model: string) {
  selectedModel.value = model
  selected.value = items.value.find(item => item.model === model) || null
  showSource.value = false
}
function statusLabel(run: PelicanResult) { return run.status === 'passed' ? '检测通过 · 100分' : run.status === 'failed' ? '未通过 · 0分' : '检测错误' }
function statusClass(run: PelicanResult) { return run.status === 'passed' ? 'text-emerald-600 dark:text-emerald-400' : run.status === 'failed' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400' }
function barClass(run: PelicanResult) { return run.status === 'passed' ? 'bg-emerald-500' : run.status === 'failed' ? 'bg-red-500' : 'bg-amber-500' }
function previewDocument(artifact: string) {
  // The opaque-origin sandbox allows local animation scripts while denying
  // same-origin access, navigation, forms and remote-resource loading.
  return `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; script-src 'unsafe-inline'; connect-src 'none'; form-action 'none'; base-uri 'none'; object-src 'none'; frame-src 'none'; worker-src 'none'">${artifact}`
}
</script>
