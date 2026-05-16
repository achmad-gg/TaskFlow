<template>
  <div class="card hover:shadow-md transition-shadow p-4">
    <div class="flex items-start gap-3">
      <!-- Priority indicator -->
      <div :class="['w-1 h-full min-h-[40px] rounded-full shrink-0 self-stretch', priorityBar]" />

      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-2">
          <h4 class="font-medium text-gray-900 truncate">{{ task.title }}</h4>
          <div class="flex gap-1 shrink-0">
            <button @click="$emit('edit', task)"
              class="text-gray-400 hover:text-primary-600 transition-colors p-1">
              <AppIcon name="edit" size="sm" />
            </button>
            <button @click="$emit('delete', task.id)"
              class="text-gray-400 hover:text-red-600 transition-colors p-1">
              <AppIcon name="delete" size="sm" />
            </button>
          </div>
        </div>

        <p v-if="task.description"
          class="text-sm text-gray-500 mt-1 line-clamp-2">{{ task.description }}</p>

        <div class="flex flex-wrap items-center gap-2 mt-3">
          <!-- Status Dropdown -->
          <select
            :value="task.status"
            @change="$emit('status-change', task.id, $event.target.value)"
            :class="['badge cursor-pointer border-0 pr-1', statusClass]"
          >
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <AppBadge :variant="priorityVariant">{{ task.priority }}</AppBadge>

          <!-- Tags -->
          <AppBadge v-for="tag in task.tags.slice(0, 3)" :key="tag" variant="blue">
            {{ tag }}
          </AppBadge>

          <!-- Due date -->
          <span v-if="task.dueDate" :class="['text-xs flex items-center gap-1', isOverdue ? 'text-red-500 font-medium' : 'text-gray-400']">
            <AppIcon name="calendar" size="xs" />
            {{ formatDate(task.dueDate) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import AppBadge from '@/components/common/AppBadge.vue'
import AppIcon from '@/components/common/AppIcon.vue'

const props = defineProps({
  task: { type: Object, required: true },
})

defineEmits(['edit', 'delete', 'status-change'])

const priorityBar = computed(() => ({
  URGENT: 'bg-red-500', HIGH: 'bg-orange-400',
  MEDIUM: 'bg-yellow-400', LOW: 'bg-gray-300',
}[props.task.priority]))

const priorityVariant = computed(() => ({
  URGENT: 'red', HIGH: 'orange', MEDIUM: 'yellow', LOW: 'gray',
}[props.task.priority]))

const statusClass = computed(() => ({
  TODO: 'bg-gray-100 text-gray-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  DONE: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
}[props.task.status]))

const isOverdue = computed(() =>
  props.task.dueDate && new Date(props.task.dueDate) < new Date() && props.task.status !== 'DONE'
)

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
</script>