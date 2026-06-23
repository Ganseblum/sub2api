<template>
  <label class="flex flex-col items-center gap-0.5 cursor-pointer">
    <span class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{{ label }}</span>
    <button
      type="button"
      role="switch"
      :aria-checked="checked"
      @click="emit('toggle')"
      class="switch switch-sm"
      :class="{ 'switch-active': checked }"
    >
      <span class="switch-thumb" />
    </button>
  </label>
</template>

<script setup lang="ts">
defineProps<{ label: string; checked: boolean }>()
const emit = defineEmits<{ toggle: [] }>()
</script>
