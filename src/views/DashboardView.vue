<template>
  <AppLayout>
    <div class="space-y-6">
      <!-- Welcome Header -->
      <div class="bg-white rounded-lg shadow p-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">
          Selamat datang, {{ authStore.user?.name }}!
        </h1>
        <p class="text-gray-600">
          {{ format(new Date(), 'EEEE, dd MMMM yyyy', { locale: id }) }}
        </p>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <Clock class="h-8 w-8 text-green-600" />
            </div>
            <div class="ml-4">
              <dt class="text-sm font-medium text-gray-500 truncate">Status Hari Ini</dt>
              <dd class="text-lg font-medium text-gray-900">
                {{ todayStatus }}
              </dd>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <Calendar class="h-8 w-8 text-blue-600" />
            </div>
            <div class="ml-4">
              <dt class="text-sm font-medium text-gray-500 truncate">Presensi Bulan Ini</dt>
              <dd class="text-lg font-medium text-gray-900">
                {{ monthlyAttendance }}
              </dd>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6" v-if="authStore.isAdmin">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <Users class="h-8 w-8 text-purple-600" />
            </div>
            <div class="ml-4">
              <dt class="text-sm font-medium text-gray-500 truncate">Karyawan Hadir Hari Ini</dt>
              <dd class="text-lg font-medium text-gray-900">
                {{ todayPresentEmployees }}
              </dd>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <TrendingUp class="h-8 w-8 text-yellow-600" />
            </div>
            <div class="ml-4">
              <dt class="text-sm font-medium text-gray-500 truncate">Tingkat Kehadiran</dt>
              <dd class="text-lg font-medium text-gray-900">{{ attendanceRate }}%</dd>
            </div>
          </div>
        </div>
      </div>

      <!-- Today's Activity -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Check In/Out Card -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Presensi Hari Ini</h3>

          <div class="space-y-4">
            <div
              v-if="presensiStore.todayRecord?.check_in_time"
              class="flex items-center justify-between p-3 bg-green-50 rounded-lg"
            >
              <div class="flex items-center">
                <CheckCircle class="w-5 h-5 text-green-600 mr-2" />
                <div>
                  <p class="text-sm font-medium text-green-900">Check In</p>
                  <p class="text-xs text-green-700">
                    {{ presensiStore.todayRecord.check_in_time }}
                  </p>
                </div>
              </div>
              <span class="text-xs text-green-600 bg-green-100 px-2 py-1 rounded"> Completed </span>
            </div>

            <div
              v-if="presensiStore.todayRecord?.check_out_time"
              class="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
            >
              <div class="flex items-center">
                <CheckCircle class="w-5 h-5 text-blue-600 mr-2" />
                <div>
                  <p class="text-sm font-medium text-blue-900">Check Out</p>
                  <p class="text-xs text-blue-700">
                    {{ presensiStore.todayRecord.check_out_time }}
                  </p>
                </div>
              </div>
              <span class="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded"> Completed </span>
            </div>

            <div v-if="!presensiStore.hasCheckedIn" class="text-center py-8">
              <Clock class="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p class="text-sm text-gray-500 mb-4">Belum melakukan check-in hari ini</p>
              <router-link to="/presensi" class="btn btn-primary"> Check In Sekarang </router-link>
            </div>

            <div v-else-if="!presensiStore.hasCheckedOut" class="text-center py-4">
              <p class="text-sm text-gray-500 mb-4">Jangan lupa untuk check-out nanti</p>
              <router-link to="/presensi" class="btn btn-primary"> Check Out </router-link>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Aktivitas Terbaru</h3>

          <div class="space-y-3">
            <div
              v-for="record in recentRecords"
              :key="record.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex items-center">
                <div
                  class="w-2 h-2 rounded-full mr-3"
                  :class="{
                    'bg-green-500': record.status === 'present',
                    'bg-yellow-500': record.status === 'late',
                    'bg-red-500': record.status === 'absent',
                  }"
                ></div>
                <div>
                  <p class="text-sm font-medium text-gray-900">
                    {{ record.date }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ record.check_in_time || 'No check-in' }} -
                    {{ record.check_out_time || 'No check-out' }}
                  </p>
                </div>
              </div>
              <span
                class="text-xs px-2 py-1 rounded"
                :class="{
                  'bg-green-100 text-green-800': record.status === 'present',
                  'bg-yellow-100 text-yellow-800': record.status === 'late',
                  'bg-red-100 text-red-800': record.status === 'absent',
                }"
              >
                {{ record.status }}
              </span>
            </div>

            <div v-if="recentRecords.length === 0" class="text-center py-8">
              <FileText class="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p class="text-sm text-gray-500">Belum ada riwayat presensi</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { Clock, Calendar, Users, TrendingUp, CheckCircle, FileText } from 'lucide-vue-next'
import AppLayout from '@/components/AppLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { usePresensiStore } from '@/stores/presensi'

const authStore = useAuthStore()
const presensiStore = usePresensiStore()

const todayStatus = computed(() => {
  if (!presensiStore.todayRecord) return 'Belum Presensi'
  if (presensiStore.hasCheckedOut) return 'Selesai'
  if (presensiStore.hasCheckedIn) return 'Sudah Check In'
  return 'Belum Check In'
})

const monthlyAttendance = computed(() => {
  const thisMonth = format(new Date(), 'yyyy-MM')
  const monthlyRecords = presensiStore.records.filter((r) => r.date.startsWith(thisMonth))
  return `${monthlyRecords.length} hari`
})

const todayPresentEmployees = computed(() => {
  const today = format(new Date(), 'yyyy-MM-dd')
  const todayRecords = presensiStore.records.filter((r) => r.date === today)
  return todayRecords.length
})

const attendanceRate = computed(() => {
  const thisMonth = format(new Date(), 'yyyy-MM')
  const monthlyRecords = presensiStore.records.filter((r) => r.date.startsWith(thisMonth))
  const presentRecords = monthlyRecords.filter((r) => r.status === 'present')

  if (monthlyRecords.length === 0) return 0
  return Math.round((presentRecords.length / monthlyRecords.length) * 100)
})

const recentRecords = computed(() => {
  return presensiStore.records
    .filter((r) => r.user_id === authStore.user?.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
})

onMounted(async () => {
  await presensiStore.fetchTodayRecord()
})
</script>
