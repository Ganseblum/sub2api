<template>
  <BaseDialog :show="show" title="降智检测结果" width="extra-wide" @close="$emit('close')">
    <div class="grid min-h-[28rem] gap-4 md:grid-cols-[13rem_minmax(0,1fr)]">
      <aside class="max-h-[32rem] overflow-auto rounded-xl bg-gray-50 p-2 dark:bg-dark-900">
        <div class="px-2 py-1 text-xs font-semibold text-gray-500">本次检测</div>
        <button v-for="run in items" :key="run.id" type="button"
          class="block w-full rounded-lg p-2 text-left text-xs hover:bg-white dark:hover:bg-dark-700"
          :class="selected?.id === run.id ? 'bg-white ring-1 ring-primary-300 dark:bg-dark-700' : ''"
          @click="selected = run; showSource = false">
          <span class="block font-medium">{{ run.model }}</span>
          <span class="block" :class="statusClass(run)">{{ statusLabel(run) }}</span>
          <span class="text-gray-400">{{ run.source_length.toLocaleString() }} 字符</span>
          <span class="block text-gray-400">开始 {{ new Date(run.started_at).toLocaleString() }}</span>
          <span class="block text-gray-400">结束 {{ new Date(run.finished_at).toLocaleString() }}</span>
        </button>
      </aside>
      <div class="min-w-0">
        <template v-if="selected">
          <div class="flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <strong>{{ selected.model }}</strong><span :class="statusClass(selected)">{{ statusLabel(selected) }}</span>
            <span>源码 {{ selected.source_length.toLocaleString() }} 字符</span>
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
          <div v-else class="p-8 text-center text-sm text-gray-400">{{ selected.message || '模型没有返回完整 HTML 作品' }}</div>
        </template>
        <div v-else class="p-8 text-center text-sm text-gray-400">本次没有可检测的 GPT 模型</div>
      </div>
    </div>
    <template #footer><button type="button" class="btn btn-secondary" @click="$emit('close')">关闭</button></template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseDialog from '@/components/common/BaseDialog.vue'
import type { PelicanResult } from '@/api/admin/channelMonitor'

const props = defineProps<{ show: boolean; items: PelicanResult[] }>()
defineEmits<{ (e: 'close'): void }>()
const selected = ref<PelicanResult | null>(null)
const showSource = ref(false)
watch(() => [props.show, props.items] as const, () => {
  if (props.show) {
    selected.value = props.items[0] || null
    showSource.value = false
  }
}, { immediate: true })
function statusLabel(run: PelicanResult) { return run.status === 'passed' ? '检测通过 · 100分' : run.status === 'failed' ? '未通过 · 0分' : '检测错误' }
function statusClass(run: PelicanResult) { return run.status === 'passed' ? 'text-emerald-600 dark:text-emerald-400' : run.status === 'failed' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400' }
function previewDocument(artifact: string) {
  return `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; script-src 'unsafe-inline'; connect-src 'none'; form-action 'none'; base-uri 'none'; object-src 'none'; frame-src 'none'; worker-src 'none'">${artifact}`
}
</script>
