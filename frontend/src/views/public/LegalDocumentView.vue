<template>
  <div class="min-h-screen bg-gray-50 text-gray-900 dark:bg-dark-950 dark:text-white">
    <header class="border-b border-gray-200 bg-white/95 dark:border-dark-800 dark:bg-dark-900/95">
      <div class="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <RouterLink to="/home" class="flex min-w-0 items-center gap-3">
          <span class="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200 dark:bg-dark-800 dark:ring-dark-700">
            <img :src="siteLogo || '/logo.png'" alt="Logo" class="h-full w-full object-contain" />
          </span>
          <span class="truncate text-base font-semibold text-gray-950 dark:text-white">
            {{ siteName }}
          </span>
        </RouterLink>
        <RouterLink
          to="/login"
          class="inline-flex flex-shrink-0 items-center justify-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-primary-600/20 transition hover:bg-primary-700"
        >
          {{ t('home.login') }}
        </RouterLink>
      </div>
    </header>

    <main class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:py-10">
      <div v-if="loading" class="flex min-h-[320px] items-center justify-center">
        <div class="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-600"></div>
      </div>

      <section
        v-else-if="loadError"
        class="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200"
      >
        <h1 class="text-lg font-semibold">{{ t('legal.loadFailed') }}</h1>
        <p class="mt-2 text-sm">{{ t('legal.retryLater') }}</p>
      </section>

      <section
        v-else-if="!currentDocument"
        class="rounded-lg border border-gray-200 bg-white p-6 dark:border-dark-700 dark:bg-dark-900"
      >
        <div class="flex items-start gap-3">
          <span class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-gray-100 text-gray-600 dark:bg-dark-800 dark:text-dark-300">
            <Icon name="document" size="sm" />
          </span>
          <div>
            <h1 class="text-lg font-semibold text-gray-900 dark:text-white">{{ t('legal.notFound') }}</h1>
            <p class="mt-2 text-sm leading-6 text-gray-600 dark:text-dark-300">
              {{ t('legal.notFoundDescription') }}
            </p>
          </div>
        </div>
      </section>

      <article v-else>
        <div class="mb-8 border-b border-gray-200 pb-6 dark:border-dark-700">
          <div class="flex items-start gap-4">
            <span class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300">
              <Icon :name="documentIcon" size="md" />
            </span>
            <div class="min-w-0">
              <p class="text-sm font-medium text-primary-700 dark:text-primary-300">{{ documentTypeLabel }}</p>
              <h1 class="mt-2 break-words text-2xl font-bold tracking-normal text-gray-950 dark:text-white sm:text-3xl">
                {{ currentDocument.title }}
              </h1>
              <p v-if="updatedAt" class="mt-3 text-sm text-gray-500 dark:text-dark-400">
                {{ t('legal.updatedAt', { date: updatedAt }) }}
              </p>
            </div>
          </div>
        </div>

        <div
          v-if="hasContent"
          class="legal-document-content"
          v-html="renderedHtml"
        ></div>

        <!-- Prev / Next navigation -->
        <div
          v-if="prevDocument || nextDocument"
          class="mt-10 flex flex-col gap-4 border-t border-gray-200 pt-8 sm:flex-row sm:items-center sm:justify-between dark:border-dark-700"
        >
          <RouterLink
            v-if="prevDocument"
            :to="`/legal/${prevDocument.id}`"
            class="group flex flex-col rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-primary-300 hover:bg-primary-50/50 dark:border-dark-700 dark:bg-dark-900 dark:hover:border-primary-700 dark:hover:bg-primary-900/10 sm:max-w-[48%]"
          >
            <span class="text-xs font-medium text-gray-500 dark:text-dark-400">{{ t('legal.prevDocument') }}</span>
            <span class="mt-1 text-sm font-semibold text-gray-900 transition-colors group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400">
              {{ prevDocument.title }}
            </span>
          </RouterLink>
          <div v-else class="hidden sm:block sm:max-w-[48%]"></div>

          <RouterLink
            v-if="nextDocument"
            :to="`/legal/${nextDocument.id}`"
            class="group flex flex-col rounded-xl border border-gray-200 bg-white p-4 text-right transition-colors hover:border-primary-300 hover:bg-primary-50/50 dark:border-dark-700 dark:bg-dark-900 dark:hover:border-primary-700 dark:hover:bg-primary-900/10 sm:max-w-[48%]"
          >
            <span class="text-xs font-medium text-gray-500 dark:text-dark-400">{{ t('legal.nextDocument') }}</span>
            <span class="mt-1 text-sm font-semibold text-gray-900 transition-colors group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400">
              {{ nextDocument.title }}
            </span>
          </RouterLink>
        </div>

        <div
          v-if="!hasContent"
          class="rounded-lg border border-dashed border-gray-300 bg-white px-6 py-14 text-center text-sm text-gray-500 dark:border-dark-700 dark:bg-dark-900 dark:text-dark-400"
        >
          {{ t('legal.empty') }}
        </div>
      </article>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { useI18n } from 'vue-i18n'
import Icon from '@/components/icons/Icon.vue'
import { getPublicSettings } from '@/api/auth'
import { getLocale } from '@/i18n'
import { sanitizeUrl } from '@/utils/url'
import { normalizeBrandName } from '@/config/brand'
import { hydrateLoginAgreementDocuments } from '@/utils/loginAgreementDefaults'
import type { LoginAgreementDocument, PublicSettings } from '@/types'
import zhAdminCompliance from '../../../../docs/legal/admin-compliance.zh.md?raw'
import enAdminCompliance from '../../../../docs/legal/admin-compliance.en.md?raw'

type LegalDocumentIcon = 'document' | 'shield' | 'globe' | 'cog'

const route = useRoute()
const { t } = useI18n()
const settings = ref<PublicSettings | null>(null)
const loading = ref(true)
const loadError = ref(false)

marked.setOptions({
  breaks: true,
  gfm: true,
})

const documentId = computed(() => String(route.params.documentId || ''))

interface LocalDocument {
  title: string
  zh: string
  en: string
  typeLabel: string
}

const LOCAL_DOCUMENTS: Record<string, LocalDocument> = {
  'admin-compliance': {
    title: t('adminCompliance.title'),
    zh: zhAdminCompliance,
    en: enAdminCompliance,
    typeLabel: t('legal.adminCompliance'),
  },
}

function localText(zh: string, en: string): string {
  return getLocale() === 'zh' ? zh : en
}

const localDocument = computed(() => LOCAL_DOCUMENTS[documentId.value] ?? null)
const isLocalDocument = computed(() => localDocument.value !== null)
const documents = computed(() =>
  hydrateLoginAgreementDocuments(settings.value?.login_agreement_documents ?? [], localText)
)
const siteName = computed(() => normalizeBrandName(settings.value?.site_name))
const siteLogo = computed(() => sanitizeUrl(settings.value?.site_logo || '', {
  allowRelative: true,
  allowDataUrl: true,
}))
const updatedAt = computed(() =>
  isLocalDocument.value ? '' : settings.value?.login_agreement_updated_at || ''
)
const documentTypeLabel = computed(() =>
  localDocument.value?.typeLabel ?? t('legal.loginAgreement')
)

const currentDocument = computed<LoginAgreementDocument | null>(() => {
  const local = localDocument.value
  if (local) {
    return {
      id: documentId.value,
      title: local.title,
      content_md: getLocale() === 'zh' ? local.zh : local.en,
    }
  }
  const id = documentId.value
  if (!id) {
    return null
  }
  return documents.value.find((doc) => doc.id === id) ?? null
})

const hasContent = computed(() => Boolean(currentDocument.value?.content_md?.trim()))

const renderedHtml = computed(() => {
  const content = currentDocument.value?.content_md?.trim() || ''
  if (!content) {
    return ''
  }
  const html = marked.parse(content) as string
  return DOMPurify.sanitize(html)
})

const documentIcon = computed<LegalDocumentIcon>(() => {
  const id = documentId.value
  if (id === 'usage-policy' || id === 'privacy') {
    return 'shield'
  }
  if (id === 'supported-regions') {
    return 'globe'
  }
  if (id === 'service-specific-terms') {
    return 'cog'
  }
  return 'document'
})

const documentOrderIndex = computed(() => {
  const index = documents.value.findIndex((doc) => doc.id === documentId.value)
  return index === -1 ? null : index
})

const prevDocument = computed(() => {
  const index = documentOrderIndex.value
  if (index === null || index <= 0) return null
  const doc = documents.value[index - 1]
  return doc ? { id: doc.id, title: doc.title } : null
})

const nextDocument = computed(() => {
  const index = documentOrderIndex.value
  if (index === null || index >= documents.value.length - 1) return null
  const doc = documents.value[index + 1]
  return doc ? { id: doc.id, title: doc.title } : null
})

onMounted(async () => {
  loading.value = true
  loadError.value = false
  try {
    settings.value = await getPublicSettings()
  } catch {
    loadError.value = true
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.legal-document-content {
  line-height: 1.75;
  overflow-wrap: anywhere;
  color: inherit;
}

.legal-document-content :deep(h1) {
  @apply mb-4 mt-8 border-b border-gray-200 pb-3 text-3xl font-bold dark:border-dark-700;
}

.legal-document-content :deep(h2) {
  @apply mb-3 mt-7 text-2xl font-bold;
}

.legal-document-content :deep(h3) {
  @apply mb-2 mt-6 text-xl font-semibold;
}

.legal-document-content :deep(h4) {
  @apply mb-2 mt-5 text-lg font-semibold;
}

.legal-document-content :deep(p) {
  @apply mb-4 text-gray-700 dark:text-dark-200;
}

.legal-document-content :deep(a) {
  @apply text-primary-600 underline underline-offset-4 hover:text-primary-700 dark:text-primary-300 dark:hover:text-primary-200;
}

.legal-document-content :deep(ul) {
  @apply mb-4 list-disc pl-6;
}

.legal-document-content :deep(ol) {
  @apply mb-4 list-decimal pl-6;
}

.legal-document-content :deep(li) {
  @apply mb-1 text-gray-700 dark:text-dark-200;
}

.legal-document-content :deep(blockquote) {
  @apply my-5 border-l-4 border-gray-300 pl-4 text-gray-600 dark:border-dark-600 dark:text-dark-300;
}

.legal-document-content :deep(code) {
  @apply rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm dark:bg-dark-800;
}

.legal-document-content :deep(pre) {
  @apply my-5 overflow-x-auto rounded-lg bg-gray-950 p-4 text-gray-100;
}

.legal-document-content :deep(pre code) {
  @apply bg-transparent p-0 text-inherit;
}

.legal-document-content :deep(table) {
  @apply my-5 block w-full overflow-x-auto border-collapse;
}

.legal-document-content :deep(th) {
  @apply border border-gray-300 bg-gray-50 px-3 py-2 text-left font-semibold dark:border-dark-600 dark:bg-dark-800;
}

.legal-document-content :deep(td) {
  @apply border border-gray-300 px-3 py-2 dark:border-dark-600;
}

.legal-document-content :deep(img) {
  @apply my-5 h-auto max-w-full rounded-lg;
}

.legal-document-content :deep(hr) {
  @apply my-7 border-gray-200 dark:border-dark-700;
}
</style>
