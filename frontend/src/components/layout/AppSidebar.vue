<template>
  <aside :class="[
    'flex flex-col bg-gray-900 text-white transition-all duration-300',
    uiStore.sidebarOpen ? 'w-64' : 'w-16'
  ]">
    <!-- Logo -->
    <div class="flex items-center gap-3 px-4 py-5 border-b border-gray-700">
      <div class="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center shrink-0">
        <span class="text-white font-bold text-sm">TF</span>
      </div>
      <span v-if="uiStore.sidebarOpen" class="font-bold text-lg tracking-tight">
        TaskFlow
      </span>
    </div>

    <!-- Nav Links -->
    <nav class="flex-1 px-2 py-4 space-y-1">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        :class="[
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
          isActive(item.to)
            ? 'bg-primary-600 text-white'
            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
        ]"
      >
        <AppIcon :name="item.icon" size="sm" class="shrink-0" />
        <span v-if="uiStore.sidebarOpen">{{ item.label }}</span>
      </RouterLink>
    </nav>

    <!-- User Info -->
    <div class="border-t border-gray-700 p-3">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center shrink-0 text-sm font-bold">
          {{ authStore.userInitials }}
        </div>
        <div v-if="uiStore.sidebarOpen" class="flex-1 min-w-0">
          <p class="text-sm font-medium truncate">{{ authStore.user?.username }}</p>
          <p class="text-xs text-gray-400 truncate">{{ authStore.user?.role }}</p>
        </div>
        <button
          v-if="uiStore.sidebarOpen"
          @click="authStore.logout()"
          class="text-gray-400 hover:text-white transition-colors"
          title="Logout"
        >
          <AppIcon name="logout" size="sm" />
        </button>
      </div>
    </div>
  </aside>
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

const navItems = computed(() => {
  const items = [
    { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { to: '/tasks',     icon: 'tasks',     label: 'Tasks' },
    { to: '/profile',   icon: 'profile',   label: 'Profile' },
  ]
  if (authStore.isAdmin) {
    items.push({ to: '/admin', icon: 'admin', label: 'Admin' })
  }
  return items
})

const isActive = (path) => route.path.startsWith(path)
</script>