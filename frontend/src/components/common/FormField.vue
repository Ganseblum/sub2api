<template>
  <div class="form-field" :class="fieldClass">
    <div v-if="label || $slots.label || help" class="form-field__label-row">
      <slot name="label">
        <label v-if="label" :for="htmlFor" class="input-label">
          {{ label }}
          <span v-if="required" class="form-field__required">*</span>
        </label>
      </slot>
      <HelpTooltip v-if="help" :content="help" variant="youc" />
    </div>
    <slot />
    <p v-if="error" class="input-error-text">{{ error }}</p>
    <p v-else-if="hint || $slots.hint" class="input-hint">
      <slot name="hint">{{ hint }}</slot>
    </p>
  </div>
</template>

<script setup lang="ts">
import HelpTooltip from '@/components/common/HelpTooltip.vue'

withDefaults(
  defineProps<{
    label?: string
    hint?: string
    help?: string
    error?: string
    htmlFor?: string
    required?: boolean
    fieldClass?: string
  }>(),
  {
    required: false,
  },
)
</script>
