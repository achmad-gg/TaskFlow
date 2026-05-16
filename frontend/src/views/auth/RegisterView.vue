<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-100 p-4">
    <div class="w-full max-w-md">
      <div class="card">
        <div class="text-center mb-8">
          <div class="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span class="text-white font-bold text-xl">TF</span>
          </div>
          <h2 class="text-2xl font-bold text-gray-900">Create account</h2>
          <p class="text-gray-500 mt-1">Start managing tasks today</p>
        </div>

        <form @submit.prevent="handleRegister" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input v-model="form.username" type="text" class="input-field"
              placeholder="johndoe" required />
            <p v-if="errors.username" class="text-red-500 text-xs mt-1">{{ errors.username }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input v-model="form.email" type="email" class="input-field"
              placeholder="you@example.com" required />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input v-model="form.password" type="password" class="input-field"
              placeholder="Min 8 chars, 1 uppercase, 1 number" required />
            <p v-if="errors.password" class="text-red-500 text-xs mt-1">{{ errors.password }}</p>
          </div>

          <div v-if="authStore.error"
            class="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-200">
            {{ authStore.error }}
          </div>

          <button type="submit" class="btn-primary w-full py-2.5" :disabled="authStore.isLoading">
            <span v-if="authStore.isLoading" class="flex items-center justify-center gap-2">
              <AppSpinner size="sm" color="white" /> Creating account...
            </span>
            <span v-else>Create Account</span>
          </button>
        </form>

        <p class="text-center text-sm text-gray-500 mt-6">
          Already have an account?
          <RouterLink to="/login" class="text-primary-600 font-medium hover:underline">Sign in</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import AppSpinner from '@/components/common/AppSpinner.vue'

const authStore = useAuthStore()
const form = reactive({ username: '', email: '', password: '' })
const errors = ref({})

const validate = () => {
  errors.value = {}
  if (form.username.length < 3) errors.value.username = 'Min 3 characters'
  if (!/[A-Z]/.test(form.password)) errors.value.password = 'Need at least 1 uppercase letter'
  if (!/[0-9]/.test(form.password)) errors.value.password = 'Need at least 1 number'
  if (form.password.length < 8) errors.value.password = 'Min 8 characters'
  return Object.keys(errors.value).length === 0
}

const handleRegister = async () => {
  if (!validate()) return
  await authStore.register(form)
}
</script>