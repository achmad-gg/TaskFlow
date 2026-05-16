<template>
  <div class="space-y-6">

    <!-- Platform Stats -->
    <div v-if="stats" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="card text-center">
        <p class="text-3xl font-bold text-primary-600">{{ stats.users.total }}</p>
        <p class="text-sm text-gray-500 mt-1">Total Users</p>
      </div>
      <div class="card text-center">
        <p class="text-3xl font-bold text-green-600">{{ stats.users.active }}</p>
        <p class="text-sm text-gray-500 mt-1">Active Users</p>
      </div>
      <div class="card text-center">
        <p class="text-3xl font-bold text-blue-600">{{ stats.tasks.total }}</p>
        <p class="text-sm text-gray-500 mt-1">Total Tasks</p>
      </div>
      <div class="card text-center">
        <p class="text-3xl font-bold text-purple-600">{{ stats.thisWeek.newUsers }}</p>
        <p class="text-sm text-gray-500 mt-1">New This Week</p>
      </div>
    </div>

    <!-- User Management Table -->
    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-900">User Management</h2>
        <div class="relative">
          <span class="absolute left-3 top-2.5 text-gray-400">
            <AppIcon name="search" size="xs" />
          </span>
          <input v-model="search" @input="handleSearch" type="text"
            placeholder="Search users..." class="input-field w-48 text-sm pl-8" />
        </div>
      </div>

      <div v-if="loading" class="flex justify-center py-10">
        <AppSpinner size="lg" />
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="text-left py-3 px-2 text-gray-500 font-medium">User</th>
              <th class="text-left py-3 px-2 text-gray-500 font-medium">Role</th>
              <th class="text-left py-3 px-2 text-gray-500 font-medium">Tasks</th>
              <th class="text-left py-3 px-2 text-gray-500 font-medium">Status</th>
              <th class="text-left py-3 px-2 text-gray-500 font-medium">Joined</th>
              <th class="text-left py-3 px-2 text-gray-500 font-medium">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="user in users" :key="user.id"
              class="hover:bg-gray-50 transition-colors">
              <td class="py-3 px-2">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-full bg-primary-500 flex items-center
                    justify-center text-white text-xs font-bold shrink-0">
                    {{ user.username.slice(0, 2).toUpperCase() }}
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ user.username }}</p>
                    <p class="text-xs text-gray-400">{{ user.email }}</p>
                  </div>
                </div>
              </td>
              <td class="py-3 px-2">
                <AppBadge :variant="user.role === 'ADMIN' ? 'purple' : 'blue'">
                  {{ user.role }}
                </AppBadge>
              </td>
              <td class="py-3 px-2 text-gray-600">{{ user._count.tasks }}</td>
              <td class="py-3 px-2">
                <AppBadge :variant="user.isActive ? 'green' : 'red'">
                  {{ user.isActive ? 'Active' : 'Inactive' }}
                </AppBadge>
              </td>
              <td class="py-3 px-2 text-gray-500">
                {{ new Date(user.createdAt).toLocaleDateString() }}
              </td>
              <td class="py-3 px-2">
                <button
                  v-if="user.id !== authStore.user?.id"
                  @click="confirmToggle(user)"
                  :class="['text-xs font-medium px-3 py-1 rounded-lg transition-colors cursor-pointer',
                    user.isActive
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  ]"
                >
                  {{ user.isActive ? 'Deactivate' : 'Activate' }}
                </button>
                <span v-else class="text-xs text-gray-400">You</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination && pagination.totalPages > 1"
        class="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
        <p class="text-sm text-gray-500">
          {{ pagination.total }} users total
        </p>
        <div class="flex gap-2">
          <button :disabled="!pagination.hasPreviousPage"
            @click="changePage(currentPage - 1)"
            class="btn-secondary text-sm disabled:opacity-40 flex items-center gap-1">
            <AppIcon name="arrow-left" size="xs" /> Prev
          </button>
          <button :disabled="!pagination.hasNextPage"
            @click="changePage(currentPage + 1)"
            class="btn-secondary text-sm disabled:opacity-40 flex items-center gap-1">
            Next <AppIcon name="arrow-right" size="xs" />
          </button>
        </div>
      </div>
    </div>

    <!-- Toggle User Confirmation -->
    <ConfirmModal
      :visible="showToggleConfirm"
      :variant="toggleTarget?.isActive ? 'danger' : 'warning'"
      :title="toggleTarget?.isActive ? 'Deactivate User' : 'Activate User'"
      :message="toggleMessage"
      :confirmText="toggleTarget?.isActive ? 'Deactivate' : 'Activate'"
      :loading="toggleLoading"
      @confirm="handleToggleUser"
      @cancel="showToggleConfirm = false"
    />

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'
import { adminApi } from '@/api/admin.api'
import AppSpinner from '@/components/common/AppSpinner.vue'
import AppBadge from '@/components/common/AppBadge.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'

const authStore = useAuthStore()
const uiStore = useUiStore()

const stats = ref(null)
const users = ref([])
const pagination = ref(null)
const loading = ref(false)
const search = ref('')
const currentPage = ref(1)
let searchTimeout = null

// Toggle confirmation state
const showToggleConfirm = ref(false)
const toggleTarget = ref(null)
const toggleLoading = ref(false)

const toggleMessage = computed(() => {
  if (!toggleTarget.value) return ''
  return toggleTarget.value.isActive
    ? `${toggleTarget.value.username} will be unable to log in and all their sessions will be invalidated.`
    : `${toggleTarget.value.username} will regain access to their account.`
})

const fetchStats = async () => {
  const { data } = await adminApi.getStats()
  stats.value = data.data
}

const fetchUsers = async () => {
  loading.value = true
  try {
    const { data } = await adminApi.getUsers({
      page: currentPage.value,
      search: search.value,
    })
    users.value = data.data
    pagination.value = data.pagination
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchUsers()
  }, 400)
}

const confirmToggle = (user) => {
  toggleTarget.value = user
  showToggleConfirm.value = true
}

const handleToggleUser = async () => {
  toggleLoading.value = true
  try {
    const { data } = await adminApi.toggleUser(toggleTarget.value.id)
    toggleTarget.value.isActive = data.data.isActive
    uiStore.toast.success(
      `${toggleTarget.value.username} has been ${data.data.isActive ? 'activated' : 'deactivated'}`
    )
    await fetchStats()
  } catch (err) {
    uiStore.toast.error(err.response?.data?.message || 'Action failed')
  } finally {
    toggleLoading.value = false
    showToggleConfirm.value = false
  }
}

const changePage = (page) => {
  currentPage.value = page
  fetchUsers()
}

onMounted(async () => {
  await Promise.all([fetchStats(), fetchUsers()])
})
</script>