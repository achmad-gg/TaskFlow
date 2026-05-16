<template>
  <header class="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
    <div class="flex items-center gap-4">
      <!-- Sidebar toggle -->
      <button
        @click="uiStore.sidebarOpen = !uiStore.sidebarOpen"
        class="text-gray-500 hover:text-gray-700 transition-colors"
      >
        <AppIcon name="menu" size="md" />
      </button>
      <!-- Page title -->
      <h1 class="text-lg font-semibold text-gray-900">{{ pageTitle }}</h1>
    </div>

    <div class="flex items-center gap-3">
      <span class="text-sm text-gray-500">
        {{ greeting }}, <span class="font-medium text-gray-900">{{ authStore.user?.username }}</span>
      </span>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'
import AppIcon from '@/components/common/AppIcon.vue'

const authStore = useAuthStore()
const uiStore = useUiStore()
const route = useRoute()

const pageTitle = computed(() => ({
  '/dashboard': 'Dashboard',
  '/tasks': 'My Tasks',
  '/profile': 'Profile',
  '/admin': 'Admin Panel',
}[route.path] || 'TaskFlow'))

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
})
</script>