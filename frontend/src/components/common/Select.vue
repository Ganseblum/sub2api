<template>
  <YoucDropdown
    v-model:open="isOpen"
    ref="dropdownComponent"
    teleport
    panel-width="trigger"
    :disabled="disabled"
    :error="error"
    trigger-class="select-trigger"
    panel-class="select-dropdown-portal"
    @trigger-keydown="onTriggerKeyDown"
  >
    <template #trigger>
      <span class="select-value">
        <slot name="selected" :option="selectedOption">
          {{ selectedLabel }}
        </slot>
      </span>
      <span
        v-if="clearable && hasValue && !disabled"
        class="select-clear"
        role="button"
        tabindex="-1"
        aria-label="Clear selection"
        @click.stop="clearSelection"
        @mousedown.stop
        @keydown.enter.stop.prevent="clearSelection"
      >
        <Icon name="x" size="sm" />
      </span>
      <span class="select-icon">
        <Icon
          name="chevronDown"
          size="md"
          :class="['transition-transform duration-200', isOpen && 'rotate-180']"
        />
      </span>
    </template>

    <div role="listbox" @keydown="onDropdownKeyDown">
      <div v-if="isSearchable" class="select-search">
        <Icon name="search" size="sm" class="select-search-icon" />
        <input
          ref="searchInputRef"
          v-model="searchQuery"
          type="text"
          :placeholder="searchPlaceholderText"
          class="select-search-input"
          @click.stop
        />
      </div>

      <div class="select-options" ref="optionsListRef">
        <div
          v-for="(option, index) in filteredOptions"
          :key="`${typeof getOptionValue(option)}:${String(getOptionValue(option) ?? '')}`"
          role="option"
          :aria-selected="isSelected(option)"
          :aria-disabled="isOptionDisabled(option)"
          @click.stop="!isOptionDisabled(option) && selectOption(option)"
          @mousedown.prevent
          @mouseenter="handleOptionMouseEnter(option, index)"
          :class="[
            'select-option',
            isGroupHeaderOption(option) && 'select-option-group',
            isSelected(option) && 'select-option-selected',
            isOptionDisabled(option) && !isGroupHeaderOption(option) && 'select-option-disabled',
            focusedIndex === index && !isGroupHeaderOption(option) && 'select-option-focused'
          ]"
        >
          <slot name="option" :option="option" :selected="isSelected(option)">
            <Icon
              v-if="option._creatable"
              name="search"
              size="sm"
              class="flex-shrink-0 text-gray-400"
            />
            <span class="select-option-label" :class="option._creatable && 'italic text-gray-500 dark:text-dark-300'">{{ getOptionLabel(option) }}</span>
            <Icon
              v-if="isSelected(option)"
              name="check"
              size="sm"
              class="select-option-check flex-shrink-0"
              :stroke-width="2"
            />
          </slot>
        </div>

        <div v-if="filteredOptions.length === 0" class="select-empty">
          {{ emptyTextDisplay }}
        </div>
      </div>
    </div>
  </YoucDropdown>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import Icon from '@/components/icons/Icon.vue'
import YoucDropdown from '@/components/common/YoucDropdown.vue'

const { t } = useI18n()

export interface SelectOption {
  value: string | number | boolean | null
  label: string
  disabled?: boolean
  [key: string]: unknown
}

interface Props {
  modelValue: string | number | boolean | null | undefined
  options: SelectOption[] | Array<Record<string, unknown>>
  placeholder?: string
  disabled?: boolean
  error?: boolean
  searchable?: boolean | 'auto'
  searchPlaceholder?: string
  emptyText?: string
  valueKey?: string
  labelKey?: string
  creatable?: boolean
  creatablePrefix?: string
  clearable?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string | number | boolean | null): void
  (e: 'change', value: string | number | boolean | null, option: SelectOption | null): void
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  error: false,
  searchable: 'auto',
  creatable: false,
  creatablePrefix: '',
  clearable: false,
  valueKey: 'value',
  labelKey: 'label'
})

const emit = defineEmits<Emits>()

const isOpen = ref(false)
const searchQuery = ref('')
const focusedIndex = ref(-1)
const dropdownComponent = ref<InstanceType<typeof YoucDropdown> | null>(null)
const searchInputRef = ref<HTMLInputElement | null>(null)
const optionsListRef = ref<HTMLElement | null>(null)

const placeholderText = computed(() => props.placeholder ?? t('common.selectOption'))
const searchPlaceholderText = computed(() => props.searchPlaceholder ?? t('common.searchPlaceholder'))
const emptyTextDisplay = computed(() => props.emptyText ?? t('common.noOptionsFound'))

const isSearchable = computed(() => {
  if (props.searchable === 'auto') return props.options.length > 5
  return props.searchable
})

const getOptionValue = (option: any): any => {
  if (typeof option === 'object' && option !== null) {
    return option[props.valueKey]
  }
  return option
}

const getOptionLabel = (option: any): string => {
  if (typeof option === 'object' && option !== null) {
    return String(option[props.labelKey] ?? '')
  }
  return String(option ?? '')
}

const isOptionDisabled = (option: any): boolean => {
  if (typeof option === 'object' && option !== null) {
    return !!option.disabled
  }
  return false
}

const isGroupHeaderOption = (option: any): boolean => {
  if (typeof option === 'object' && option !== null) {
    return option.kind === 'group'
  }
  return false
}

const selectedOption = computed(() => {
  return props.options.find((opt) => getOptionValue(opt) === props.modelValue) || null
})

const selectedLabel = computed(() => {
  if (selectedOption.value) {
    return getOptionLabel(selectedOption.value)
  }
  if (props.creatable && props.modelValue) {
    return String(props.modelValue)
  }
  return placeholderText.value
})

const hasValue = computed(
  () => props.modelValue !== null && props.modelValue !== undefined && props.modelValue !== ''
)

const filteredOptions = computed(() => {
  let opts = props.options as any[]
  if (isSearchable.value && searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    opts = opts.filter((opt) => {
      if (getOptionLabel(opt).toLowerCase().includes(query)) return true
      if (opt.description && String(opt.description).toLowerCase().includes(query)) return true
      return false
    })
    if (props.creatable && searchQuery.value.trim()) {
      const trimmed = searchQuery.value.trim()
      const prefix = props.creatablePrefix || t('common.search')
      opts = [{ [props.valueKey]: trimmed, [props.labelKey]: `${prefix} "${trimmed}"`, _creatable: true }, ...opts]
    }
  }
  return opts
})

const isSelected = (option: any): boolean => {
  return getOptionValue(option) === props.modelValue
}

const findNextEnabledIndex = (startIndex: number): number => {
  const opts = filteredOptions.value
  if (opts.length === 0) return -1
  for (let offset = 0; offset < opts.length; offset++) {
    const idx = (startIndex + offset) % opts.length
    if (!isOptionDisabled(opts[idx])) return idx
  }
  return -1
}

const findPrevEnabledIndex = (startIndex: number): number => {
  const opts = filteredOptions.value
  if (opts.length === 0) return -1
  for (let offset = 0; offset < opts.length; offset++) {
    const idx = (startIndex - offset + opts.length) % opts.length
    if (!isOptionDisabled(opts[idx])) return idx
  }
  return -1
}

const handleOptionMouseEnter = (option: any, index: number) => {
  if (isOptionDisabled(option) || isGroupHeaderOption(option)) return
  focusedIndex.value = index
}

watch(isOpen, (open) => {
  if (open) {
    if (filteredOptions.value.length === 0) {
      focusedIndex.value = -1
    } else {
      const selectedIdx = filteredOptions.value.findIndex(isSelected)
      const initialIdx = selectedIdx >= 0 ? selectedIdx : 0
      focusedIndex.value = isOptionDisabled(filteredOptions.value[initialIdx])
        ? findNextEnabledIndex(initialIdx + 1)
        : initialIdx
    }

    if (isSearchable.value) {
      nextTick(() => searchInputRef.value?.focus())
    }
  } else {
    searchQuery.value = ''
    focusedIndex.value = -1
  }
})

const selectOption = (option: any, restoreFocus = false) => {
  const value = getOptionValue(option) ?? null
  emit('update:modelValue', value)
  emit('change', value, option)
  isOpen.value = false
  if (restoreFocus) {
    nextTick(() => {
      dropdownComponent.value?.triggerRef?.focus({ preventScroll: true })
    })
  }
}

const clearSelection = () => {
  if (props.disabled) return
  emit('update:modelValue', null)
  emit('change', null, null)
}

const onTriggerKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    if (!isOpen.value) isOpen.value = true
  }
}

const onDropdownKeyDown = (e: KeyboardEvent) => {
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      focusedIndex.value = findNextEnabledIndex(focusedIndex.value + 1)
      if (focusedIndex.value >= 0) scrollToFocused()
      break
    case 'ArrowUp':
      e.preventDefault()
      focusedIndex.value = findPrevEnabledIndex(focusedIndex.value - 1)
      if (focusedIndex.value >= 0) scrollToFocused()
      break
    case 'Enter':
      e.preventDefault()
      if (focusedIndex.value >= 0 && focusedIndex.value < filteredOptions.value.length) {
        const opt = filteredOptions.value[focusedIndex.value]
        if (!isOptionDisabled(opt)) selectOption(opt, true)
      }
      break
    case 'Escape':
      e.preventDefault()
      isOpen.value = false
      dropdownComponent.value?.triggerRef?.focus({ preventScroll: true })
      break
    case 'Tab':
      isOpen.value = false
      break
  }
}

const scrollToFocused = () => {
  nextTick(() => {
    const list = optionsListRef.value
    if (!list) return
    const focusedEl = list.children[focusedIndex.value] as HTMLElement
    if (!focusedEl) return

    if (focusedEl.offsetTop < list.scrollTop) {
      list.scrollTop = focusedEl.offsetTop
    } else if (focusedEl.offsetTop + focusedEl.offsetHeight > list.scrollTop + list.offsetHeight) {
      list.scrollTop = focusedEl.offsetTop + focusedEl.offsetHeight - list.offsetHeight
    }
  })
}
</script>

<style>
.select-search {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-bottom: 2px solid var(--youc-line);
}

.select-search-icon {
  color: var(--youc-muted);
  flex-shrink: 0;
}

.select-search-input {
  flex: 1;
  background: transparent;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--youc-ink);
  outline: none;
}

.select-search-input::placeholder {
  color: var(--youc-muted);
}

.select-options {
  max-height: 20rem;
  overflow-y: auto;
  padding: 0;
  outline: none;
}

.select-option-disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.select-option-focused:not(.select-option-selected) {
  background: var(--youc-soft);
}

.select-option-group {
  cursor: default;
  user-select: none;
  background: var(--youc-soft);
  font-size: 0.6875rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--youc-muted);
}

.select-option-group:hover {
  background: var(--youc-soft);
}

.select-option-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
}

.select-option-check {
  color: inherit;
}

.select-empty {
  padding: 2rem 1rem;
  text-align: center;
  font-size: 0.875rem;
  color: var(--youc-muted);
}
</style>
