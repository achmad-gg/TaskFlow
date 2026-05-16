<template>
  <div class="space-y-4">
    <!-- Toolbar -->
    <div class="card">
      <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <!-- Search -->
        <div class="relative flex-1 max-w-sm">
          <span class="absolute left-3 top-2.5 text-gray-400">
            <AppIcon name="search" size="sm" />
          </span>
          <input
            v-model="searchQuery"
            @input="handleSearch"
            type="text"
            placeholder="Search tasks..."
            class="input-field pl-9"
          />
        </div>

        <div class="flex gap-2 flex-wrap">
          <!-- Status Filter -->
          <select v-model="selectedStatus" @change="taskStore.setFilter('status', selectedStatus)"
            class="input-field w-auto text-sm">
            <option value="">All Status</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <!-- Priority Filter -->
          <select v-model="selectedPriority" @change="taskStore.setFilter('priority', selectedPriority)"
            class="input-field w-auto text-sm">
            <option value="">All Priority</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <!-- New Task Button -->
          <button @click="openCreateModal" class="btn-primary flex items-center gap-2">
            <AppIcon name="plus" size="sm" /> New Task
          </button>
        </div>
      </div>
    </div>

    <!-- Task List -->
    <div v-if="taskStore.isLoading" class="flex justify-center py-16">
      <AppSpinner size="lg" />
    </div>

    <div v-else-if="taskStore.tasks.length === 0" class="card text-center py-16 text-gray-500">
      <div class="flex justify-center mb-3">
        <AppIcon name="inbox" size="xl" class="text-gray-300" />
      </div>
      <p class="font-medium">No tasks found</p>
      <p class="text-sm mt-1">Try adjusting your filters or create a new task</p>
    </div>

    <div v-else class="space-y-2">
      <TaskCard
        v-for="task in taskStore.tasks"
        :key="task.id"
        :task="task"
        @edit="openEditModal"
        @delete="confirmDelete"
        @status-change="handleStatusChange"
      />
    </div>

    <!-- Pagination -->
    <div v-if="taskStore.pagination && taskStore.pagination.totalPages > 1"
      class="flex justify-center items-center gap-2">
      <button
        :disabled="!taskStore.pagination.hasPreviousPage"
        @click="changePage(taskStore.filters.page - 1)"
        class="btn-secondary text-sm disabled:opacity-40 flex items-center gap-1"
      ><AppIcon name="arrow-left" size="sm" /> Prev</button>

      <span class="text-sm text-gray-600 px-2">
        Page {{ taskStore.pagination.page }} of {{ taskStore.pagination.totalPages }}
      </span>

      <button
        :disabled="!taskStore.pagination.hasNextPage"
        @click="changePage(taskStore.filters.page + 1)"
        class="btn-secondary text-sm disabled:opacity-40 flex items-center gap-1"
      >Next <AppIcon name="arrow-right" size="sm" /></button>
    </div>
  </div>

  <!-- Task Modal -->
  <TaskFormModal
    v-if="showModal"
    :task="editingTask"
    @close="closeModal"
    @saved="handleSaved"
  />

  <!-- Delete Confirmation -->
  <ConfirmModal
    :visible="showDeleteConfirm"
    variant="danger"
    title="Delete Task"
    message="This task will be permanently deleted. This action cannot be undone."
    confirmText="Delete"
    :loading="deleteLoading"
    @confirm="handleDelete"
    @cancel="showDeleteConfirm = false"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTaskStore } from '@/stores/task.store'
import { useUiStore } from '@/stores/ui.store'
import AppSpinner from '@/components/common/AppSpinner.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import TaskCard from '@/components/tasks/TaskCard.vue'
import TaskFormModal from '@/components/tasks/TaskFormModal.vue'

const taskStore = useTaskStore()
const uiStore = useUiStore()

const showModal = ref(false)
const editingTask = ref(null)
const searchQuery = ref('')
const selectedStatus = ref('')
const selectedPriority = ref('')
let searchTimeout = null

// Delete confirmation state
const showDeleteConfirm = ref(false)
const deleteTargetId = ref(null)
const deleteLoading = ref(false)

onMounted(() => taskStore.fetchTasks())

const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    taskStore.setFilter('search', searchQuery.value)
  }, 400)
}

const openCreateModal = () => {
  editingTask.value = null
  showModal.value = true
}

const openEditModal = (task) => {
  editingTask.value = task
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingTask.value = null
}

const handleSaved = () => {
  closeModal()
  taskStore.fetchTasks()
}

const confirmDelete = (id) => {
  deleteTargetId.value = id
  showDeleteConfirm.value = true
}

const handleDelete = async () => {
  deleteLoading.value = true
  const result = await taskStore.deleteTask(deleteTargetId.value)
  deleteLoading.value = false
  showDeleteConfirm.value = false
  if (result.success) uiStore.toast.success('Task deleted')
  else uiStore.toast.error(result.error)
}

const handleStatusChange = async (id, status) => {
  const result = await taskStore.updateTask(id, { status })
  if (result.success) uiStore.toast.success('Status updated')
  else uiStore.toast.error(result.error)
}

const changePage = (page) => {
  taskStore.setFilter('page', page)
}
</script>