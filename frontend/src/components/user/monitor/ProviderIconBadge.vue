<template>
  <span
    class="grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl ring-1 ring-black/5 dark:ring-white/10"
    :class="[providerGradient(provider), providerTint]"
  >
    <ProviderIcon :provider="provider" :size="20" />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { providerGradient } from '@/composables/useChannelMonitorFormat'
import ProviderIcon from './ProviderIcon.vue'

const props = defineProps<{ provider: string }>()

const providerTint = computed(() => ({
  openai: 'text-emerald-600 dark:text-emerald-300',
  anthropic: 'text-orange-600 dark:text-orange-300',
  gemini: 'text-sky-600 dark:text-sky-300',
  grok: 'text-zinc-700 dark:text-zinc-200',
  antigravity: 'text-purple-600 dark:text-purple-300',
  kimi: 'text-pink-600 dark:text-pink-300',
  zhipu: 'text-indigo-600 dark:text-indigo-300',
  deepseek: 'text-teal-600 dark:text-teal-300',
  opencode_go: 'text-amber-700 dark:text-amber-300',
} as Record<string, string>)[props.provider] ?? 'text-gray-500 dark:text-gray-300')
</script>
