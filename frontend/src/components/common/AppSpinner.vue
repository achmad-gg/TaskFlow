<template>
  <div :class="['inline-flex items-center justify-center', containerClass]">
    <svg
      :class="['animate-spin', sizeClass, colorClass]"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10"
        stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: { type: String, default: 'md' },   // sm | md | lg
  color: { type: String, default: 'primary' },
  fullScreen: { type: Boolean, default: false },
})

const sizeClass = computed(() => ({
  sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10',
}[props.size]))

const colorClass = computed(() => ({
  primary: 'text-primary-600',
  white: 'text-white',
  gray: 'text-gray-400',
}[props.color]))

const containerClass = computed(() =>
  props.fullScreen ? 'fixed inset-0 bg-white/80 z-50' : ''
)
</script>