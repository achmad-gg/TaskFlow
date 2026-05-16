<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      <TransitionGroup name="toast">
        <div
          v-for="toast in uiStore.toasts"
          :key="toast.id"
          :class="['flex items-start gap-3 p-4 rounded-xl shadow-lg border text-sm font-medium cursor-pointer', toastClass(toast.type)]"
          @click="uiStore.removeToast(toast.id)"
        >
          <AppIcon :name="toastIcon(toast.type)" size="md" class="shrink-0 mt-0.5" />
          <span class="flex-1">{{ toast.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useUiStore } from '../../stores/ui.store'
import AppIcon from './AppIcon.vue'

const uiStore = useUiStore()

const toastClass = (type) => ({
  success: 'bg-green-50 text-green-800 border-green-200',
  error:   'bg-red-50 text-red-800 border-red-200',
  warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  info:    'bg-blue-50 text-blue-800 border-blue-200',
}[type])

const toastIcon = (type) => ({
  success: 'check-circle',
  error:   'x-circle',
  warning: 'alert-triangle',
  info:    'info',
}[type])
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from { opacity: 0; transform: translateX(100%); }
.toast-leave-to   { opacity: 0; transform: translateX(100%); }
</style>