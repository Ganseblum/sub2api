<template>
  <div
    :class="['loading-spinner', `loading-spinner--${size}`, `loading-spinner--${color}`]"
    role="status"
    :aria-label="t('common.loading')"
  >
    <span class="sr-only">{{ t('common.loading') }}</span>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl'
type SpinnerColor = 'primary' | 'secondary' | 'white' | 'gray'

interface Props {
  size?: SpinnerSize
  color?: SpinnerColor
}

withDefaults(defineProps<Props>(), {
  size: 'md',
  color: 'primary'
})
</script>

<style scoped>
.loading-spinner {
  display: inline-block;
  box-sizing: border-box;
  border-style: solid;
  border-color: color-mix(in srgb, var(--youc-line) 28%, transparent);
  border-top-color: var(--youc-accent);
  border-radius: 50%;
  animation: loading-spinner-spin 0.75s linear infinite;
}

.loading-spinner--sm {
  width: 1rem;
  height: 1rem;
  border-width: 2px;
}

.loading-spinner--md {
  width: 2rem;
  height: 2rem;
  border-width: 2.5px;
}

.loading-spinner--lg {
  width: 3rem;
  height: 3rem;
  border-width: 3px;
}

.loading-spinner--xl {
  width: 4rem;
  height: 4rem;
  border-width: 3.5px;
}

.loading-spinner--secondary {
  border-color: color-mix(in srgb, var(--youc-muted) 35%, transparent);
  border-top-color: var(--youc-muted);
}

.loading-spinner--white {
  border-color: color-mix(in srgb, #ffffff 35%, transparent);
  border-top-color: #ffffff;
}

.loading-spinner--gray {
  border-color: color-mix(in srgb, var(--youc-muted) 25%, transparent);
  border-top-color: color-mix(in srgb, var(--youc-muted) 70%, transparent);
}

@keyframes loading-spinner-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
