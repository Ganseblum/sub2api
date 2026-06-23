<template>
  <div ref="rootRef" class="usage-filter-search relative w-full sm:w-auto" :class="minWidthClass">
    <label class="input-label">{{ label }}</label>
    <div class="relative">
      <input
        :value="keyword"
        type="text"
        class="input w-full pr-8"
        :placeholder="placeholder"
        @input="onInput"
        @focus="onFocus"
      />
      <button
        v-if="showClear"
        type="button"
        class="usage-filter-clear absolute right-2 top-1/2 -translate-y-1/2"
        :aria-label="clearLabel"
        @mousedown.prevent
        @click="onClear"
      >
        ✕
      </button>
    </div>
    <div
      v-if="open && showPanel"
      class="usage-filter-menu youc-dropdown-panel youc-dropdown-panel-inline youc-dropdown-panel-trigger absolute z-50 mt-1 max-h-60 w-full overflow-auto"
    >
      <button
        v-for="item in results"
        :key="resolveItemKey(item)"
        type="button"
        class="usage-filter-option youc-dropdown-option"
        @mousedown.prevent
        @click="onSelect(item)"
      >
        <slot name="option" :item="item" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T">
import { ref, onMounted, onUnmounted } from 'vue'

const props = withDefaults(defineProps<{
  label: string
  placeholder: string
  keyword: string
  results: T[]
  open: boolean
  showClear?: boolean
  showPanel?: boolean
  minWidthClass?: string
  clearLabel?: string
  itemKey?: (item: T) => string | number
}>(), {
  showClear: false,
  showPanel: true,
  minWidthClass: 'sm:min-w-[240px]',
  clearLabel: 'Clear filter',
  itemKey: (item: T) => (item as { id?: number }).id ?? JSON.stringify(item)
})

const emit = defineEmits<{
  'update:keyword': [value: string]
  'update:open': [value: boolean]
  input: []
  focus: []
  clear: []
  select: [item: T]
}>()

const rootRef = ref<HTMLElement | null>(null)

const onInput = (event: Event) => {
  emit('update:keyword', (event.target as HTMLInputElement).value)
  emit('input')
  emit('update:open', true)
}

const onFocus = () => {
  emit('focus')
  emit('update:open', true)
}

const onClear = () => {
  emit('clear')
}

const onSelect = (item: T) => {
  emit('select', item)
  emit('update:open', false)
}

const resolveItemKey = (item: T) => props.itemKey(item)

const onDocumentClick = (event: MouseEvent) => {
  const target = event.target as Node | null
  if (!target || !rootRef.value) return
  if (!rootRef.value.contains(target)) {
    emit('update:open', false)
  }
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
})
</script>
