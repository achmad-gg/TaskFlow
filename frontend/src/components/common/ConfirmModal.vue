<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50" @click="$emit('cancel')" />

        <!-- Dialog -->
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
          <!-- Icon -->
          <div :class="['mx-auto w-12 h-12 rounded-full flex items-center justify-center', iconBg]">
            <AppIcon :name="iconName" size="lg" :class="iconColor" />
          </div>

          <!-- Content -->
          <div class="text-center">
            <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
            <p class="text-sm text-gray-500 mt-1">{{ message }}</p>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 pt-2">
            <button
              @click="$emit('cancel')"
              class="btn-secondary flex-1"
              :disabled="loading"
            >
              {{ cancelText }}
            </button>
            <button
              @click="$emit('confirm')"
              :class="['flex-1 font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 cursor-pointer', confirmClass]"
              :disabled="loading"
            >
              <span v-if="loading" class="flex items-center justify-center gap-2">
                <AppSpinner size="sm" color="white" /> Processing...
              </span>
              <span v-else>{{ confirmText }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import AppIcon from './AppIcon.vue'
import AppSpinner from './AppSpinner.vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  variant: { type: String, default: 'danger' }, // danger | warning
  title: { type: String, default: 'Are you sure?' },
  message: { type: String, default: 'This action cannot be undone.' },
  confirmText: { type: String, default: 'Confirm' },
  cancelText: { type: String, default: 'Cancel' },
  loading: { type: Boolean, default: false },
})

defineEmits(['confirm', 'cancel'])

const iconName = computed(() => ({
  danger: 'delete',
  warning: 'alert-triangle',
}[props.variant] || 'alert-triangle'))

const iconBg = computed(() => ({
  danger: 'bg-red-100',
  warning: 'bg-yellow-100',
}[props.variant]))

const iconColor = computed(() => ({
  danger: 'text-red-600',
  warning: 'text-yellow-600',
}[props.variant]))

const confirmClass = computed(() => ({
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
}[props.variant]))
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .relative, .modal-leave-to .relative {
  transform: scale(0.95);
}
</style>
