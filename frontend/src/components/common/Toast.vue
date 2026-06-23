<template>
  <Teleport to="body">
    <div
      class="pointer-events-none fixed right-4 top-4 z-[9999] space-y-3"
      aria-live="polite"
      aria-atomic="true"
    >
      <TransitionGroup
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0 translate-x-full"
        enter-to-class="opacity-100 translate-x-0"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100 translate-x-0"
        leave-to-class="opacity-0 translate-x-full"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="['toast pointer-events-auto', getToastClass(toast.type)]"
        >
          <div class="flex items-start gap-3">
            <div class="mt-0.5 flex-shrink-0">
              <Icon
                :name="getToastIconName(toast.type)"
                size="md"
                :class="getIconColor(toast.type)"
                aria-hidden="true"
              />
            </div>

            <div class="min-w-0 flex-1">
              <p v-if="toast.title" class="text-sm font-extrabold uppercase tracking-wide text-[var(--youc-ink)]">
                {{ toast.title }}
              </p>
              <p
                :class="[
                  'text-sm leading-relaxed font-semibold',
                  toast.title ? 'mt-1 text-[var(--youc-muted)]' : 'text-[var(--youc-ink)]'
                ]"
              >
                {{ toast.message }}
              </p>
            </div>

            <button
              @click="removeToast(toast.id)"
              class="toast-close -m-1 flex-shrink-0 p-1"
              aria-label="Close notification"
            >
              <Icon name="x" size="sm" />
            </button>
          </div>

          <div v-if="toast.duration" class="toast-progress-track">
            <div
              :class="['toast-progress-bar', getProgressBarColor(toast.type)]"
              :style="{ animationDuration: `${toast.duration}ms` }"
            ></div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Icon from '@/components/icons/Icon.vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

const toasts = computed(() => appStore.toasts)

const getToastIconName = (type: string): 'checkCircle' | 'xCircle' | 'exclamationTriangle' | 'infoCircle' => {
  switch (type) {
    case 'success':
      return 'checkCircle'
    case 'error':
      return 'xCircle'
    case 'warning':
      return 'exclamationTriangle'
    case 'info':
    default:
      return 'infoCircle'
  }
}

const getToastClass = (type: string): string => {
  const classes: Record<string, string> = {
    success: 'toast-success',
    error: 'toast-error',
    warning: 'toast-warning',
    info: 'toast-info'
  }
  return classes[type] || classes.info
}

const getIconColor = (type: string): string => {
  const colors: Record<string, string> = {
    success: 'text-[var(--youc-accent)]',
    error: 'text-[var(--youc-danger)]',
    warning: 'text-amber-600',
    info: 'text-[var(--youc-info)]'
  }
  return colors[type] || colors.info
}

const getProgressBarColor = (type: string): string => {
  const colors: Record<string, string> = {
    success: 'toast-progress-success',
    error: 'toast-progress-error',
    warning: 'toast-progress-warning',
    info: 'toast-progress-info'
  }
  return colors[type] || colors.info
}

const removeToast = (id: string) => {
  appStore.hideToast(id)
}
</script>

<style scoped>
.toast {
  position: relative;
  right: auto;
  top: auto;
  animation: none;
}

.toast-close {
  border: none;
  background: transparent;
  color: var(--youc-muted);
  transition: color 120ms ease;
}

.toast-close:hover {
  color: var(--youc-ink);
}

.toast-progress-track {
  margin-top: 0.75rem;
  height: 3px;
  background: var(--youc-soft);
  border: 1px solid color-mix(in srgb, var(--youc-line) 20%, transparent);
}

.toast-progress-bar {
  height: 100%;
  animation-name: toast-progress-shrink;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}

.toast-progress-success { background: var(--youc-accent); }
.toast-progress-error { background: var(--youc-danger); }
.toast-progress-warning { background: #f59e0b; }
.toast-progress-info { background: var(--youc-info); }

@keyframes toast-progress-shrink {
  from { width: 100%; }
  to { width: 0%; }
}
</style>
