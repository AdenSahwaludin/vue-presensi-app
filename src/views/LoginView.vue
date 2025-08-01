<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Login Sistem Presensi
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Masukkan email dan password untuk melanjutkan
        </p>
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-md p-4">
        <p class="text-sm text-red-600">{{ errorMessage }}</p>
      </div>

      <!-- Success Message -->
      <div v-if="successMessage" class="bg-green-50 border border-green-200 rounded-md p-4">
        <p class="text-sm text-green-600">{{ successMessage }}</p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email" class="sr-only">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              v-model="form.email"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
            />
          </div>
          <div>
            <label for="password" class="sr-only">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              v-model="form.password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="Password"
            />
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              v-model="form.remember"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label for="remember-me" class="ml-2 block text-sm text-gray-900"> Remember me </label>
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="isLoading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <Lock class="h-5 w-5 text-primary-500 group-hover:text-primary-400" />
            </span>
            {{ isLoading ? 'Signing in...' : 'Sign in' }}
          </button>
        </div>

        <!-- Toggle between Login and Register -->
        <div class="text-center">
          <button
            type="button"
            @click="toggleMode"
            class="text-sm text-primary-600 hover:text-primary-500"
          >
            {{ isLoginMode ? 'Need an account? Register' : 'Already have an account? Login' }}
          </button>
        </div>
      </form>

      <!-- Registration Form -->
      <form v-if="!isLoginMode" class="mt-6 space-y-4" @submit.prevent="handleRegister">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            id="name"
            name="name"
            type="text"
            v-model="registerForm.name"
            required
            class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Your full name"
          />
        </div>

        <div>
          <label for="register-email" class="block text-sm font-medium text-gray-700">Email</label>
          <input
            id="register-email"
            name="register-email"
            type="email"
            v-model="registerForm.email"
            required
            class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Email address"
          />
        </div>

        <div>
          <label for="register-password" class="block text-sm font-medium text-gray-700">Password</label>
          <input
            id="register-password"
            name="register-password"
            type="password"
            v-model="registerForm.password"
            required
            minlength="6"
            class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Password (min. 6 characters)"
          />
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
        >
          {{ isLoading ? 'Creating account...' : 'Create Account' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Lock } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const isLoginMode = ref(true)
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const form = ref({
  email: '',
  password: '',
  remember: false,
})

const registerForm = ref({
  name: '',
  email: '',
  password: '',
})

onMounted(async () => {
  // Initialize auth store and check if user is already logged in
  await authStore.initialize()
  
  if (authStore.isLoggedIn) {
    router.push('/dashboard')
  }
})

function clearMessages() {
  errorMessage.value = ''
  successMessage.value = ''
}

function toggleMode() {
  isLoginMode.value = !isLoginMode.value
  clearMessages()
  
  // Clear forms
  form.value = { email: '', password: '', remember: false }
  registerForm.value = { name: '', email: '', password: '' }
}

async function handleLogin() {
  if (!form.value.email || !form.value.password) {
    errorMessage.value = 'Please fill in all fields'
    return
  }

  isLoading.value = true
  clearMessages()

  try {
    const result = await authStore.login(form.value.email, form.value.password)
    
    if (result.success) {
      successMessage.value = 'Login successful! Redirecting...'
      setTimeout(() => {
        router.push('/dashboard')
      }, 1000)
    } else {
      errorMessage.value = result.error || 'Login failed'
    }
  } catch (error: any) {
    errorMessage.value = error.message || 'An unexpected error occurred'
  } finally {
    isLoading.value = false
  }
}

async function handleRegister() {
  if (!registerForm.value.name || !registerForm.value.email || !registerForm.value.password) {
    errorMessage.value = 'Please fill in all fields'
    return
  }

  if (registerForm.value.password.length < 6) {
    errorMessage.value = 'Password must be at least 6 characters long'
    return
  }

  isLoading.value = true
  clearMessages()

  try {
    const result = await authStore.register(
      registerForm.value.email,
      registerForm.value.password,
      registerForm.value.name
    )
    
    if (result.success) {
      if (result.needsConfirmation) {
        successMessage.value = result.message || 'Registration successful! Please check your email to confirm your account.'
      } else {
        successMessage.value = 'Registration successful!'
        // Auto login after successful registration
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)
        return
      }
      
      // Switch back to login mode after email confirmation required
      setTimeout(() => {
        toggleMode()
        form.value.email = registerForm.value.email
      }, 3000)
    } else {
      errorMessage.value = result.error || 'Registration failed'
    }
  } catch (error: any) {
    errorMessage.value = error.message || 'An unexpected error occurred'
  } finally {
    isLoading.value = false
  }
}
</script>
