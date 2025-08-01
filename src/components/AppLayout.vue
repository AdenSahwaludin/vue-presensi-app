<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-semibold text-gray-900">Sistem Presensi</h1>
          </div>

          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-700">
              {{ currentTime }}
            </span>

            <div class="flex items-center space-x-2" v-if="authStore.user">
              <img
                :src="authStore.user.avatar || '/default-avatar.png'"
                :alt="authStore.user.name"
                class="w-8 h-8 rounded-full"
              />
              <span class="text-sm font-medium text-gray-700">
                {{ authStore.user.name }}
              </span>
            </div>

            <button @click="logout" class="btn btn-secondary text-sm" v-if="authStore.isLoggedIn">
              <LogOut class="w-4 h-4 mr-1" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Navigation -->
    <nav class="bg-white shadow-sm" v-if="authStore.isLoggedIn">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex space-x-8">
          <router-link
            to="/dashboard"
            class="border-b-2 border-transparent hover:border-primary-500 px-1 py-4 text-sm font-medium transition-colors"
            :class="{ 'border-primary-500 text-primary-600': $route.name === 'dashboard' }"
          >
            <Home class="w-4 h-4 inline mr-1" />
            Dashboard
          </router-link>

          <router-link
            to="/presensi"
            class="border-b-2 border-transparent hover:border-primary-500 px-1 py-4 text-sm font-medium transition-colors"
            :class="{ 'border-primary-500 text-primary-600': $route.name === 'presensi' }"
          >
            <Clock class="w-4 h-4 inline mr-1" />
            Presensi
          </router-link>

          <router-link
            to="/laporan"
            class="border-b-2 border-transparent hover:border-primary-500 px-1 py-4 text-sm font-medium transition-colors"
            :class="{ 'border-primary-500 text-primary-600': $route.name === 'laporan' }"
            v-if="authStore.isAdmin"
          >
            <FileText class="w-4 h-4 inline mr-1" />
            Laporan
          </router-link>

          <router-link
            to="/test"
            class="border-b-2 border-transparent hover:border-primary-500 px-1 py-4 text-sm font-medium transition-colors text-orange-600"
            :class="{ 'border-orange-500 text-orange-600': $route.name === 'test' }"
            v-if="authStore.isAdmin"
          >
            <FileText class="w-4 h-4 inline mr-1" />
            DB Test
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <p class="text-center text-sm text-gray-500">
          © 2025 Sistem Presensi. All rights reserved.
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Home, Clock, FileText, LogOut } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { format } from 'date-fns'

const router = useRouter()
const authStore = useAuthStore()
const currentTime = ref('')
let timeInterval: NodeJS.Timeout

function updateTime() {
  currentTime.value = format(new Date(), 'dd/MM/yyyy HH:mm:ss')
}

function logout() {
  authStore.logout()
  router.push('/login')
}

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>
