<template>
  <div class="max-w-2xl mx-auto space-y-6">

    <!-- Profile Info Card -->
    <div class="card">
      <h2 class="text-lg font-semibold text-gray-900 mb-6">Profile Information</h2>

      <form @submit.prevent="handleUpdateProfile" class="space-y-4">
        <!-- Avatar placeholder -->
        <div class="flex items-center gap-4 mb-6">
          <div class="w-16 h-16 rounded-full bg-primary-500 flex items-center
            justify-center text-white text-2xl font-bold">
            {{ authStore.userInitials }}
          </div>
          <div>
            <p class="font-medium text-gray-900">{{ authStore.user?.username }}</p>
            <p class="text-sm text-gray-500">{{ authStore.user?.email }}</p>
            <AppBadge :variant="authStore.isAdmin ? 'purple' : 'blue'" class="mt-1">
              {{ authStore.user?.role }}
            </AppBadge>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input v-model="profileForm.username" type="text" class="input-field"
            placeholder="johndoe" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Bio</label>
          <textarea v-model="profileForm.bio" class="input-field resize-none" rows="3"
            placeholder="Tell us about yourself..." maxlength="300" />
          <p class="text-xs text-gray-400 mt-1">{{ profileForm.bio?.length || 0 }}/300</p>
        </div>

        <div v-if="profileSuccess"
          class="bg-green-50 text-green-700 text-sm p-3 rounded-lg border border-green-200 flex items-center gap-2">
          <AppIcon name="check-circle" size="sm" /> Profile updated successfully
        </div>

        <div v-if="profileError"
          class="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-200">
          {{ profileError }}
        </div>

        <div class="flex justify-end">
          <button type="submit" class="btn-primary" :disabled="profileLoading">
            <span v-if="profileLoading" class="flex items-center gap-2">
              <AppSpinner size="sm" color="white" /> Saving...
            </span>
            <span v-else>Save Changes</span>
          </button>
        </div>
      </form>
    </div>

    <!-- Stats Card -->
    <div class="card">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Account Stats</h2>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div v-for="stat in accountStats" :key="stat.label"
          class="text-center p-3 bg-gray-50 rounded-lg">
          <p class="text-2xl font-bold text-gray-900">{{ stat.value }}</p>
          <p class="text-xs text-gray-500 mt-1">{{ stat.label }}</p>
        </div>
      </div>
    </div>

    <!-- Change Password Card -->
    <div class="card">
      <h2 class="text-lg font-semibold text-gray-900 mb-6">Change Password</h2>

      <form @submit.prevent="handleChangePassword" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
          <input v-model="passwordForm.currentPassword" type="password"
            class="input-field" placeholder="Enter current password" required />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <input v-model="passwordForm.newPassword" type="password"
            class="input-field" placeholder="Min 8 chars, 1 uppercase, 1 number" required />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
          <input v-model="passwordForm.confirmPassword" type="password"
            class="input-field" placeholder="Re-enter new password" required />
        </div>

        <div v-if="passwordError"
          class="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-200">
          {{ passwordError }}
        </div>

        <div v-if="passwordSuccess"
          class="bg-green-50 text-green-700 text-sm p-3 rounded-lg border border-green-200 flex items-center gap-2">
          <AppIcon name="check-circle" size="sm" /> Password changed. All other sessions have been logged out.
        </div>

        <div class="flex justify-end">
          <button type="submit" class="btn-primary" :disabled="passwordLoading">
            <span v-if="passwordLoading" class="flex items-center gap-2">
              <AppSpinner size="sm" color="white" /> Updating...
            </span>
            <span v-else>Change Password</span>
          </button>
        </div>
      </form>
    </div>

    <!-- Recent Activity Card -->
    <div class="card">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>

      <div v-if="activityLoading" class="flex justify-center py-6">
        <AppSpinner />
      </div>

      <div v-else-if="activities.length === 0"
        class="text-center py-6 text-gray-500 text-sm">
        No activity yet
      </div>

      <div v-else class="space-y-2">
        <div v-for="item in activities" :key="item.id"
          class="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
          <AppIcon :name="activityIcon(item.type)" size="md" class="shrink-0 mt-0.5 text-gray-500" />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900">
              {{ activityLabel(item.type, item.metadata) }}
            </p>
            <p class="text-xs text-gray-400 mt-0.5">{{ timeAgo(item.createdAt) }}</p>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useTaskStore } from '@/stores/task.store'
import { userApi } from '@/api/user.api'
import AppSpinner from '@/components/common/AppSpinner.vue'
import AppBadge from '@/components/common/AppBadge.vue'
import AppIcon from '@/components/common/AppIcon.vue'

const authStore = useAuthStore()
const taskStore = useTaskStore()

// ── Profile ──────────────────────────────────────────────────────────────────
const profileForm = reactive({
  username: authStore.user?.username || '',
  bio: authStore.user?.bio || '',
})
const profileLoading = ref(false)
const profileError = ref('')
const profileSuccess = ref(false)

const handleUpdateProfile = async () => {
  profileLoading.value = true
  profileError.value = ''
  profileSuccess.value = false
  try {
    const { data } = await userApi.updateProfile(profileForm)
    authStore.user = { ...authStore.user, ...data.data }
    profileSuccess.value = true
    setTimeout(() => profileSuccess.value = false, 3000)
  } catch (err) {
    profileError.value = err.response?.data?.message || 'Update failed'
  } finally {
    profileLoading.value = false
  }
}

// ── Password ──────────────────────────────────────────────────────────────────
const passwordForm = reactive({
  currentPassword: '', newPassword: '', confirmPassword: '',
})
const passwordLoading = ref(false)
const passwordError = ref('')
const passwordSuccess = ref(false)

const handleChangePassword = async () => {
  passwordError.value = ''
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordError.value = 'Passwords do not match'
    return
  }
  passwordLoading.value = true
  passwordSuccess.value = false
  try {
    await userApi.changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    })
    passwordSuccess.value = true
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (err) {
    passwordError.value = err.response?.data?.message || 'Failed to change password'
  } finally {
    passwordLoading.value = false
  }
}

// ── Stats ─────────────────────────────────────────────────────────────────────
const accountStats = computed(() => {
  const s = taskStore.stats || {}
  return [
    { label: 'Total Tasks',  value: s.total || 0 },
    { label: 'Completed',    value: s.done || 0 },
    { label: 'In Progress',  value: s.inProgress || 0 },
    { label: 'This Week',    value: s.completedThisWeek || 0 },
  ]
})

// ── Activity ──────────────────────────────────────────────────────────────────
const activities = ref([])
const activityLoading = ref(false)

const fetchActivity = async () => {
  activityLoading.value = true
  try {
    const { data } = await userApi.getActivity()
    activities.value = data.data
  } finally {
    activityLoading.value = false
  }
}

const activityIcon = (type) => ({
  TASK_CREATED:   'check',
  TASK_UPDATED:   'edit',
  TASK_DELETED:   'delete',
  STATUS_CHANGED: 'refresh',
  USER_LOGGED_IN: 'lock',
  USER_REGISTERED:'party',
}[type] || 'pin')

const activityLabel = (type, meta) => ({
  TASK_CREATED:   `Created task: "${meta?.title || ''}"`,
  TASK_UPDATED:   `Updated task: "${meta?.title || ''}"`,
  TASK_DELETED:   'Deleted a task',
  STATUS_CHANGED: `Changed status from ${meta?.from} → ${meta?.to}`,
  USER_LOGGED_IN: 'Logged in',
  USER_REGISTERED:'Registered account',
}[type] || 'Activity')

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)   return 'Just now'
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

onMounted(async () => {
  await Promise.all([taskStore.fetchStats(), fetchActivity()])
})
</script>