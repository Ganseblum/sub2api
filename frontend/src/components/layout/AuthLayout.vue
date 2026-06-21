<template>
  <div class="auth-shell relative flex min-h-screen items-center justify-center overflow-hidden p-4">
    <!-- Content Container -->
    <div class="relative z-10 w-full max-w-md">
      <div class="auth-card">
        <!-- Logo/Brand -->
        <div class="auth-head">
          <div v-if="settingsLoaded" class="mb-4 flex items-center gap-3">
            <div
              class="flex h-9 w-9 items-center justify-center overflow-hidden border-[2.5px] border-[var(--youc-line)] bg-[var(--youc-ink)]"
            >
              <img :src="siteLogo || '/logo.png'" alt="Logo" class="h-full w-full object-contain" />
            </div>
            <span class="text-lg font-[850] uppercase tracking-[0.04em] text-[var(--youc-ink)]">
              {{ siteName }}
            </span>
          </div>
          <h1 class="text-[22px] font-[850] uppercase tracking-[-0.02em] text-[var(--youc-ink)]">
            {{ siteName }}
          </h1>
          <p class="mt-1 text-sm text-[var(--youc-muted)]">
            {{ siteSubtitle }}
          </p>
        </div>

        <!-- Card Container -->
        <div class="auth-body">
          <slot />
        </div>

        <!-- Footer Links -->
        <div class="auth-foot text-center text-sm">
          <slot name="footer" />
        </div>
      </div>

      <!-- Copyright -->
      <div class="mt-8 text-center text-xs uppercase tracking-[0.08em] text-[var(--youc-muted)]">
        &copy; {{ currentYear }} {{ siteName }}. {{ t('home.footer.allRightsReserved') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores'
import { sanitizeUrl } from '@/utils/url'
import { normalizeBrandName } from '@/config/brand'

const appStore = useAppStore()
const { t, locale } = useI18n()
const defaultSiteSubtitleEn = 'Subscription to API Conversion Platform'

const siteName = computed(() => normalizeBrandName(appStore.siteName))
const siteLogo = computed(() => sanitizeUrl(appStore.siteLogo || '', { allowRelative: true, allowDataUrl: true }))
const siteSubtitle = computed(() => {
  const configuredSubtitle = appStore.cachedPublicSettings?.site_subtitle?.trim()
  if (configuredSubtitle && !(locale.value.startsWith('zh') && configuredSubtitle === defaultSiteSubtitleEn)) {
    return configuredSubtitle
  }
  return locale.value.startsWith('zh') ? '订阅转 API 转换平台' : defaultSiteSubtitleEn
})
const settingsLoaded = computed(() => appStore.publicSettingsLoaded)

const currentYear = computed(() => new Date().getFullYear())

onMounted(() => {
  appStore.fetchPublicSettings()
})
</script>

<style scoped>
.auth-shell {
  background-color: var(--youc-bg);
  background-image: radial-gradient(color-mix(in srgb, var(--youc-line) 10%, transparent) 1px, transparent 1px);
  background-size: 22px 22px;
}

.auth-card {
  border: 2.5px solid var(--youc-line);
  background: var(--youc-paper);
  box-shadow: 10px 10px 0 var(--youc-line);
}

.auth-head {
  border-bottom: 2.5px solid var(--youc-line);
  padding: 24px 26px;
}

.auth-body {
  padding: 24px 26px;
}

.auth-foot {
  border-top: 2.5px solid var(--youc-line);
  padding: 16px 26px;
}
</style>
