<template>
  <div
    class="setting-toggle-row"
    :class="{ 'setting-toggle-row--bordered': bordered }"
  >
    <div class="setting-toggle-row__main">
      <div v-if="label || $slots.label || help || $slots.help" class="setting-toggle-row__label-row">
        <slot name="label">
          <span v-if="label" class="setting-toggle-row__label">{{ label }}</span>
        </slot>
        <HelpTooltip v-if="help" :content="help" variant="youc" />
        <slot name="help" />
      </div>
      <p v-if="hint || $slots.hint" class="setting-toggle-row__hint">
        <slot name="hint">{{ hint }}</slot>
      </p>
    </div>
    <Toggle
      :model-value="modelValue"
      :disabled="disabled"
      :sm="sm"
      @update:model-value="emit('update:modelValue', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import Toggle from '@/components/common/Toggle.vue'
import HelpTooltip from '@/components/common/HelpTooltip.vue'

withDefaults(
  defineProps<{
    modelValue: boolean
    label?: string
    hint?: string
    help?: string
    bordered?: boolean
    disabled?: boolean
    sm?: boolean
  }>(),
  {
    bordered: false,
    disabled: false,
    sm: false,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()
</script>
