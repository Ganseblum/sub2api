<template>
  <AppLayout>
    <div class="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ t('contact.title') }}
        </h1>
        <p class="mt-2 text-sm text-gray-600 dark:text-dark-300">
          {{ t('contact.description') }}
        </p>
      </header>

      <div class="grid gap-4 md:grid-cols-2">
        <article class="card p-6">
          <div class="flex items-start gap-4">
            <div class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
              <Icon name="chat" size="lg" />
            </div>
            <div class="min-w-0 flex-1">
              <h2 class="text-base font-semibold text-gray-900 dark:text-white">
                {{ t('contact.customerService') }}
              </h2>
              <div class="mt-3 flex items-center gap-2">
                <span class="min-w-0 flex-1 break-all font-mono text-xl font-bold text-gray-900 dark:text-white">
                  {{ customerServiceQQ }}
                </span>
                <button
                  type="button"
                  class="btn btn-ghost btn-icon flex-shrink-0"
                  :title="t('contact.copyNumber')"
                  :aria-label="t('contact.copyNumber')"
                  @click="copyNumber(customerServiceQQ)"
                >
                  <Icon name="copy" size="sm" />
                </button>
              </div>
              <p class="mt-3 text-sm leading-6 text-gray-500 dark:text-dark-400">
                {{ t('contact.customerServiceHint') }}
              </p>
            </div>
          </div>
        </article>

        <article class="card p-6">
          <div class="flex items-start gap-4">
            <div class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              <Icon name="users" size="lg" />
            </div>
            <div class="min-w-0 flex-1">
              <h2 class="text-base font-semibold text-gray-900 dark:text-white">
                {{ t('contact.qqGroup') }}
              </h2>
              <div class="mt-3 flex items-center gap-2">
                <span class="min-w-0 flex-1 break-all font-mono text-xl font-bold text-gray-900 dark:text-white">
                  {{ qqGroup }}
                </span>
                <button
                  type="button"
                  class="btn btn-ghost btn-icon flex-shrink-0"
                  :title="t('contact.copyGroupNumber')"
                  :aria-label="t('contact.copyGroupNumber')"
                  @click="copyNumber(qqGroup)"
                >
                  <Icon name="copy" size="sm" />
                </button>
              </div>
              <p class="mt-3 text-sm leading-6 text-gray-500 dark:text-dark-400">
                {{ t('contact.qqGroupHint') }}
              </p>
            </div>
          </div>
        </article>
      </div>

      <section class="rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 dark:border-amber-800/60 dark:bg-amber-900/20">
        <div class="flex items-start gap-3">
          <Icon name="infoCircle" size="md" class="mt-0.5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <h2 class="text-sm font-semibold text-amber-900 dark:text-amber-200">
              {{ t('contact.noticeTitle') }}
            </h2>
            <p class="mt-1 text-sm leading-6 text-amber-800 dark:text-amber-300">
              {{ t('contact.notice') }}
            </p>
          </div>
        </div>
      </section>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AppLayout from '@/components/layout/AppLayout.vue'
import { Icon } from '@/components/icons'
import { useClipboard } from '@/composables/useClipboard'

const customerServiceQQ = '977252487'
const qqGroup = '821362587'

const { t } = useI18n()
const { copyToClipboard } = useClipboard()

function copyNumber(value: string) {
  void copyToClipboard(value, t('contact.copied'))
}
</script>
