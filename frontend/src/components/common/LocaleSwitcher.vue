<template>
  <YoucDropdown
    v-model:open="isOpen"
    :disabled="switching"
    :block="false"
    panel-width="trigger"
    align="right"
    trigger-class="locale-dropdown-trigger"
    panel-class="locale-dropdown-panel"
  >
    <template #trigger>
      <span class="locale-dropdown-value">{{ currentLocale?.name ?? currentLocaleCode.toUpperCase() }}</span>
      <Icon
        name="chevronDown"
        size="xs"
        class="locale-dropdown-chevron transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
      />
    </template>

    <button
      v-for="locale in availableLocales"
      :key="locale.code"
      type="button"
      :disabled="switching"
      class="youc-dropdown-option"
      :class="{ 'youc-dropdown-option-selected': locale.code === currentLocaleCode }"
      @click="selectLocale(locale.code)"
    >
      <span>{{ locale.name }}</span>
      <Icon
        v-if="locale.code === currentLocaleCode"
        name="check"
        size="sm"
        class="ml-auto flex-shrink-0"
      />
    </button>
  </YoucDropdown>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Icon from '@/components/icons/Icon.vue'
import YoucDropdown from '@/components/common/YoucDropdown.vue'
import { setLocale, availableLocales } from '@/i18n'

const { locale } = useI18n()

const isOpen = ref(false)
const switching = ref(false)

const currentLocaleCode = computed(() => locale.value)
const currentLocale = computed(() => availableLocales.find((l) => l.code === locale.value))

async function selectLocale(code: string) {
  if (switching.value || code === currentLocaleCode.value) {
    isOpen.value = false
    return
  }
  switching.value = true
  try {
    await setLocale(code)
    isOpen.value = false
  } finally {
    switching.value = false
  }
}
</script>
