<template>
  <div ref="rootRef" class="youc-dropdown" :class="{ 'youc-dropdown-block': block }">
    <button
      ref="triggerRef"
      type="button"
      class="youc-dropdown-trigger"
      :class="[
        open && 'youc-dropdown-trigger-open',
        teleport && (open || isPanelLeaving) && 'youc-dropdown-trigger-detached',
        error && 'youc-dropdown-trigger-error',
        disabled && 'youc-dropdown-trigger-disabled',
        triggerClass
      ]"
      :disabled="disabled"
      :aria-expanded="open"
      aria-haspopup="listbox"
      @click="onTriggerClick"
      @keydown="onTriggerKeydown"
    >
      <slot name="trigger" :open="open" />
    </button>

    <component :is="teleport ? Teleport : 'div'" :to="teleport ? 'body' : undefined">
        <Transition
          :name="transitionName"
          @before-leave="isPanelLeaving = true"
          @after-leave="isPanelLeaving = false"
        >
          <div
            v-if="open"
          ref="panelRef"
          class="youc-dropdown-panel"
          :class="[
            panelWidthClass,
            !teleport && 'youc-dropdown-panel-inline',
            align === 'right' && 'youc-dropdown-panel-right',
            teleport && 'youc-dropdown-panel-floating',
            instanceId,
            panelClass
          ]"
          :style="floatingStyle"
          @click.stop
          @mousedown.stop
        >
          <slot :open="open" :close="close" />
        </div>
      </Transition>
    </component>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  onMounted,
  onUnmounted,
  nextTick,
  Teleport
} from 'vue'

export type YoucDropdownPanelWidth = 'sm' | 'md' | 'lg' | 'trigger' | 'auto'

interface Props {
  open?: boolean
  disabled?: boolean
  error?: boolean
  teleport?: boolean
  block?: boolean
  panelWidth?: YoucDropdownPanelWidth
  align?: 'left' | 'right'
  closeOnClickOutside?: boolean
  closeOnEscape?: boolean
  triggerClass?: string
  panelClass?: string
  zIndex?: number
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  disabled: false,
  error: false,
  teleport: false,
  block: true,
  panelWidth: 'trigger',
  align: 'left',
  closeOnClickOutside: true,
  closeOnEscape: true,
  zIndex: 50
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  open: []
  close: []
  'trigger-keydown': [event: KeyboardEvent]
}>()

const instanceId = `youc-dropdown-${Math.random().toString(36).substring(2, 9)}`
const rootRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLButtonElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const dropdownPosition = ref<'bottom' | 'top'>('bottom')
const triggerRect = ref<DOMRect | null>(null)
const isPanelLeaving = ref(false)

const transitionName = computed(() =>
  props.teleport ? 'youc-dropdown-float' : 'youc-dropdown-inline'
)

const panelWidthClass = computed(() => {
  const map: Record<YoucDropdownPanelWidth, string> = {
    sm: 'youc-dropdown-panel-sm',
    md: 'youc-dropdown-panel-md',
    lg: 'youc-dropdown-panel-lg',
    trigger: 'youc-dropdown-panel-trigger',
    auto: 'youc-dropdown-panel-auto'
  }
  return map[props.panelWidth]
})

const floatingStyle = computed(() => {
  if (!props.teleport || !triggerRect.value) return undefined

  const rect = triggerRect.value
  const style: Record<string, string> = {
    position: 'fixed',
    zIndex: String(props.zIndex)
  }

  if (props.panelWidth === 'trigger') {
    style.minWidth = `${rect.width}px`
  }

  if (dropdownPosition.value === 'top') {
    style.left = `${rect.left}px`
    style.bottom = `${window.innerHeight - rect.top + 6}px`
  } else if (props.align === 'right') {
    style.left = 'auto'
    style.right = `${window.innerWidth - rect.right}px`
    style.top = `${rect.bottom + 6}px`
  } else {
    style.left = `${rect.left}px`
    style.top = `${rect.bottom + 6}px`
  }

  return style
})

function openDropdown() {
  if (props.disabled) return
  emit('update:open', true)
  emit('open')
}

function close() {
  if (!props.open) return
  emit('update:open', false)
  emit('close')
}

function toggle() {
  if (props.open) close()
  else openDropdown()
}

function onTriggerClick() {
  toggle()
}

function onTriggerKeydown(event: KeyboardEvent) {
  emit('trigger-keydown', event)
}

function updateTriggerRect() {
  const el = triggerRef.value ?? rootRef.value
  if (el) triggerRect.value = el.getBoundingClientRect()
}

function calculateFloatingPosition() {
  if (!props.teleport) return
  updateTriggerRect()

  nextTick(() => {
    if (!panelRef.value || !triggerRect.value) return
    const panelHeight = panelRef.value.offsetHeight || 240
    const spaceBelow = window.innerHeight - triggerRect.value.bottom
    const spaceAbove = triggerRect.value.top

    dropdownPosition.value =
      spaceBelow < panelHeight && spaceAbove > panelHeight ? 'top' : 'bottom'
  })
}

function handleClickOutside(event: MouseEvent) {
  if (!props.closeOnClickOutside || !props.open) return
  const target = event.target as HTMLElement
  const inPanel = !!target.closest(`.${instanceId}`)
  const inRoot = rootRef.value?.contains(target)
  if (!inPanel && !inRoot) close()
}

function handleEscape(event: KeyboardEvent) {
  if (!props.closeOnEscape || !props.open || event.key !== 'Escape') return
  close()
  triggerRef.value?.focus()
}

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    calculateFloatingPosition()
    if (props.teleport) {
      window.addEventListener('scroll', updateTriggerRect, { capture: true, passive: true })
      window.addEventListener('resize', calculateFloatingPosition)
    }
  },
  { flush: 'post' }
)

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) return
    window.removeEventListener('scroll', updateTriggerRect, { capture: true })
    window.removeEventListener('resize', calculateFloatingPosition)
  }
)

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscape)
  window.removeEventListener('scroll', updateTriggerRect, { capture: true })
  window.removeEventListener('resize', calculateFloatingPosition)
})

defineExpose({
  rootRef,
  triggerRef,
  panelRef,
  open: openDropdown,
  close,
  toggle,
  updateTriggerRect
})
</script>
