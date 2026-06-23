<template>
  <Teleport to="body">
    <Transition name="popup-fade">
      <div
        v-if="announcementStore.currentPopup"
        class="announcement-popup-overlay fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto p-4 pt-[8vh]"
      >
        <div class="announcement-popup-panel w-full max-w-[680px] overflow-hidden" @click.stop>
          <!-- Header -->
          <div class="announcement-popup-header px-8 py-6">
            <div class="mb-3 flex items-center gap-2">
              <div class="announcement-popup-icon flex h-10 w-10 items-center justify-center">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </div>
              <span class="announcement-popup-badge inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.08em]">
                <span class="announcement-popup-badge-dot" />
                {{ t('announcements.unread') }}
              </span>
            </div>

            <h2 class="announcement-popup-title mb-2 text-2xl font-extrabold leading-tight">
              {{ announcementStore.currentPopup.title }}
            </h2>

            <div class="announcement-popup-meta flex items-center gap-1.5 text-sm">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <time>{{ formatRelativeWithDateTime(announcementStore.currentPopup.created_at) }}</time>
            </div>
          </div>

          <!-- Body -->
          <div class="announcement-popup-body max-h-[50vh] overflow-y-auto px-8 py-8">
            <div class="relative">
              <div class="announcement-popup-accent-bar absolute bottom-0 left-0 top-0 w-1" />
              <div class="pl-6">
                <div class="announcement-popup-content markdown-body prose prose-sm max-w-none" v-html="renderedContent" />
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="announcement-popup-footer px-8 py-5">
            <div class="flex items-center justify-end">
              <button type="button" class="announcement-popup-action" @click="handleDismiss">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {{ t('announcements.markRead') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { useAnnouncementStore } from '@/stores/announcements'
import { formatRelativeWithDateTime } from '@/utils/format'

const { t } = useI18n()
const announcementStore = useAnnouncementStore()

marked.setOptions({
  breaks: true,
  gfm: true
})

const renderedContent = computed(() => {
  const content = announcementStore.currentPopup?.content
  if (!content) return ''
  const html = marked.parse(content) as string
  return DOMPurify.sanitize(html)
})

function handleDismiss() {
  announcementStore.dismissPopup()
}

watch(
  () => announcementStore.currentPopup,
  (popup) => {
    if (popup) {
      document.body.style.overflow = 'hidden'
    }
  }
)
</script>

<style scoped>
.announcement-popup-overlay {
  background: color-mix(in srgb, var(--youc-ink) 72%, transparent);
}

.announcement-popup-panel {
  border: 2.5px solid var(--youc-line);
  background: var(--youc-paper);
  box-shadow: var(--youc-shadow-lg);
}

.announcement-popup-header {
  border-bottom: 2.5px solid var(--youc-line);
  background: var(--youc-soft);
}

.announcement-popup-icon {
  border: 2.5px solid var(--youc-line);
  background: var(--youc-ink);
  color: var(--youc-bg);
  box-shadow: var(--youc-shadow);
}

.announcement-popup-badge {
  border: 2px solid var(--youc-line);
  background: var(--youc-accent);
  color: #ffffff;
}

.announcement-popup-badge-dot {
  display: inline-block;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  background: #ffffff;
}

.announcement-popup-title {
  color: var(--youc-ink);
}

.announcement-popup-meta {
  color: var(--youc-muted);
}

.announcement-popup-body {
  background: var(--youc-paper);
}

.announcement-popup-accent-bar {
  background: var(--youc-accent);
}

.announcement-popup-content :deep(a) {
  color: var(--youc-accent);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.announcement-popup-content :deep(a:hover) {
  color: var(--youc-ink);
}

.announcement-popup-footer {
  border-top: 2.5px solid var(--youc-line);
  background: var(--youc-soft);
}

.announcement-popup-action {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: 2.5px solid var(--youc-line);
  background: var(--youc-ink);
  color: var(--youc-bg);
  padding: 0.625rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  box-shadow: var(--youc-shadow);
  transition:
    transform 120ms ease,
    box-shadow 120ms ease;
}

.announcement-popup-action:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 var(--youc-line);
}

.announcement-popup-action:active {
  transform: translate(0, 0);
  box-shadow: none;
}

.popup-fade-enter-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.popup-fade-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 1, 1);
}

.popup-fade-enter-from,
.popup-fade-leave-to {
  opacity: 0;
}

.popup-fade-enter-from .announcement-popup-panel {
  transform: translateY(-12px);
  opacity: 0;
}

.popup-fade-leave-to .announcement-popup-panel {
  transform: translateY(-8px);
  opacity: 0;
}

.announcement-popup-body::-webkit-scrollbar {
  width: 8px;
}

.announcement-popup-body::-webkit-scrollbar-thumb {
  background: var(--youc-muted);
}
</style>
