import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { taskApi } from '@/api/task.api'

export const useTaskStore = defineStore('tasks', () => {
  // State
  const tasks = ref([])
  const stats = ref(null)
  const pagination = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  const filters = ref({
    search: '',
    status: '',
    priority: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 10,
  })

  // Getters
  const tasksByStatus = computed(() => {
    return {
      TODO: tasks.value.filter(t => t.status === 'TODO'),
      IN_PROGRESS: tasks.value.filter(t => t.status === 'IN_PROGRESS'),
      DONE: tasks.value.filter(t => t.status === 'DONE'),
      CANCELLED: tasks.value.filter(t => t.status === 'CANCELLED'),
    }
  })

  // Actions
  const fetchTasks = async () => {
    isLoading.value = true
    error.value = null
    try {
      // Strip empty strings so we don't send ?status=&priority= to the API
      const params = Object.fromEntries(
        Object.entries(filters.value).filter(([, v]) => v !== '')
      )
      const { data } = await taskApi.getAll(params)
      tasks.value = data.data
      pagination.value = data.pagination
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch tasks'
    } finally {
      isLoading.value = false
    }
  }

  const fetchStats = async () => {
    try {
      const { data } = await taskApi.getStats()
      stats.value = data.data
    } catch (err) {
      console.error('Failed to fetch stats', err)
    }
  }

  const createTask = async (taskData) => {
    try {
      const { data } = await taskApi.create(taskData)
      tasks.value.unshift(data.data)
      await fetchStats()
      return { success: true, task: data.data }
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Failed to create task',
      }
    }
  }

  const updateTask = async (id, taskData) => {
    try {
      const { data } = await taskApi.update(id, taskData)
      const index = tasks.value.findIndex(t => t.id === id)
      if (index !== -1) tasks.value[index] = data.data
      await fetchStats()
      return { success: true, task: data.data }
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Failed to update task',
      }
    }
  }

  const deleteTask = async (id) => {
    try {
      await taskApi.delete(id)
      tasks.value = tasks.value.filter(t => t.id !== id)
      await fetchStats()
      return { success: true }
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Failed to delete task',
      }
    }
  }

  const setFilter = (key, value) => {
    filters.value[key] = value
    filters.value.page = 1 // Reset to page 1 on filter change
    fetchTasks()
  }

  const resetFilters = () => {
    filters.value = {
      search: '', status: '', priority: '',
      sortBy: 'createdAt', sortOrder: 'desc',
      page: 1, limit: 10,
    }
    fetchTasks()
  }

  return {
    tasks, stats, pagination, isLoading, error, filters,
    tasksByStatus,
    fetchTasks, fetchStats, createTask, updateTask, deleteTask,
    setFilter, resetFilters,
  }
})