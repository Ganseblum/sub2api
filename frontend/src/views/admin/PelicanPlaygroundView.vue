<template>
  <AppLayout>
    <div class="mx-auto w-full max-w-[1500px] space-y-6 pb-8">
      <header class="page-header mb-0 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-900/5 dark:bg-dark-800 dark:ring-dark-700 sm:p-6">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 class="page-title flex items-center gap-2 text-xl font-black text-gray-900 dark:text-white">
              <span class="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400"><Icon name="sparkles" size="sm" /></span>
              鹈鹕作品工坊
            </h1>
            <p class="page-description mt-1.5 text-xs text-gray-500 dark:text-gray-400">仅管理员可用。临时测试上游 URL、Key 和 Prompt，查看生成作品并保留最近 3 天的脱敏历史。</p>
          </div>
          <span class="rounded-full border border-gray-200 px-3 py-1.5 text-xs text-gray-500 dark:border-dark-600 dark:text-gray-400">管理员专用 · 72 小时自动清理</span>
        </div>
      </header>

      <div class="grid items-start gap-5 xl:grid-cols-[minmax(320px,390px)_minmax(0,1fr)]">
        <section class="rounded-2xl border border-gray-200/80 bg-white shadow-card dark:border-dark-700 dark:bg-dark-800">
          <div class="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-dark-700">
            <h2 class="text-sm font-semibold text-gray-800 dark:text-gray-100">新建测试</h2>
            <span class="text-[11px] text-gray-400">不会修改渠道配置</span>
          </div>
          <form class="space-y-4 p-5" @submit.prevent="submit">
            <div>
              <label for="playground-endpoint" class="input-label">上游 URL <span class="text-red-500">*</span></label>
              <input id="playground-endpoint" v-model.trim="form.endpoint" class="input" type="url" placeholder="https://api.example.com/v1" required maxlength="500" />
            </div>
            <div>
              <label for="playground-api-key" class="input-label">API Key <span class="text-red-500">*</span></label>
              <input id="playground-api-key" v-model="form.api_key" class="input font-mono" type="password" autocomplete="new-password" placeholder="仅本次请求使用" required maxlength="2000" />
              <p class="mt-1 text-[11px] text-gray-400">历史只保存脱敏 Key；明文不会写入历史记录。</p>
            </div>
            <div>
              <label for="playground-model" class="input-label">模型 <span class="text-red-500">*</span></label>
              <input id="playground-model" v-model.trim="form.model" class="input font-mono" placeholder="gpt-6-astra" required maxlength="200" />
            </div>
            <div>
              <label for="playground-api-mode" class="input-label">API 协议</label>
              <Select id="playground-api-mode" v-model="form.api_mode" :options="apiModeOptions" />
            </div>
            <div>
              <label for="playground-prompt" class="input-label">Prompt <span class="text-red-500">*</span></label>
              <textarea id="playground-prompt" v-model="form.prompt" class="input min-h-36 resize-y leading-relaxed" required maxlength="50000" placeholder="输入要发送给模型的 Prompt" />
              <p class="mt-1 text-[11px] text-gray-400">{{ form.prompt.length.toLocaleString() }} / 50,000 字符</p>
            </div>
            <div class="flex flex-wrap items-center gap-3 pt-1">
              <button type="submit" class="btn btn-primary" :disabled="running || !form.api_key.trim()">
                <Icon v-if="!running" name="play" size="xs" />
                {{ running ? '生成中…' : '生成作品' }}
              </button>
              <span class="text-[11px] text-gray-400">请求可能需要几分钟，按上游实际规则计费</span>
            </div>
          </form>
        </section>

        <section class="min-w-0 rounded-2xl border border-gray-200/80 bg-white shadow-card dark:border-dark-700 dark:bg-dark-800">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 dark:border-dark-700">
            <div>
              <h2 class="text-sm font-semibold text-gray-800 dark:text-gray-100">作品预览</h2>
              <p class="mt-1 text-[11px] text-gray-400">{{ selected ? `${selected.model} · ${formatTime(selected.started_at)} · ${statusLabel(selected)}` : '完成一次测试后显示结果' }}</p>
            </div>
            <div class="tabs inline-flex" role="group" aria-label="作品显示方式">
              <button type="button" class="tab" :class="!showSource ? 'tab-active' : ''" :aria-pressed="!showSource" @click="showSource = false">查看作品</button>
              <button type="button" class="tab" :class="showSource ? 'tab-active' : ''" :aria-pressed="showSource" @click="showSource = true">查看源码</button>
            </div>
          </div>
          <div class="min-h-[420px] p-4 sm:p-5">
            <pre v-if="selected && showSource" class="h-[420px] overflow-auto whitespace-pre-wrap break-words rounded-xl bg-gray-900 p-4 text-xs leading-relaxed text-gray-100">{{ selected.content || selected.message || '暂无源码' }}</pre>
            <iframe v-else-if="selected?.artifact" :srcdoc="previewDocument(selected.artifact)" sandbox="allow-scripts" referrerpolicy="no-referrer" title="鹈鹕作品预览" class="h-[420px] w-full rounded-xl border border-gray-200 bg-white dark:border-dark-700" />
            <div v-else-if="selected" class="grid min-h-[420px] place-items-center rounded-xl border border-dashed border-gray-200 bg-gray-50/60 px-6 text-center dark:border-dark-700 dark:bg-dark-900/30">
              <div><div class="text-sm font-medium text-gray-500 dark:text-gray-300">{{ selected.message || '模型没有返回完整 HTML 作品' }}</div><p class="mt-2 text-xs text-gray-400">可以切换到“查看源码”检查模型返回内容。</p></div>
            </div>
            <div v-else class="grid min-h-[420px] place-items-center rounded-xl border border-dashed border-gray-200 bg-gray-50/60 text-sm text-gray-400 dark:border-dark-700 dark:bg-dark-900/30">生成的作品会显示在这里</div>
          </div>
        </section>
      </div>

      <section class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-card dark:border-dark-700 dark:bg-dark-800">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 dark:border-dark-700">
          <div><h2 class="text-sm font-semibold text-gray-800 dark:text-gray-100">测试历史</h2><p class="mt-1 text-[11px] text-gray-400">仅显示当前管理员最近 50 条；记录在 3 天后自动删除。</p></div>
          <button type="button" class="btn btn-secondary !px-3 !py-2 text-xs" :disabled="historyLoading" @click="loadHistory">刷新</button>
        </div>
        <div v-if="historyLoading && history.length === 0" class="p-8 text-center text-sm text-gray-400">加载历史记录…</div>
        <div v-else-if="history.length === 0" class="p-8 text-center text-sm text-gray-400">暂无测试记录</div>
        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-[860px] text-left text-xs">
            <thead class="bg-gray-50 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:bg-dark-900/40"><tr><th class="px-4 py-3">时间</th><th class="px-4 py-3">模型</th><th class="px-4 py-3">上游 URL</th><th class="px-4 py-3">API Key</th><th class="px-4 py-3">Prompt</th><th class="px-4 py-3">结果</th><th class="px-4 py-3">过期时间</th><th class="px-4 py-3"></th></tr></thead>
            <tbody class="divide-y divide-gray-100 dark:divide-dark-700"><tr v-for="item in history" :key="item.id" class="text-gray-600 dark:text-gray-300">
              <td class="whitespace-nowrap px-4 py-3">{{ formatTime(item.started_at) }}</td><td class="whitespace-nowrap px-4 py-3 font-mono">{{ item.model }}</td>
              <td class="max-w-56 truncate px-4 py-3" :title="item.endpoint">{{ item.endpoint }}</td><td class="whitespace-nowrap px-4 py-3 font-mono text-gray-400">{{ item.api_key_masked }}</td>
              <td class="max-w-56 truncate px-4 py-3" :title="item.prompt">{{ item.prompt }}</td><td class="px-4 py-3"><span class="rounded-full px-2 py-1 text-[10px] font-medium" :class="statusClass(item)">{{ statusLabel(item) }}</span></td>
              <td class="whitespace-nowrap px-4 py-3 text-gray-400">{{ formatTime(item.expires_at) }}</td><td class="px-4 py-3"><button type="button" class="text-primary-600 hover:underline dark:text-primary-400" @click="selectResult(item)">查看</button></td>
            </tr></tbody>
          </table>
        </div>
      </section>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import Icon from '@/components/icons/Icon.vue'
import Select from '@/components/common/Select.vue'
import { adminAPI } from '@/api/admin'
import type { APIMode } from '@/api/admin/channelMonitor'
import type { PelicanPlaygroundResult } from '@/api/admin/pelicanPlayground'
import { extractApiErrorMessage } from '@/utils/apiError'
import { useAppStore } from '@/stores/app'

const app = useAppStore()
const form = reactive({ endpoint: '', api_key: '', model: 'gpt-6-astra', api_mode: 'chat_completions' as APIMode, prompt: '创建一个HTML，内容是SVG绘制一个鹈鹕骑自行车的2D动画，你不需要任何测试，只靠你自己完成，不要使用任何skill，不要依赖我本地的AGENTS.md' })
const apiModeOptions = [{ value: 'chat_completions', label: 'Chat Completions' }, { value: 'responses', label: 'Responses API' }]
const running = ref(false)
const historyLoading = ref(false)
const history = ref<PelicanPlaygroundResult[]>([])
const selected = ref<PelicanPlaygroundResult | null>(null)
const showSource = ref(false)

onMounted(() => { void loadHistory() })
async function loadHistory() {
  historyLoading.value = true
  try { const result = await adminAPI.pelicanPlayground.history(); history.value = result.items || [] }
  catch (error) { app.showError(extractApiErrorMessage(error, '加载测试历史失败')) }
  finally { historyLoading.value = false }
}
async function submit() {
  if (running.value) return
  running.value = true
  try {
    const result = await adminAPI.pelicanPlayground.run({ ...form })
    selected.value = result
    showSource.value = false
    form.api_key = ''
    app.showSuccess(result.status === 'error' ? '请求已完成，查看结果中的错误信息' : '作品已生成，API Key 未保存')
    await loadHistory()
  } catch (error) { app.showError(extractApiErrorMessage(error, '生成失败，请检查 URL、Key、模型和 Prompt')) }
  finally { form.api_key = ''; running.value = false }
}
function selectResult(item: PelicanPlaygroundResult) { selected.value = item; showSource.value = false; window.scrollTo({ top: 0, behavior: 'smooth' }) }
function formatTime(value: string) { return new Date(value).toLocaleString() }
function statusLabel(item: PelicanPlaygroundResult) { return item.status === 'passed' ? '生成完成' : item.status === 'failed' ? '作品待复核' : '请求错误' }
function statusClass(item: PelicanPlaygroundResult) { return item.status === 'passed' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : item.status === 'failed' ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300' : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300' }
function previewDocument(html: string) { return `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; script-src 'unsafe-inline'; connect-src 'none'; form-action 'none'; base-uri 'none'; object-src 'none'; frame-src 'none'; worker-src 'none'">${html}` }
</script>
