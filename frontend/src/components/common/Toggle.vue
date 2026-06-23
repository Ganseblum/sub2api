<template>
  <button
    type="button"
    @click="toggle"
    class="switch"
    :class="{
      'switch-active': modelValue,
      'switch-disabled': disabled,
      'switch-sm': sm,
    }"
    role="switch"
    :aria-checked="modelValue"
    :disabled="disabled"
  >
    <span class="switch-thumb" />
  </button>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: boolean
  disabled?: boolean
  sm?: boolean
}>(), {
  disabled: false,
  sm: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

function toggle() {
  if (props.disabled) return
  emit('update:modelValue', !props.modelValue)
}
</script>
