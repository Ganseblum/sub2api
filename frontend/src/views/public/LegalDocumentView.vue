<template>
  <div
    class="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-primary-50/30 to-gray-100 text-gray-900 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950 dark:text-white"
  >
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div class="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-primary-400/20 blur-3xl"></div>
      <div class="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-primary-500/15 blur-3xl"></div>
      <div class="absolute left-1/3 top-1/4 h-72 w-72 rounded-full bg-primary-300/10 blur-3xl"></div>
      <div class="absolute inset-0 bg-[linear-gradient(rgba(20,184,166,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.03)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
    </div>

    <header class="relative z-20 border-b border-gray-200/70 bg-white/80 backdrop-blur-xl dark:border-dark-700/60 dark:bg-dark-900/80">
      <div class="flex w-full items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
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
          class="btn btn-primary btn-sm flex-shrink-0"
        >
          {{ t('home.login') }}
        </RouterLink>
      </div>
    </header>

    <main class="relative z-10 w-full px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
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

      <article
        v-else
        class="card-glass overflow-hidden rounded-2xl"
      >
        <div class="border-b border-gray-100 bg-white/60 px-6 py-7 dark:border-dark-700 dark:bg-dark-800/50 sm:px-8 lg:px-10">
          <div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div class="flex min-w-0 items-start gap-4">
              <span class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-100 dark:bg-primary-500/10 dark:text-primary-300 dark:ring-primary-500/20">
                <Icon :name="documentIcon" size="md" />
              </span>
              <div class="min-w-0">
                <p class="text-sm font-semibold text-primary-700 dark:text-primary-300">{{ documentTypeLabel }}</p>
                <h1 class="mt-2 break-words text-2xl font-bold tracking-normal text-gray-950 dark:text-white sm:text-3xl">
                  {{ currentDocument.title }}
                </h1>
                <p v-if="updatedAt" class="mt-3 text-sm text-gray-500 dark:text-dark-400">
                  {{ t('legal.updatedAt', { date: updatedAt }) }}
                </p>
              </div>
            </div>
            <nav class="flex flex-wrap gap-2 text-xs font-medium">
              <RouterLink
                v-for="document in documentNav"
                :key="document.id"
                :to="`/legal/${document.id}`"
                class="rounded-full border border-gray-200 bg-white/70 px-3 py-1.5 text-gray-600 shadow-sm transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700 dark:border-dark-700 dark:bg-dark-800/70 dark:text-dark-300 dark:hover:border-primary-500/40 dark:hover:bg-primary-500/10 dark:hover:text-primary-200"
                :class="{ 'border-primary-200 bg-primary-50 text-primary-700 dark:border-primary-500/40 dark:bg-primary-500/10 dark:text-primary-200': document.id === documentId }"
              >
                {{ document.title }}
              </RouterLink>
            </nav>
          </div>
        </div>

        <div v-if="hasContent" class="px-6 py-8 sm:px-8 lg:px-10">
          <div class="legal-document-content" v-html="renderedHtml"></div>
        </div>
        <div
          v-else
          class="m-6 rounded-lg border border-dashed border-gray-300 bg-white px-6 py-14 text-center text-sm text-gray-500 dark:border-dark-700 dark:bg-dark-900 dark:text-dark-400"
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
import type { LoginAgreementDocument, PublicSettings } from '@/types'
import { builtInLegalDocuments, builtInLegalUpdatedAt, findBuiltInLegalDocument } from '@/content/legalDocuments'
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
const isAdminComplianceDocument = computed(() => documentId.value === 'admin-compliance')
const documents = computed(() => settings.value?.login_agreement_documents ?? [])
const documentNav = computed(() => builtInLegalDocuments.map(({ id, title }) => ({ id, title })))
const siteName = computed(() => normalizeBrandName(settings.value?.site_name))
const siteLogo = computed(() => sanitizeUrl(settings.value?.site_logo || '', {
  allowRelative: true,
  allowDataUrl: true,
}))
const updatedAt = computed(() =>
  isAdminComplianceDocument.value
    ? ''
    : findBuiltInLegalDocument(documentId.value)
      ? builtInLegalUpdatedAt
      : settings.value?.login_agreement_updated_at || ''
)
const documentTypeLabel = computed(() =>
  isAdminComplianceDocument.value ? t('legal.adminCompliance') : t('legal.loginAgreement')
)

const currentDocument = computed<LoginAgreementDocument | null>(() => {
  if (isAdminComplianceDocument.value) {
    return {
      id: 'admin-compliance',
      title: t('adminCompliance.title'),
      content_md: getLocale() === 'zh' ? zhAdminCompliance : enAdminCompliance
    }
  }
  const id = documentId.value
  if (!id) {
    return null
  }
  return findBuiltInLegalDocument(id) ?? documents.value.find((doc) => doc.id === id) ?? null
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
  const title = currentDocument.value?.title || ''
  if (title.includes('政策') || title.includes('隐私')) {
    return 'shield'
  }
  if (title.includes('国家') || title.includes('地区')) {
    return 'globe'
  }
  if (title.includes('特定')) {
    return 'cog'
  }
  return 'document'
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
  @apply mb-4 mt-2 border-b border-gray-200 pb-4 text-3xl font-bold tracking-normal text-gray-950 dark:border-dark-700 dark:text-white;
}

.legal-document-content :deep(h2) {
  @apply mb-3 mt-9 text-2xl font-bold tracking-normal text-gray-950 dark:text-white;
}

.legal-document-content :deep(h3) {
  @apply mb-2 mt-6 text-xl font-semibold text-gray-900 dark:text-white;
}

.legal-document-content :deep(h4) {
  @apply mb-2 mt-5 text-lg font-semibold;
}

.legal-document-content :deep(p) {
  @apply mb-4 text-[15px] text-gray-700 dark:text-dark-200;
}

.legal-document-content :deep(a) {
  @apply text-primary-600 underline underline-offset-4 hover:text-primary-700 dark:text-primary-300 dark:hover:text-primary-200;
}

.legal-document-content :deep(ul) {
  @apply mb-4 list-disc space-y-1 pl-6;
}

.legal-document-content :deep(ol) {
  @apply mb-4 list-decimal space-y-1 pl-6;
}

.legal-document-content :deep(li) {
  @apply text-[15px] text-gray-700 dark:text-dark-200;
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
  @apply my-6 block w-full overflow-x-auto rounded-xl border border-gray-200 dark:border-dark-700;
}

.legal-document-content :deep(th) {
  @apply border border-gray-200 bg-gray-50 px-4 py-3 text-left font-semibold text-gray-900 dark:border-dark-700 dark:bg-dark-800 dark:text-white;
}

.legal-document-content :deep(td) {
  @apply border border-gray-200 px-4 py-3 text-sm text-gray-700 dark:border-dark-700 dark:text-dark-200;
}

.legal-document-content :deep(img) {
  @apply my-5 h-auto max-w-full rounded-lg;
}

.legal-document-content :deep(hr) {
  @apply my-7 border-gray-200 dark:border-dark-700;
}
</style>
