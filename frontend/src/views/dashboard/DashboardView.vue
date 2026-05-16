<template>
  <div class="space-y-6">
    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="stat in statCards" :key="stat.label" class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 font-medium">{{ stat.label }}</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">
              <AppSpinner v-if="taskStore.isLoading" size="sm" color="gray" />
              <span v-else>{{ stat.value }}</span>
            </p>
          </div>
          <div :class="['w-10 h-10 rounded-lg flex items-center justify-center', stat.bg]">
            <AppIcon :name="stat.icon" size="lg" :class="stat.iconColor" />
          </div>
        </div>
      </div>
    </div>

    <!-- Charts + Recent Activity -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Task Status Breakdown -->
      <div class="card lg:col-span-2">
        <h3 class="font-semibold text-gray-900 mb-4">Tasks by Status</h3>
        <div class="space-y-3">
          <div v-for="item in statusBreakdown" :key="item.label">
            <div class="flex justify-between text-sm mb-1">
              <span class="text-gray-600 flex items-center gap-2">
                <AppBadge :variant="item.variant">{{ item.label }}</AppBadge>
              </span>
              <span class="font-medium">{{ item.count }}</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2">
              <div
                :class="['h-2 rounded-full transition-all duration-700', item.color]"
                :style="{ width: totalTasks ? `${(item.count / totalTasks) * 100}%` : '0%' }"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Priority Breakdown -->
      <div class="card">
        <h3 class="font-semibold text-gray-900 mb-4">By Priority</h3>
        <div class="space-y-3">
          <div v-for="item in priorityBreakdown" :key="item.label"
            class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div :class="['w-3 h-3 rounded-full', item.dot]" />
              <span class="text-sm text-gray-600">{{ item.label }}</span>
            </div>
            <span class="text-sm font-semibold text-gray-900">{{ item.count }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Tasks -->
    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-gray-900">Recent Tasks</h3>
        <RouterLink to="/tasks" class="text-sm text-primary-600 hover:underline font-medium flex items-center gap-1">
          View all <AppIcon name="arrow-right" size="sm" />
        </RouterLink>
      </div>

      <div v-if="taskStore.isLoading" class="flex justify-center py-8">
        <AppSpinner size="lg" />
      </div>

      <div v-else-if="recentTasks.length === 0" class="text-center py-8 text-gray-500">
        No tasks yet. <RouterLink to="/tasks" class="text-primary-600">Create one</RouterLink>
      </div>

      <div v-else class="space-y-2">
        <div v-for="task in recentTasks" :key="task.id"
          class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
          <div :class="['w-2 h-2 rounded-full shrink-0', priorityDot(task.priority)]" />
          <span class="flex-1 text-sm font-medium text-gray-900 truncate">{{ task.title }}</span>
          <AppBadge :variant="statusVariant(task.status)" class="shrink-0">
            {{ task.status.replace('_', ' ') }}
          </AppBadge>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useTaskStore } from '@/stores/task.store'
import AppSpinner from '@/components/common/AppSpinner.vue'
import AppBadge from '@/components/common/AppBadge.vue'
import AppIcon from '@/components/common/AppIcon.vue'

const taskStore = useTaskStore()

onMounted(async () => {
  await Promise.all([taskStore.fetchTasks(), taskStore.fetchStats()])
})

const s = computed(() => taskStore.stats || {})
const totalTasks = computed(() => s.value.total || 0)

const statCards = computed(() => [
  { label: 'Total Tasks',   value: s.value.total || 0,      icon: 'clipboard',  bg: 'bg-blue-50',   iconColor: 'text-blue-500' },
  { label: 'In Progress',   value: s.value.inProgress || 0, icon: 'refresh',    bg: 'bg-yellow-50', iconColor: 'text-yellow-500' },
  { label: 'Completed',     value: s.value.done || 0,       icon: 'check',      bg: 'bg-green-50',  iconColor: 'text-green-500' },
  { label: 'Urgent Tasks',  value: s.value.urgent || 0,     icon: 'fire',       bg: 'bg-red-50',    iconColor: 'text-red-500' },
])

const statusBreakdown = computed(() => [
  { label: 'To Do',       count: s.value.todo || 0,       color: 'bg-gray-400',   variant: 'gray' },
  { label: 'In Progress', count: s.value.inProgress || 0, color: 'bg-yellow-400', variant: 'yellow' },
  { label: 'Done',        count: s.value.done || 0,       color: 'bg-green-500',  variant: 'green' },
  { label: 'Cancelled',   count: s.value.cancelled || 0,  color: 'bg-red-400',    variant: 'red' },
])

const priorityBreakdown = computed(() => [
  { label: 'Urgent', count: s.value.urgent || 0, dot: 'bg-red-500' },
  { label: 'High',   count: s.value.high || 0,   dot: 'bg-orange-500' },
  { label: 'Medium', count: s.value.medium || 0, dot: 'bg-yellow-500' },
  { label: 'Low',    count: s.value.low || 0,    dot: 'bg-gray-400' },
])

const recentTasks = computed(() => taskStore.tasks.slice(0, 6))

const priorityDot = (p) => ({
  URGENT: 'bg-red-500', HIGH: 'bg-orange-400',
  MEDIUM: 'bg-yellow-400', LOW: 'bg-gray-300',
}[p])

const statusVariant = (s) => ({
  TODO: 'gray', IN_PROGRESS: 'yellow', DONE: 'green', CANCELLED: 'red',
}[s])
</script>