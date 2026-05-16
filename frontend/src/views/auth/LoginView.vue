<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-100 p-4">
    <div class="w-full max-w-md">
      <!-- Card -->
      <div class="card">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span class="text-white font-bold text-xl">TF</span>
          </div>
          <h2 class="text-2xl font-bold text-gray-900">Welcome back</h2>
          <p class="text-gray-500 mt-1">Sign in to your TaskFlow account</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              v-model="form.email"
              type="email"
              class="input-field"
              placeholder="you@example.com"
              required
              autocomplete="email"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div class="relative">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="input-field pr-10"
                placeholder="Enter your password"
                required
                autocomplete="current-password"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <AppIcon :name="showPassword ? 'eye-off' : 'eye'" size="sm" />
              </button>
            </div>
          </div>

          <!-- Error -->
          <div v-if="authStore.error"
            class="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-200">
            {{ authStore.error }}
          </div>

          <button
            type="submit"
            class="btn-primary w-full py-2.5"
            :disabled="authStore.isLoading"
          >
            <span v-if="authStore.isLoading" class="flex items-center justify-center gap-2">
              <AppSpinner size="sm" color="white" /> Signing in...
            </span>
            <span v-else>Sign In</span>
          </button>
        </form>

        <p class="text-center text-sm text-gray-500 mt-6">
          Don't have an account?
          <RouterLink to="/register" class="text-primary-600 font-medium hover:underline">
            Sign up
          </RouterLink>
        </p>
      </div>

      <!-- Demo credentials -->
      <div class="mt-4 card bg-blue-50 border-blue-200 text-sm text-blue-700">
        <p class="font-medium mb-1">Demo credentials:</p>
        <p class="flex items-center gap-1.5">
          <AppIcon name="user" size="sm" /> john@taskflow.com / User@1234
        </p>
        <p class="flex items-center gap-1.5">
          <AppIcon name="key" size="sm" /> admin@taskflow.com / Admin@123
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useAuthStore } from '../../stores/auth.store'
import AppSpinner from '../../components/common/AppSpinner.vue'
import AppIcon from '../../components/common/AppIcon.vue'

const authStore = useAuthStore()

const form = reactive({ email: '', password: '' })
const showPassword = ref(false)

const handleLogin = async () => {
  await authStore.login(form)
}
</script>