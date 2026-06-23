<template>
  <YoucDropdown
    v-model:open="isOpen"
    panel-width="lg"
    trigger-class="date-picker-trigger"
    panel-class="date-picker-dropdown"
  >
    <template #trigger>
      <span class="date-picker-icon">
        <Icon name="calendar" size="sm" />
      </span>
      <span class="date-picker-value">
        {{ displayValue }}
      </span>
      <span class="date-picker-chevron">
        <Icon
          name="chevronDown"
          size="sm"
          :class="['transition-transform duration-200', isOpen && 'rotate-180']"
        />
      </span>
    </template>

    <div class="date-picker-presets">
      <button
        v-for="preset in presets"
        :key="preset.value"
        type="button"
        @click="selectPreset(preset)"
        :class="['date-picker-preset', isPresetActive(preset) && 'date-picker-preset-active']"
      >
        {{ t(preset.labelKey) }}
      </button>
    </div>

    <div class="date-picker-divider"></div>

    <div class="date-picker-custom">
      <div class="date-picker-field">
        <label class="date-picker-label">{{ t('dates.startDate') }}</label>
        <input
          type="date"
          v-model="localStartDate"
          :max="localEndDate || tomorrow"
          class="date-picker-input"
          @change="onDateChange"
        />
      </div>
      <div class="date-picker-separator">
        <Icon name="arrowRight" size="sm" class="date-picker-separator" />
      </div>
      <div class="date-picker-field">
        <label class="date-picker-label">{{ t('dates.endDate') }}</label>
        <input
          type="date"
          v-model="localEndDate"
          :min="localStartDate"
          :max="tomorrow"
          class="date-picker-input"
          @change="onDateChange"
        />
      </div>
    </div>

    <div class="date-picker-actions">
      <button type="button" @click="apply" class="date-picker-apply">
        {{ t('dates.apply') }}
      </button>
    </div>
  </YoucDropdown>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Icon from '@/components/icons/Icon.vue'
import YoucDropdown from '@/components/common/YoucDropdown.vue'

interface DatePreset {
  labelKey: string
  value: string
  getRange: () => { start: string; end: string }
}

interface Props {
  startDate: string
  endDate: string
}

interface Emits {
  (e: 'update:startDate', value: string): void
  (e: 'update:endDate', value: string): void
  (e: 'change', range: { startDate: string; endDate: string; preset: string | null }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t, locale } = useI18n()

const isOpen = ref(false)
const localStartDate = ref(props.startDate)
const localEndDate = ref(props.endDate)
const activePreset = ref<string | null>('last24Hours')

const today = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
})

const tomorrow = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return formatDateToString(d)
})

const formatDateToString = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const presets: DatePreset[] = [
  {
    labelKey: 'dates.today',
    value: 'today',
    getRange: () => {
      const t = today.value
      return { start: t, end: t }
    }
  },
  {
    labelKey: 'dates.yesterday',
    value: 'yesterday',
    getRange: () => {
      const d = new Date()
      d.setDate(d.getDate() - 1)
      const yesterday = formatDateToString(d)
      return { start: yesterday, end: yesterday }
    }
  },
  {
    labelKey: 'dates.last24Hours',
    value: 'last24Hours',
    getRange: () => {
      const end = new Date()
      const start = new Date(end.getTime() - 24 * 60 * 60 * 1000)
      return {
        start: formatDateToString(start),
        end: formatDateToString(end)
      }
    }
  },
  {
    labelKey: 'dates.last7Days',
    value: '7days',
    getRange: () => {
      const end = today.value
      const d = new Date()
      d.setDate(d.getDate() - 6)
      const start = formatDateToString(d)
      return { start, end }
    }
  },
  {
    labelKey: 'dates.last14Days',
    value: '14days',
    getRange: () => {
      const end = today.value
      const d = new Date()
      d.setDate(d.getDate() - 13)
      const start = formatDateToString(d)
      return { start, end }
    }
  },
  {
    labelKey: 'dates.last30Days',
    value: '30days',
    getRange: () => {
      const end = today.value
      const d = new Date()
      d.setDate(d.getDate() - 29)
      const start = formatDateToString(d)
      return { start, end }
    }
  },
  {
    labelKey: 'dates.thisMonth',
    value: 'thisMonth',
    getRange: () => {
      const now = new Date()
      const start = formatDateToString(new Date(now.getFullYear(), now.getMonth(), 1))
      return { start, end: today.value }
    }
  },
  {
    labelKey: 'dates.lastMonth',
    value: 'lastMonth',
    getRange: () => {
      const now = new Date()
      const start = formatDateToString(new Date(now.getFullYear(), now.getMonth() - 1, 1))
      const end = formatDateToString(new Date(now.getFullYear(), now.getMonth(), 0))
      return { start, end }
    }
  }
]

const displayValue = computed(() => {
  if (activePreset.value) {
    const preset = presets.find((p) => p.value === activePreset.value)
    if (preset) return t(preset.labelKey)
  }

  if (localStartDate.value && localEndDate.value) {
    if (localStartDate.value === localEndDate.value) {
      return formatDate(localStartDate.value)
    }
    return `${formatDate(localStartDate.value)} - ${formatDate(localEndDate.value)}`
  }

  return t('dates.selectDateRange')
})

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr + 'T00:00:00')
  const dateLocale = locale.value === 'zh' ? 'zh-CN' : 'en-US'
  return date.toLocaleDateString(dateLocale, { month: 'short', day: 'numeric' })
}

const isPresetActive = (preset: DatePreset): boolean => {
  return activePreset.value === preset.value
}

const selectPreset = (preset: DatePreset) => {
  const range = preset.getRange()
  localStartDate.value = range.start
  localEndDate.value = range.end
  activePreset.value = preset.value
}

const onDateChange = () => {
  activePreset.value = null
  for (const preset of presets) {
    const range = preset.getRange()
    if (range.start === localStartDate.value && range.end === localEndDate.value) {
      activePreset.value = preset.value
      break
    }
  }
}

const apply = () => {
  emit('update:startDate', localStartDate.value)
  emit('update:endDate', localEndDate.value)
  emit('change', {
    startDate: localStartDate.value,
    endDate: localEndDate.value,
    preset: activePreset.value
  })
  isOpen.value = false
}

watch(
  () => props.startDate,
  (val) => {
    localStartDate.value = val
    onDateChange()
  }
)

watch(
  () => props.endDate,
  (val) => {
    localEndDate.value = val
    onDateChange()
  }
)

onDateChange()
</script>

<style>
.date-picker-trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: normal;
  text-transform: none;
}

.date-picker-icon,
.date-picker-chevron {
  color: var(--youc-muted);
}

.date-picker-value {
  font-weight: 700;
}

.date-picker-dropdown {
  min-width: 320px;
}

.date-picker-presets {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.25rem;
  padding: 0.5rem;
}

.date-picker-preset {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--youc-muted);
  border: 2px solid transparent;
  background: transparent;
  transition: background-color 120ms ease, color 120ms ease;
}

.date-picker-preset:hover {
  background: var(--youc-soft);
  color: var(--youc-ink);
}

.date-picker-preset-active {
  background: var(--youc-ink);
  color: var(--youc-bg);
  border-color: var(--youc-line);
}

.date-picker-divider {
  border-top: 2px solid var(--youc-line);
}

.date-picker-custom {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  padding: 0.75rem;
}

.date-picker-field {
  flex: 1;
}

.date-picker-label {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--youc-muted);
}

.date-picker-input {
  width: 100%;
  padding: 0.375rem 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  border: 2px solid var(--youc-line);
  border-radius: 0;
  background: var(--youc-paper);
  color: var(--youc-ink);
}

.date-picker-input:focus {
  outline: none;
  box-shadow: var(--youc-shadow);
}

.date-picker-separator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 0.25rem;
  color: var(--youc-muted);
}

.date-picker-actions {
  display: flex;
  justify-content: flex-end;
  padding: 0.5rem;
  padding-top: 0;
}

.date-picker-apply {
  padding: 0.375rem 1rem;
  font-size: 0.875rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border: 2.5px solid var(--youc-line);
  background: var(--youc-ink);
  color: var(--youc-bg);
  box-shadow: var(--youc-shadow);
  transition: transform 120ms ease, box-shadow 120ms ease;
}

.date-picker-apply:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 var(--youc-line);
}
</style>
