<template>
  <div class="platform-type-badge">
    <div class="platform-type-badge-row">
      <span :class="['platform-type-badge-seg', platformClass]">
        <PlatformIcon :platform="platform" size="xs" />
        <span>{{ platformLabel }}</span>
      </span>
      <span :class="['platform-type-badge-seg', typeClass]">
        <svg
          v-if="type === 'oauth'"
          class="h-3 w-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
          />
        </svg>
        <Icon v-else-if="type === 'setup-token'" name="shield" size="xs" />
        <Icon v-else-if="type === 'service_account'" name="cloud" size="xs" />
        <Icon v-else name="key" size="xs" />
        <span>{{ typeLabel }}</span>
      </span>
    </div>
    <div v-if="planLabel || privacyBadge" class="platform-type-badge-row">
      <span v-if="planLabel" :class="['platform-type-badge-seg', planBadgeClass]">
        <span>{{ planLabel }}</span>
      </span>
      <span
        v-if="privacyBadge"
        :class="['platform-type-badge-seg', privacyBadge.class]"
        :title="privacyBadge.title"
      >
        <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" :d="privacyBadge.icon" />
        </svg>
        <span>{{ privacyBadge.label }}</span>
      </span>
    </div>
    <div v-if="expiresLabel" class="platform-type-badge-meta" :title="subscriptionExpiresAt">
      {{ expiresLabel }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AccountPlatform, AccountType } from '@/types'
import PlatformIcon from './PlatformIcon.vue'
import Icon from '@/components/icons/Icon.vue'

const { t } = useI18n()

interface Props {
  platform: AccountPlatform
  type: AccountType
  planType?: string
  privacyMode?: string
  subscriptionExpiresAt?: string
}

const props = defineProps<Props>()

const platformLabel = computed(() => {
  if (props.platform === 'anthropic') return 'Anthropic'
  if (props.platform === 'openai') return 'OpenAI'
  if (props.platform === 'antigravity') return 'Antigravity'
  return 'Gemini'
})

const typeLabel = computed(() => {
  switch (props.type) {
    case 'oauth':
      return 'OAuth'
    case 'setup-token':
      return 'Token'
    case 'apikey':
      return 'Key'
    case 'bedrock':
      return 'AWS'
    case 'service_account':
      return 'Vertex'
    default:
      return props.type
  }
})

const planLabel = computed(() => {
  if (!props.planType) return ''
  const lower = props.planType.toLowerCase()
  switch (lower) {
    case 'plus':
      return 'Plus'
    case 'team':
      return 'Team'
    case 'chatgptpro':
    case 'pro':
      return 'Pro'
    case 'free':
      return 'Free'
    case 'abnormal':
      return t('admin.accounts.subscriptionAbnormal')
    default:
      return props.planType
  }
})

const platformClass = computed(() => {
  if (props.platform === 'anthropic') return 'badge-warning'
  if (props.platform === 'openai') return 'badge-success'
  if (props.platform === 'antigravity') return 'badge-purple'
  return 'badge-primary'
})

const typeClass = computed(() => platformClass.value)

const planBadgeClass = computed(() => {
  if (props.planType && props.planType.toLowerCase() === 'abnormal') {
    return 'badge-danger'
  }
  return typeClass.value
})

const expiresLabel = computed(() => {
  if (!props.subscriptionExpiresAt || !props.planType) return ''
  if (props.planType.toLowerCase() === 'free') return ''
  try {
    const d = new Date(props.subscriptionExpiresAt)
    if (isNaN(d.getTime())) return ''
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${t('admin.accounts.subscriptionExpires')} ${yyyy}-${mm}-${dd}`
  } catch {
    return ''
  }
})

const privacyBadge = computed(() => {
  if (props.type !== 'oauth' || !props.privacyMode) return null
  if (props.platform !== 'openai' && props.platform !== 'antigravity') return null

  const shieldCheck = 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z'
  const shieldX = 'M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285zM12 18h.008v.008H12V18z'
  switch (props.privacyMode) {
    case 'training_off':
      return { label: 'Private', icon: shieldCheck, title: t('admin.accounts.privacyTrainingOff'), class: 'badge-success' }
    case 'training_set_cf_blocked':
      return { label: 'CF', icon: shieldX, title: t('admin.accounts.privacyCfBlocked'), class: 'badge-warning' }
    case 'training_set_failed':
      return { label: 'Fail', icon: shieldX, title: t('admin.accounts.privacyFailed'), class: 'badge-danger' }
    case 'privacy_set':
      return { label: 'Private', icon: shieldCheck, title: t('admin.accounts.privacyAntigravitySet'), class: 'badge-success' }
    case 'privacy_set_failed':
      return { label: 'Fail', icon: shieldX, title: t('admin.accounts.privacyAntigravityFailed'), class: 'badge-danger' }
    default:
      return null
  }
})
</script>
