<template>
  <div>
    <!-- 铃铛按钮 -->
    <button
      @click="openModal"
      class="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition-all hover:bg-gray-100 hover:scale-105 dark:text-gray-400 dark:hover:bg-dark-800"
      :class="{ 'text-blue-600 dark:text-blue-400': unreadCount > 0 }"
      :aria-label="t('announcements.title')"
    >
      <Icon name="bell" size="md" />
      <!-- 未读红点 -->
      <span
        v-if="unreadCount > 0"
        class="absolute right-1 top-1 flex h-2 w-2"
      >
        <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
        <span class="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
      </span>
    </button>

    <!-- 公告列表 Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div
          v-if="isModalOpen"
          class="announcement-bell-overlay fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-4 pt-[8vh]"
          @click="closeModal"
        >
          <div
            class="announcement-bell-panel w-full max-w-[620px] overflow-hidden"
            @click.stop
          >
            <div class="announcement-bell-header px-6 py-5">
              <div class="flex items-start justify-between">
                <div>
                  <div class="flex items-center gap-2">
                    <div class="announcement-bell-icon flex h-8 w-8 items-center justify-center">
                      <Icon name="bell" size="sm" />
                    </div>
                    <h2 class="announcement-bell-title text-lg font-semibold">
                      {{ t('announcements.title') }}
                    </h2>
                  </div>
                  <p v-if="unreadCount > 0" class="announcement-bell-meta mt-2 text-sm">
                    <span class="font-medium">{{ unreadCount }}</span>
                    {{ t('announcements.unread') }}
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    v-if="unreadCount > 0"
                    @click="markAllAsRead"
                    :disabled="loading"
                    class="announcement-bell-action text-xs disabled:opacity-50"
                  >
                    {{ t('announcements.markAllRead') }}
                  </button>
                  <button
                    @click="closeModal"
                    class="announcement-bell-close flex h-9 w-9 items-center justify-center"
                    :aria-label="t('common.close')"
                  >
                    <Icon name="x" size="sm" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Body -->
            <div class="max-h-[65vh] overflow-y-auto">
              <!-- Loading -->
              <div v-if="loading" class="flex items-center justify-center py-16">
                <LoadingSpinner size="lg" />
              </div>

              <!-- Announcements List -->
              <div v-else-if="announcements.length > 0">
                <div
                  v-for="item in announcements"
                  :key="item.id"
                  class="announcement-bell-row group relative flex items-center gap-4 px-6 py-4 transition-all"
                  :class="{ 'announcement-bell-row--unread': !item.read_at }"
                  style="min-height: 72px"
                  @click="openDetail(item)"
                >
                  <!-- Status Indicator -->
                  <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center">
                    <div
                      v-if="!item.read_at"
                      class="announcement-bell-row-icon relative flex h-10 w-10 items-center justify-center"
                    >
                      <span class="announcement-bell-row-icon-ping absolute inline-flex h-full w-full animate-ping opacity-75"></span>
                      <svg class="relative z-10 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div
                      v-else
                      class="announcement-bell-row-icon announcement-bell-row-icon--read flex h-10 w-10 items-center justify-center"
                    >
                      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>

                  <!-- Content -->
                  <div class="flex min-w-0 flex-1 items-center justify-between gap-4">
                    <div class="min-w-0 flex-1">
                      <h3 class="announcement-bell-row-title truncate text-sm font-medium">
                        {{ item.title }}
                      </h3>
                      <div class="mt-1 flex items-center gap-2">
                        <time class="announcement-bell-row-meta text-xs">
                          {{ formatRelativeTime(item.created_at) }}
                        </time>
                        <span
                          v-if="!item.read_at"
                          class="announcement-bell-badge inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium"
                        >
                          <span class="relative flex h-1.5 w-1.5">
                            <span class="announcement-bell-badge-ping absolute inline-flex h-full w-full animate-ping opacity-75"></span>
                            <span class="announcement-bell-badge-dot relative inline-flex h-1.5 w-1.5"></span>
                          </span>
                          {{ t('announcements.unread') }}
                        </span>
                      </div>
                    </div>

                    <!-- Arrow -->
                    <div class="flex-shrink-0">
                      <svg
                        class="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1 dark:text-gray-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>

                  <!-- Unread indicator bar -->
                  <div
                    v-if="!item.read_at"
                    class="announcement-bell-row-accent absolute left-0 top-0 h-full w-1"
                  ></div>
                </div>
              </div>

              <!-- Empty State -->
              <div v-else class="flex flex-col items-center justify-center py-16">
                <div class="relative mb-4">
                  <div class="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-dark-700 dark:to-dark-600">
                    <Icon name="inbox" size="xl" class="text-gray-400 dark:text-gray-500" />
                  </div>
                  <div class="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white">
                    <svg class="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ t('announcements.empty') }}</p>
                <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">{{ t('announcements.emptyDescription') }}</p>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 公告详情 Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div
          v-if="detailModalOpen && selectedAnnouncement"
          class="announcement-bell-overlay fixed inset-0 z-[110] flex items-start justify-center overflow-y-auto p-4 pt-[6vh]"
          @click="closeDetail"
        >
          <div
            class="announcement-bell-panel announcement-bell-detail-panel w-full max-w-[780px] overflow-hidden"
            @click.stop
          >
            <div class="announcement-bell-header px-8 py-6">
              <div class="flex items-start justify-between gap-4">
                <div class="min-w-0 flex-1">
                  <div class="mb-3 flex items-center gap-2">
                    <div class="announcement-bell-icon flex h-10 w-10 items-center justify-center">
                      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="announcement-bell-chip px-2.5 py-1 text-xs font-medium">
                        {{ t('announcements.title') }}
                      </span>
                      <span
                        v-if="!selectedAnnouncement.read_at"
                        class="announcement-bell-badge announcement-bell-badge--solid inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium"
                      >
                        <span class="relative flex h-2 w-2">
                          <span class="announcement-bell-badge-ping absolute inline-flex h-full w-full animate-ping opacity-75"></span>
                          <span class="announcement-bell-badge-dot relative inline-flex h-2 w-2"></span>
                        </span>
                        {{ t('announcements.unread') }}
                      </span>
                    </div>
                  </div>

                  <h2 class="announcement-bell-title mb-3 text-2xl font-bold leading-tight">
                    {{ selectedAnnouncement.title }}
                  </h2>

                  <div class="announcement-bell-meta flex items-center gap-4 text-sm">
                    <div class="flex items-center gap-1.5">
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <time>{{ formatRelativeWithDateTime(selectedAnnouncement.created_at) }}</time>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>{{ selectedAnnouncement.read_at ? t('announcements.read') : t('announcements.unread') }}</span>
                    </div>
                  </div>
                </div>

                <button
                  @click="closeDetail"
                  class="announcement-bell-close flex h-10 w-10 flex-shrink-0 items-center justify-center"
                  :aria-label="t('common.close')"
                >
                  <Icon name="x" size="md" />
                </button>
              </div>
            </div>

            <div class="announcement-bell-detail-body max-h-[60vh] overflow-y-auto px-8 py-8">
              <div class="relative">
                <div class="announcement-bell-detail-accent absolute bottom-0 left-0 top-0 w-1"></div>

                <div class="pl-6">
                  <div
                    class="markdown-body prose prose-sm max-w-none dark:prose-invert"
                    v-html="renderMarkdown(selectedAnnouncement.content)"
                  ></div>
                </div>
              </div>
            </div>

            <div class="announcement-bell-footer px-8 py-5">
              <div class="flex items-center justify-between">
                <div class="announcement-bell-meta flex items-center gap-2 text-xs">
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{{ selectedAnnouncement.read_at ? t('announcements.readStatus') : t('announcements.markReadHint') }}</span>
                </div>
                <div class="flex items-center gap-3">
                  <button
                    @click="closeDetail"
                    class="announcement-bell-secondary px-5 py-2.5 text-sm font-medium"
                  >
                    {{ t('common.close') }}
                  </button>
                  <button
                    v-if="!selectedAnnouncement.read_at"
                    @click="markAsReadAndClose(selectedAnnouncement.id)"
                    class="announcement-bell-action text-sm"
                  >
                    <span class="flex items-center gap-2">
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {{ t('announcements.markRead') }}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { useAppStore } from '@/stores/app'
import { useAnnouncementStore } from '@/stores/announcements'
import { formatRelativeTime, formatRelativeWithDateTime } from '@/utils/format'
import type { UserAnnouncement } from '@/types'
import Icon from '@/components/icons/Icon.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const { t } = useI18n()
const appStore = useAppStore()
const announcementStore = useAnnouncementStore()

// Configure marked
marked.setOptions({
  breaks: true,
  gfm: true,
})

// Use store state (storeToRefs for reactivity)
const { announcements, loading } = storeToRefs(announcementStore)
const unreadCount = computed(() => announcementStore.unreadCount)

// Local modal state
const isModalOpen = ref(false)
const detailModalOpen = ref(false)
const selectedAnnouncement = ref<UserAnnouncement | null>(null)

// Methods
function renderMarkdown(content: string): string {
  if (!content) return ''
  const html = marked.parse(content) as string
  return DOMPurify.sanitize(html)
}

function openModal() {
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
}

function openDetail(announcement: UserAnnouncement) {
  selectedAnnouncement.value = announcement
  detailModalOpen.value = true
  if (!announcement.read_at) {
    markAsRead(announcement.id)
  }
}

function closeDetail() {
  detailModalOpen.value = false
  selectedAnnouncement.value = null
}

async function markAsRead(id: number) {
  try {
    await announcementStore.markAsRead(id)
  } catch (err: any) {
    appStore.showError(err?.message || t('common.unknownError'))
  }
}

async function markAsReadAndClose(id: number) {
  await markAsRead(id)
  appStore.showSuccess(t('announcements.markedAsRead'))
  closeDetail()
}

async function markAllAsRead() {
  try {
    await announcementStore.markAllAsRead()
    appStore.showSuccess(t('announcements.allMarkedAsRead'))
  } catch (err: any) {
    appStore.showError(err?.message || t('common.unknownError'))
  }
}

function handleEscape(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    if (detailModalOpen.value) {
      closeDetail()
    } else if (isModalOpen.value) {
      closeModal()
    }
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleEscape)
  document.body.style.overflow = ''
})

watch(
  [isModalOpen, detailModalOpen, () => announcementStore.currentPopup],
  ([modal, detail, popup]) => {
    document.body.style.overflow = (modal || detail || popup) ? 'hidden' : ''
  }
)
</script>

<style scoped>
.announcement-bell-overlay {
  background: color-mix(in srgb, var(--youc-ink) 72%, transparent);
}

.announcement-bell-panel {
  border: 2.5px solid var(--youc-line);
  background: var(--youc-paper);
  box-shadow: var(--youc-shadow-lg);
}

.announcement-bell-header {
  border-bottom: 2.5px solid var(--youc-line);
  background: var(--youc-soft);
}

.announcement-bell-icon {
  border: 2.5px solid var(--youc-line);
  background: var(--youc-ink);
  color: var(--youc-bg);
  box-shadow: var(--youc-shadow);
}

.announcement-bell-title {
  color: var(--youc-ink);
}

.announcement-bell-meta {
  color: var(--youc-muted);
}

.announcement-bell-meta .font-medium {
  color: var(--youc-accent);
  font-weight: 800;
}

.announcement-bell-action {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: 2.5px solid var(--youc-line);
  background: var(--youc-ink);
  color: var(--youc-bg);
  padding: 0.5rem 1rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  box-shadow: var(--youc-shadow);
  transition:
    transform 120ms ease,
    box-shadow 120ms ease;
}

.announcement-bell-action:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 var(--youc-line);
}

.announcement-bell-secondary {
  border: 2.5px solid var(--youc-line);
  background: var(--youc-paper);
  color: var(--youc-ink);
  font-weight: 700;
  box-shadow: var(--youc-shadow);
}

.announcement-bell-close {
  border: 2.5px solid var(--youc-line);
  background: var(--youc-paper);
  color: var(--youc-muted);
}

.announcement-bell-close:hover {
  color: var(--youc-ink);
  background: var(--youc-soft);
}

.announcement-bell-row {
  border-bottom: 1px solid color-mix(in srgb, var(--youc-line) 25%, transparent);
  cursor: pointer;
}

.announcement-bell-row:hover {
  background: var(--youc-soft);
}

.announcement-bell-row--unread {
  background: color-mix(in srgb, var(--youc-accent) 8%, var(--youc-paper));
}

.announcement-bell-row-title {
  color: var(--youc-ink);
}

.announcement-bell-row-meta {
  color: var(--youc-muted);
}

.announcement-bell-row-icon {
  border: 2.5px solid var(--youc-line);
  background: var(--youc-accent);
  color: #04231f;
  box-shadow: var(--youc-shadow);
}

.announcement-bell-row-icon-ping {
  background: var(--youc-accent-2);
}

.announcement-bell-row-icon--read {
  background: var(--youc-soft);
  color: var(--youc-muted);
  box-shadow: none;
}

.announcement-bell-row-accent {
  background: var(--youc-accent);
}

.announcement-bell-badge {
  border: 2px solid var(--youc-line);
  background: var(--youc-soft);
  color: var(--youc-ink);
}

.announcement-bell-badge--solid {
  background: var(--youc-accent);
  color: #04231f;
}

.announcement-bell-badge-ping {
  background: var(--youc-accent-2);
}

.announcement-bell-badge-dot {
  border-radius: 9999px;
  background: var(--youc-ink);
}

.announcement-bell-badge--solid .announcement-bell-badge-dot {
  background: #04231f;
}

.announcement-bell-chip {
  border: 2px solid var(--youc-line);
  background: var(--youc-paper);
  color: var(--youc-ink);
}

.announcement-bell-detail-body {
  background: var(--youc-paper);
}

.announcement-bell-detail-accent {
  background: var(--youc-accent);
}

.announcement-bell-footer {
  border-top: 2.5px solid var(--youc-line);
  background: var(--youc-soft);
}

/* Modal Animations */
.modal-fade-enter-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-fade-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 1, 1);
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from > div {
  transform: scale(0.94) translateY(-12px);
  opacity: 0;
}

.modal-fade-leave-to > div {
  transform: scale(0.96) translateY(-8px);
  opacity: 0;
}

/* Scrollbar Styling */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #cbd5e1, #94a3b8);
  border-radius: 4px;
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #4b5563, #374151);
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #94a3b8, #64748b);
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #6b7280, #4b5563);
}
</style>

<style>
/* Enhanced Markdown Styles */
.markdown-body {
  @apply text-[15px] leading-[1.75];
  @apply text-gray-700 dark:text-gray-300;
}

.markdown-body h1 {
  @apply mb-6 mt-8 border-b border-gray-200 pb-3 text-3xl font-bold text-gray-900 dark:border-dark-600 dark:text-white;
}

.markdown-body h2 {
  @apply mb-4 mt-7 border-b border-gray-100 pb-2 text-2xl font-bold text-gray-900 dark:border-dark-700 dark:text-white;
}

.markdown-body h3 {
  @apply mb-3 mt-6 text-xl font-semibold text-gray-900 dark:text-white;
}

.markdown-body h4 {
  @apply mb-2 mt-5 text-lg font-semibold text-gray-900 dark:text-white;
}

.markdown-body p {
  @apply mb-4 leading-relaxed;
}

.markdown-body a {
  @apply font-medium text-blue-600 underline decoration-blue-600/30 decoration-2 underline-offset-2 transition-all hover:decoration-blue-600 dark:text-blue-400 dark:decoration-blue-400/30 dark:hover:decoration-blue-400;
}

.markdown-body ul,
.markdown-body ol {
  @apply mb-4 ml-6 space-y-2;
}

.markdown-body ul {
  @apply list-disc;
}

.markdown-body ol {
  @apply list-decimal;
}

.markdown-body li {
  @apply leading-relaxed;
  @apply pl-2;
}

.markdown-body li::marker {
  @apply text-blue-600 dark:text-blue-400;
}

.markdown-body blockquote {
  @apply relative my-5 border-l-4 border-blue-500 bg-blue-50/50 py-3 pl-5 pr-4 italic text-gray-700 dark:border-blue-400 dark:bg-blue-900/10 dark:text-gray-300;
}

.markdown-body blockquote::before {
  content: '"';
  @apply absolute -left-1 top-0 text-5xl font-serif text-blue-500/20 dark:text-blue-400/20;
}

.markdown-body code {
  @apply rounded-lg bg-gray-100 px-2 py-1 text-[13px] font-mono text-pink-600 dark:bg-dark-700 dark:text-pink-400;
}

.markdown-body pre {
  @apply my-5 overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-dark-600 dark:bg-dark-900/50;
}

.markdown-body pre code {
  @apply bg-transparent p-0 text-[13px] text-gray-800 dark:text-gray-200;
}

.markdown-body hr {
  @apply my-8 border-0 border-t-2 border-gray-200 dark:border-dark-700;
}

.markdown-body table {
  @apply mb-5 w-full overflow-hidden rounded-lg border border-gray-200 dark:border-dark-600;
}

.markdown-body th,
.markdown-body td {
  @apply border-r border-b border-gray-200 px-4 py-3 text-left dark:border-dark-600;
}

.markdown-body th:last-child,
.markdown-body td:last-child {
  @apply border-r-0;
}

.markdown-body tr:last-child td {
  @apply border-b-0;
}

.markdown-body th {
  @apply bg-gradient-to-br from-blue-50 to-indigo-50 font-semibold text-gray-900 dark:from-blue-900/20 dark:to-indigo-900/10 dark:text-white;
}

.markdown-body tbody tr {
  @apply transition-colors hover:bg-gray-50 dark:hover:bg-dark-700/30;
}

.markdown-body img {
  @apply my-5 max-w-full rounded-xl border border-gray-200 shadow-md dark:border-dark-600;
}

.markdown-body strong {
  @apply font-semibold text-gray-900 dark:text-white;
}

.markdown-body em {
  @apply italic text-gray-600 dark:text-gray-400;
}
</style>
