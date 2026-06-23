<template>
  <div
    class="modal-footer"
    :class="{ 'modal-footer--split': $slots.start }"
  >
    <div v-if="$slots.start" class="modal-footer__start">
      <slot name="start" />
    </div>
    <div class="modal-footer__actions">
      <button
        v-if="showCancel"
        type="button"
        class="btn btn-secondary"
        :class="sizeClass"
        :disabled="loading"
        @click="emit('cancel')"
      >
        {{ cancelText }}
      </button>
      <button
        v-if="showConfirm"
        :type="confirmForm ? 'submit' : 'button'"
        :form="confirmForm || undefined"
        class="btn"
        :class="[confirmBtnClass, sizeClass]"
        :disabled="loading || confirmDisabled"
        :data-tour="confirmDataTour || undefined"
        @click="onConfirmClick"
      >
        <svg
          v-if="loading && showSpinner"
          class="-ml-1 mr-2 h-4 w-4 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        {{ loading && loadingText ? loadingText : confirmText }}
      </button>
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = withDefaults(
  defineProps<{
    cancelText?: string
    confirmText?: string
    loadingText?: string
    loading?: boolean
    confirmDisabled?: boolean
    showCancel?: boolean
    showConfirm?: boolean
    size?: 'sm' | 'md'
    variant?: 'primary' | 'danger'
    confirmForm?: string
    confirmDataTour?: string
    showSpinner?: boolean
  }>(),
  {
    loading: false,
    confirmDisabled: false,
    showCancel: true,
    showConfirm: true,
    size: 'md',
    variant: 'primary',
    showSpinner: true,
  },
)

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'confirm'): void
}>()

const { t } = useI18n()

const cancelText = computed(() => props.cancelText ?? t('common.cancel'))
const confirmText = computed(() => props.confirmText ?? t('common.save'))

const sizeClass = computed(() => (props.size === 'sm' ? 'btn-sm' : undefined))

const confirmBtnClass = computed(() =>
  props.variant === 'danger' ? 'btn-danger' : 'btn-primary',
)

function onConfirmClick() {
  if (props.confirmForm) return
  emit('confirm')
}
</script>
