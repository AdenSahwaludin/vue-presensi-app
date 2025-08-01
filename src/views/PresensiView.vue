<template>
  <AppLayout>
    <div class="max-w-2xl mx-auto space-y-6">
      <!-- Header -->
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Presensi Kehadiran</h1>
        <p class="text-gray-600">
          {{ format(new Date(), 'EEEE, dd MMMM yyyy', { locale: id }) }}
        </p>
      </div>

      <!-- Status Card -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-center mb-6">
          <div
            class="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
            :class="{
              'bg-green-100': presensiStore.hasCheckedOut,
              'bg-yellow-100': presensiStore.hasCheckedIn && !presensiStore.hasCheckedOut,
              'bg-gray-100': !presensiStore.hasCheckedIn,
            }"
          >
            <Clock
              class="w-10 h-10"
              :class="{
                'text-green-600': presensiStore.hasCheckedOut,
                'text-yellow-600': presensiStore.hasCheckedIn && !presensiStore.hasCheckedOut,
                'text-gray-400': !presensiStore.hasCheckedIn,
              }"
            />
          </div>

          <h2 class="text-xl font-semibold text-gray-900 mb-2">
            {{ statusMessage }}
          </h2>

          <div class="text-4xl font-bold text-gray-900 mb-2">
            {{ currentTime }}
          </div>

          <p class="text-sm text-gray-500">
            {{ currentDate }}
          </p>
        </div>

        <!-- Today's Record -->
        <div v-if="presensiStore.todayRecord" class="border-t pt-6 space-y-3">
          <div v-if="presensiStore.todayRecord.check_in_time" class="flex justify-between items-center">
            <span class="text-sm text-gray-600">Check In:</span>
            <span class="font-medium">{{ presensiStore.todayRecord.check_in_time }}</span>
          </div>

          <div v-if="presensiStore.todayRecord.check_out_time" class="flex justify-between items-center">
            <span class="text-sm text-gray-600">Check Out:</span>
            <span class="font-medium">{{ presensiStore.todayRecord.check_out_time }}</span>
          </div>

          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">Status:</span>
            <span
              class="px-2 py-1 rounded text-xs font-medium"
              :class="{
                'bg-green-100 text-green-800': presensiStore.todayRecord.status === 'present',
                'bg-yellow-100 text-yellow-800': presensiStore.todayRecord.status === 'late',
                'bg-red-100 text-red-800': presensiStore.todayRecord.status === 'absent',
              }"
            >
              {{ statusText }}
            </span>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="space-y-4">
        <button
          v-if="!presensiStore.hasCheckedIn"
          @click="handleCheckIn"
          :disabled="isProcessing"
          class="w-full btn btn-primary py-4 text-lg"
        >
          <Camera class="w-6 h-6 mr-2" />
          {{ isProcessing ? 'Memproses...' : 'Check In' }}
        </button>

        <button
          v-else-if="!presensiStore.hasCheckedOut"
          @click="handleCheckOut"
          :disabled="isProcessing"
          class="w-full btn bg-blue-600 text-white hover:bg-blue-700 py-4 text-lg"
        >
          <Camera class="w-6 h-6 mr-2" />
          {{ isProcessing ? 'Memproses...' : 'Check Out' }}
        </button>

        <div v-else class="text-center py-8">
          <CheckCircle class="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">Presensi Hari Ini Selesai</h3>
          <p class="text-gray-500">Terima kasih telah melakukan presensi hari ini</p>
        </div>

        <!-- Debug Mode -->
        <div class="mt-6 pt-6 border-t border-gray-200">
          <h4 class="text-sm font-medium text-gray-700 mb-3">Debug Mode (Development)</h4>
          <div class="grid grid-cols-2 gap-2">
            <button
              @click="debugCheckIn"
              class="btn btn-secondary text-sm"
              v-if="!presensiStore.hasCheckedIn"
            >
              Debug Check In
            </button>
            <button
              @click="debugCheckOut"
              class="btn btn-secondary text-sm"
              v-if="presensiStore.hasCheckedIn && !presensiStore.hasCheckedOut"
            >
              Debug Check Out
            </button>
          </div>
        </div>
      </div>

      <!-- Camera Modal -->
      <div
        v-if="showCamera"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ cameraMode === 'checkin' ? 'Check In' : 'Check Out' }}
          </h3>

          <div class="mb-4">
            <video
              ref="videoRef"
              autoplay
              muted
              class="w-full h-64 bg-gray-100 rounded-lg object-cover"
            ></video>
          </div>

          <div v-if="locationError" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p class="text-sm text-red-600">{{ locationError }}</p>
          </div>

          <div
            v-if="currentLocation"
            class="mb-4 p-3 bg-green-50 border border-green-200 rounded-md"
          >
            <p class="text-sm text-green-600">
              📍 Lokasi terdeteksi ({{ Math.round(currentLocation.accuracy) }}m akurasi)
            </p>
          </div>

          <div class="flex space-x-3">
            <button
              @click="capturePhoto"
              :disabled="!currentLocation || isCapturing"
              class="flex-1 btn btn-primary"
            >
              <Camera class="w-4 h-4 mr-2" />
              {{ isCapturing ? 'Mengambil...' : 'Ambil Foto' }}
            </button>

            <button @click="closeCamera" class="btn btn-secondary">Batal</button>
          </div>
        </div>
      </div>

      <!-- Location Info -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex items-start">
          <MapPin class="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
          <div>
            <h4 class="text-sm font-medium text-blue-900">Informasi Lokasi</h4>
            <p class="text-sm text-blue-700 mt-1">
              Pastikan Anda berada dalam radius kantor untuk melakukan presensi. Aplikasi akan
              otomatis mendeteksi lokasi Anda.
            </p>
            <div class="mt-2 text-xs text-blue-600">
              <p>📍 Kantor: {{ OFFICE_LOCATION.lat }}, {{ OFFICE_LOCATION.lng }}</p>
              <p>📏 Radius: {{ OFFICE_RADIUS }}m</p>
              <p>🔒 Catatan: Kamera memerlukan HTTPS di production</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { Clock, Camera, CheckCircle, MapPin } from 'lucide-vue-next'
import AppLayout from '@/components/AppLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { usePresensiStore } from '@/stores/presensi'
import { cameraService } from '@/services/camera'
import { locationService, type LocationData } from '@/services/location'
import { notificationService } from '@/services/notification'

const authStore = useAuthStore()
const presensiStore = usePresensiStore()

const currentTime = ref('')
const currentDate = ref('')
const showCamera = ref(false)
const cameraMode = ref<'checkin' | 'checkout'>('checkin')
const videoRef = ref<HTMLVideoElement>()
const isProcessing = ref(false)
const isCapturing = ref(false)
const currentLocation = ref<LocationData>()
const locationError = ref('')

let timeInterval: NodeJS.Timeout
let stream: MediaStream | null = null

// Office location (example coordinates - Jakarta area)
const OFFICE_LOCATION = {
  lat: -6.2088,
  lng: 106.8456,
}
const OFFICE_RADIUS = 1000 // meters - increased for testing

const statusMessage = computed(() => {
  if (presensiStore.hasCheckedOut) {
    return 'Presensi Selesai'
  } else if (presensiStore.hasCheckedIn) {
    return 'Sudah Check In'
  } else {
    return 'Siap untuk Check In'
  }
})

const statusText = computed(() => {
  if (!presensiStore.todayRecord) return ''

  const status = presensiStore.todayRecord.status
  switch (status) {
    case 'present':
      return 'Hadir'
    case 'late':
      return 'Terlambat'
    case 'absent':
      return 'Tidak Hadir'
    default:
      return status
  }
})

function updateTime() {
  const now = new Date()
  currentTime.value = format(now, 'HH:mm:ss')
  currentDate.value = format(now, 'EEEE, dd MMMM yyyy', { locale: id })
}

async function handleCheckIn() {
  cameraMode.value = 'checkin'
  await startPresensiProcess()
}

async function handleCheckOut() {
  cameraMode.value = 'checkout'
  await startPresensiProcess()
}

async function startPresensiProcess() {
  isProcessing.value = true
  locationError.value = ''

  try {
    console.log('Starting presensi process...')

    // Get current location
    console.log('Getting location...')
    currentLocation.value = await locationService.getCurrentLocation()
    console.log('Location obtained:', currentLocation.value)

    // Check if within office radius
    const distance = locationService.calculateDistance(
      currentLocation.value.lat,
      currentLocation.value.lng,
      OFFICE_LOCATION.lat,
      OFFICE_LOCATION.lng,
    )

    console.log(`Distance from office: ${Math.round(distance)}m (radius: ${OFFICE_RADIUS}m)`)

    const isWithinOffice = distance <= OFFICE_RADIUS

    if (!isWithinOffice) {
      locationError.value = `Anda berada ${Math.round(distance)}m dari kantor. Radius maksimal: ${OFFICE_RADIUS}m`
      isProcessing.value = false
      return
    }

    // Start camera
    console.log('Starting camera...')
    showCamera.value = true
    await startCamera()
  } catch (error) {
    console.error('Presensi process error:', error)
    locationError.value = error instanceof Error ? error.message : 'Gagal memproses presensi'
  } finally {
    isProcessing.value = false
  }
}

async function startCamera() {
  try {
    console.log('Requesting camera access...')
    stream = await cameraService.startCamera()
    console.log('Camera stream obtained:', stream)

    if (videoRef.value) {
      console.log('Setting video source...')
      videoRef.value.srcObject = stream
    } else {
      console.error('Video ref not available')
    }
  } catch (error) {
    console.error('Camera error:', error)
    locationError.value =
      'Gagal mengakses kamera. Pastikan izin kamera diberikan dan Anda menggunakan HTTPS.'
    closeCamera()
  }
}

async function capturePhoto() {
  if (!videoRef.value || !currentLocation.value || !authStore.user) return

  isCapturing.value = true

  try {
    const photo = cameraService.capturePhoto(videoRef.value)

    if (cameraMode.value === 'checkin') {
      const result = await presensiStore.checkIn(
        { lat: currentLocation.value.lat, lng: currentLocation.value.lng },
        photo,
      )
      
      if (result.success) {
        await notificationService.showSuccessMessage('Check-in berhasil!')
      } else {
        throw new Error(result.error || 'Check-in gagal')
      }
    } else {
      const result = await presensiStore.checkOut(
        { lat: currentLocation.value.lat, lng: currentLocation.value.lng },
        photo,
      )
      
      if (result.success) {
        await notificationService.showSuccessMessage('Check-out berhasil!')
      } else {
        throw new Error(result.error || 'Check-out gagal')
      }
    }

    closeCamera()
  } catch (error) {
    console.error('Capture error:', error)
    alert('Gagal mengambil foto: ' + (error instanceof Error ? error.message : 'Unknown error'))
  } finally {
    isCapturing.value = false
  }
}

// Debug functions for testing without camera/location
async function debugCheckIn() {
  if (!authStore.user) return

  const dummyLocation = { lat: -6.2088, lng: 106.8456 }
  const result = await presensiStore.checkIn(
    dummyLocation,
    'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A',
  )
  
  if (result.success) {
    notificationService.showSuccessMessage('Debug Check-in berhasil!')
  } else {
    alert('Debug Check-in gagal: ' + result.error)
  }
}

async function debugCheckOut() {
  if (!authStore.user) return

  const dummyLocation = { lat: -6.2088, lng: 106.8456 }
  const result = await presensiStore.checkOut(
    dummyLocation,
    'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A',
  )
  
  if (result.success) {
    notificationService.showSuccessMessage('Debug Check-out berhasil!')
  } else {
    alert('Debug Check-out gagal: ' + result.error)
  }
}

function closeCamera() {
  showCamera.value = false
  cameraService.stopCamera()
  stream = null
}

onMounted(async () => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
  
  // Fetch today's record from Supabase
  await presensiStore.fetchTodayRecord()

  // Setup notifications
  notificationService.scheduleReminders()
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
  if (stream) {
    cameraService.stopCamera()
  }
  locationService.stopWatching()
})
</script>
