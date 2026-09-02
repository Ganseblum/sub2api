<template>
  <AppLayout>
    <div class="card min-h-full overflow-hidden">
      <div class="flex max-h-[calc(100vh-138px)] min-h-[calc(100vh-138px)] flex-col lg:flex-row">
        <!-- Catalog Sidebar -->
        <aside class="flex flex-col flex-shrink-0 bg-white dark:bg-dark-800 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-dark-700 lg:w-[280px] max-h-[calc(100vh-138px)] min-h-[calc(100vh-138px)] overflow-y-auto">
          <div class="p-4 border-b border-gray-200 dark:border-dark-700">
            <div class="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-dark-400">{{ t('helpCenter.catalog') }}</div>
            <div class="text-base font-extrabold mt-0.5 text-gray-900 dark:text-white">{{ t('helpCenter.title') }}</div>
          </div>

          <div class="p-3">
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="t('helpCenter.searchPlaceholder')"
              class="input w-full text-sm"
            />
          </div>

          <nav class="flex-1 min-h-0 overflow-y-auto p-3 pt-0">
            <div
              v-for="section in filteredCatalog"
              :key="section.key"
              class="mb-4"
            >
              <div class="px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-dark-400">
                {{ section.title }}
              </div>
              <button
                v-for="item in section.items"
                :key="item.id"
                type="button"
                class="help-cat-link w-full text-left rounded-lg"
                :class="{ active: currentArticle?.id === item.id }"
                @click="selectArticle(item)"
              >
                {{ item.title }}
                <span v-if="item.recommended" class="ml-1 text-[10px] font-bold text-primary-600 dark:text-primary-400">({{ t('helpCenter.recommended') }})</span>
              </button>
            </div>
          </nav>
        </aside>

        <!-- Article Content -->
        <article class="flex flex-col flex-1 min-h-0 bg-gray-50/50 dark:bg-dark-900/30">
          <div class="flex flex-wrap items-center justify-between gap-3 min-h-[56px] border-b border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 px-6 py-3">
            <div class="flex flex-wrap items-center gap-2 text-sm">
              <span class="text-gray-500 dark:text-dark-400">{{ t('helpCenter.title') }}</span>
              <span class="text-gray-400 dark:text-dark-500">/</span>
              <span class="font-bold text-gray-900 dark:text-white">{{ currentSectionTitle }}</span>
              <span class="text-gray-400 dark:text-dark-500">/</span>
              <span class="font-extrabold text-gray-900 dark:text-white">{{ currentArticle?.title }}</span>
            </div>
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="btn btn-secondary btn-sm"
                :disabled="!previousArticle"
                @click="goPrevious"
              >
                ← {{ t('helpCenter.previous') }}
              </button>
              <button
                type="button"
                class="btn btn-secondary btn-sm"
                :disabled="!nextArticle"
                @click="goNext"
              >
                {{ t('helpCenter.next') }} →
              </button>
            </div>
          </div>

          <div ref="articleBody" class="flex-1 min-h-0 overflow-y-auto p-6 md:p-8">
            <div class="max-w-5xl">
              <h1 class="text-2xl md:text-3xl font-extrabold mb-2 tracking-tight text-gray-900 dark:text-white">{{ currentArticle?.title }}</h1>
              <p class="text-sm text-gray-500 dark:text-dark-400 mb-8">{{ t('helpCenter.lastUpdated') }}: {{ currentArticle?.updatedAt }}</p>

              <div class="help-content" v-html="renderedContent" />
            </div>
          </div>
        </article>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import AppLayout from '@/components/layout/AppLayout.vue'
import { buildCatalog } from '@/data/helpCenter'

const { t, tm } = useI18n()

const renderer = new marked.Renderer()
renderer.link = ({ href, title, text }: { href: string; title?: string | null; text: string }) => {
  const isExternal = /^https?:\/\//.test(href)
  const attrs = isExternal
    ? ' target="_blank" rel="noopener noreferrer"'
    : ''
  const titleAttr = title ? ` title="${title}"` : ''
  return `<a href="${href}"${titleAttr}${attrs}>${text}</a>`
}

marked.setOptions({
  breaks: true,
  gfm: true,
  renderer
})

export interface HelpArticle {
  id: string
  title: string
  sectionKey: string
  sectionTitle: string
  recommended?: boolean
  updatedAt: string
  contentMd: string
}

export interface HelpSection {
  key: string
  title: string
  items: HelpArticle[]
}

const searchQuery = ref('')
const articleBody = ref<HTMLElement | null>(null)

const catalog = computed(() => buildCatalog(t, tm))
const currentArticle = ref<HelpArticle>(catalog.value[0].items[0])

watch(catalog, (newCatalog) => {
  const exists = newCatalog.some((section) => section.items.some((item) => item.id === currentArticle.value?.id))
  if (!exists && newCatalog.length > 0 && newCatalog[0].items.length > 0) {
    currentArticle.value = newCatalog[0].items[0]
  }
})

const filteredCatalog = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return catalog.value
  return catalog.value
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.contentMd.toLowerCase().includes(q)
      )
    }))
    .filter((section) => section.items.length > 0)
})

const currentSectionTitle = computed(() => currentArticle.value?.sectionTitle ?? '')

const flatArticles = computed(() => catalog.value.flatMap((s) => s.items))

const currentIndex = computed(() =>
  flatArticles.value.findIndex((a) => a.id === currentArticle.value?.id)
)

const previousArticle = computed(() =>
  currentIndex.value > 0 ? flatArticles.value[currentIndex.value - 1] : null
)

const nextArticle = computed(() =>
  currentIndex.value >= 0 && currentIndex.value < flatArticles.value.length - 1
    ? flatArticles.value[currentIndex.value + 1]
    : null
)

const renderedContent = computed(() => {
  if (!currentArticle.value?.contentMd) return ''
  const html = marked.parse(currentArticle.value.contentMd, { async: false }) as string
  return DOMPurify.sanitize(html, { ADD_ATTR: ['target'] })
})

function selectArticle(article: HelpArticle) {
  currentArticle.value = article
}

function goPrevious() {
  if (previousArticle.value) selectArticle(previousArticle.value)
}

function goNext() {
  if (nextArticle.value) selectArticle(nextArticle.value)
}

watch(currentArticle, () => {
  articleBody.value?.scrollTo({ top: 0, behavior: 'smooth' })
})

function initFromHash() {
  const hash = window.location.hash.replace('#', '')
  if (!hash) return
  const target = flatArticles.value.find((a) => a.id === hash)
  if (target) {
    currentArticle.value = target
  }
}

watch(flatArticles, () => {
  initFromHash()
}, { once: true })

if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', () => {
    initFromHash()
  })
}
</script>

<style scoped>
.help-cat-link {
  display: block;
  padding: 8px 12px;
  font-size: 13px;
  color: rgb(107 114 128);
  border-left: 3px solid transparent;
  transition: all 120ms ease;
}

.dark .help-cat-link {
  color: rgb(156 163 175);
}

.help-cat-link:hover {
  color: rgb(17 24 39);
  background: rgb(243 244 246);
}

.dark .help-cat-link:hover {
  color: rgb(255 255 255);
  background: rgb(55 65 81);
}

.help-cat-link.active {
  color: rgb(37 99 235);
  border-left-color: rgb(37 99 235);
  background: rgb(239 246 255);
  font-weight: 700;
}

.dark .help-cat-link.active {
  color: rgb(96 165 250);
  border-left-color: rgb(96 165 250);
  background: rgb(30 58 138 / 0.3);
}

.help-content :deep(h2) {
  font-size: 18px;
  font-weight: 800;
  margin-top: 28px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgb(229 231 235);
  color: rgb(17 24 39);
}

.dark .help-content :deep(h2) {
  border-color: rgb(55 65 81);
  color: rgb(255 255 255);
}

.help-content :deep(h3) {
  font-size: 15px;
  font-weight: 700;
  margin-top: 22px;
  margin-bottom: 10px;
  color: rgb(17 24 39);
}

.dark .help-content :deep(h3) {
  color: rgb(255 255 255);
}

.help-content :deep(p) {
  font-size: 14px;
  line-height: 1.7;
  margin-bottom: 14px;
  color: rgb(55 65 81);
}

.dark .help-content :deep(p) {
  color: rgb(209 213 219);
}

.help-content :deep(ol),
.help-content :deep(ul) {
  padding-left: 22px;
  margin-bottom: 16px;
  font-size: 14px;
  line-height: 1.7;
  color: rgb(55 65 81);
}

.dark .help-content :deep(ol),
.dark .help-content :deep(ul) {
  color: rgb(209 213 219);
}

.help-content :deep(li) {
  margin-bottom: 6px;
}

.help-content :deep(li > ol),
.help-content :deep(li > ul) {
  margin-top: 6px;
}

.help-content :deep(strong) {
  font-weight: 700;
}

.help-content :deep(a) {
  color: rgb(37 99 235);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.dark .help-content :deep(a) {
  color: rgb(96 165 250);
}

.help-content :deep(a:hover) {
  opacity: 0.8;
}

.help-content :deep(code) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  background: rgb(243 244 246);
  padding: 2px 6px;
  font-size: 12.5px;
  border-radius: 4px;
  color: rgb(37 99 235);
}

.dark .help-content :deep(code) {
  background: rgb(55 65 81);
  color: rgb(96 165 250);
}

.help-content :deep(pre) {
  background: rgb(17 24 39);
  color: rgb(243 244 246);
  padding: 16px;
  font-size: 13px;
  overflow-x: auto;
  border-radius: 12px;
  margin: 16px 0;
  position: relative;
  white-space: pre-wrap;
  word-break: break-word;
}

.help-content :deep(pre code) {
  background: transparent;
  border: none;
  padding: 0;
  color: inherit;
}

.help-content :deep(blockquote) {
  background: rgb(243 244 246);
  border-left: 4px solid rgb(37 99 235);
  padding: 14px 16px;
  margin: 18px 0;
  border-radius: 0 8px 8px 0;
  color: rgb(55 65 81);
}

.dark .help-content :deep(blockquote) {
  background: rgb(55 65 81 / 0.5);
  border-left-color: rgb(96 165 250);
  color: rgb(209 213 219);
}

.help-content :deep(blockquote p:last-child) {
  margin-bottom: 0;
}

.help-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  background: rgb(255 255 255);
  font-size: 13px;
  border: 1px solid rgb(229 231 235);
  border-radius: 12px;
  margin: 16px 0;
  display: block;
  overflow-x: auto;
}

.dark .help-content :deep(table) {
  background: rgb(31 41 55);
  border-color: rgb(55 65 81);
}

.help-content :deep(thead) {
  display: table;
  width: 100%;
  table-layout: fixed;
}

.help-content :deep(tbody) {
  display: table;
  width: 100%;
  table-layout: fixed;
}

.help-content :deep(th) {
  text-align: left;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  background: rgb(249 250 251);
  color: rgb(55 65 81);
  padding: 12px 14px;
  font-weight: 700;
  white-space: nowrap;
  border-bottom: 1px solid rgb(229 231 235);
}

.dark .help-content :deep(th) {
  background: rgb(55 65 81);
  color: rgb(209 213 219);
  border-color: rgb(75 85 99);
}

.help-content :deep(td) {
  padding: 12px 14px;
  border-top: 1px solid rgb(229 231 235);
  color: rgb(55 65 81);
}

.dark .help-content :deep(td) {
  border-color: rgb(55 65 81);
  color: rgb(209 213 219);
}

.help-content :deep(tbody tr:hover) {
  background: rgb(249 250 251);
}

.dark .help-content :deep(tbody tr:hover) {
  background: rgb(55 65 81 / 0.5);
}

.help-tip {
  background: rgb(243 244 246);
  border-left: 4px solid rgb(37 99 235);
  padding: 14px 16px;
  margin: 18px 0;
  border-radius: 0 8px 8px 0;
}

.dark .help-tip {
  background: rgb(55 65 81 / 0.5);
  border-left-color: rgb(96 165 250);
}

.help-tip :deep(p) {
  margin-bottom: 0;
}

.help-table-wrap {
  overflow-x: auto;
  border: 1px solid rgb(229 231 235);
  border-radius: 12px;
  margin: 16px 0;
}

.dark .help-table-wrap {
  border-color: rgb(55 65 81);
}

.help-table {
  width: 100%;
  border-collapse: collapse;
  background: rgb(255 255 255);
  font-size: 13px;
}

.dark .help-table {
  background: rgb(31 41 55);
}

.help-table th {
  text-align: left;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  background: rgb(249 250 251);
  color: rgb(55 65 81);
  padding: 12px 14px;
  font-weight: 700;
  white-space: nowrap;
  border-bottom: 1px solid rgb(229 231 235);
}

.dark .help-table th {
  background: rgb(55 65 81);
  color: rgb(209 213 219);
  border-color: rgb(75 85 99);
}

.help-table td {
  padding: 12px 14px;
  border-top: 1px solid rgb(229 231 235);
  color: rgb(55 65 81);
}

.dark .help-table td {
  border-color: rgb(55 65 81);
  color: rgb(209 213 219);
}

.help-table tbody tr:hover {
  background: rgb(249 250 251);
}

.dark .help-table tbody tr:hover {
  background: rgb(55 65 81 / 0.5);
}
</style>
