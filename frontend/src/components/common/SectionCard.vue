<template>
  <div class="card" :class="cardClass">
    <div v-if="title || description || $slots.header" class="card-header">
      <slot name="header">
        <h3 v-if="title" class="card-title">{{ title }}</h3>
        <p v-if="description" class="card-desc">{{ description }}</p>
      </slot>
    </div>
    <div class="card-body" :class="bodyClass">
      <slot />
    </div>
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    description?: string
    cardClass?: string
    bodyClass?: string
  }>(),
  {},
)
</script>
