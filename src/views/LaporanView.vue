<template>
  <AppLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Laporan Presensi</h1>
          <p class="text-gray-600">Kelola dan unduh laporan kehadiran karyawan</p>
        </div>

        <div class="mt-4 sm:mt-0 flex space-x-3">
          <button @click="showExportModal = true" class="btn btn-primary">
            <Download class="w-4 h-4 mr-2" />
            Export Data
          </button>

          <button @click="printReport" class="btn btn-secondary">
            <Printer class="w-4 h-4 mr-2" />
            Print
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Filter Laporan</h3>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"> Tanggal Mulai </label>
            <input
              type="date"
              v-model="filters.startDate"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"> Tanggal Akhir </label>
            <input
              type="date"
              v-model="filters.endDate"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"> Status </label>
            <select
              v-model="filters.status"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Semua Status</option>
              <option value="present">Hadir</option>
              <option value="late">Terlambat</option>
              <option value="absent">Tidak Hadir</option>
            </select>
          </div>
        </div>

        <div class="mt-4 flex space-x-3">
          <button @click="applyFilters" class="btn btn-primary">
            <Filter class="w-4 h-4 mr-2" />
            Terapkan Filter
          </button>

          <button @click="resetFilters" class="btn btn-secondary">Reset</button>
        </div>
      </div>

      <!-- Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <Users class="h-8 w-8 text-blue-600" />
            </div>
            <div class="ml-4">
              <dt class="text-sm font-medium text-gray-500">Total Records</dt>
              <dd class="text-2xl font-bold text-gray-900">{{ stats.total }}</dd>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <CheckCircle class="h-8 w-8 text-green-600" />
            </div>
            <div class="ml-4">
              <dt class="text-sm font-medium text-gray-500">Hadir</dt>
              <dd class="text-2xl font-bold text-gray-900">{{ stats.present }}</dd>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <Clock class="h-8 w-8 text-yellow-600" />
            </div>
            <div class="ml-4">
              <dt class="text-sm font-medium text-gray-500">Terlambat</dt>
              <dd class="text-2xl font-bold text-gray-900">{{ stats.late }}</dd>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <XCircle class="h-8 w-8 text-red-600" />
            </div>
            <div class="ml-4">
              <dt class="text-sm font-medium text-gray-500">Tidak Hadir</dt>
              <dd class="text-2xl font-bold text-gray-900">{{ stats.absent }}</dd>
            </div>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Data Presensi</h3>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Tanggal
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Nama
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Check In
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Check Out
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="record in paginatedRecords" :key="record.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDate(record.date) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    {{ record.user_name }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ record.check_in_time || '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ record.check_out_time || '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-2 py-1 text-xs font-medium rounded-full"
                    :class="{
                      'bg-green-100 text-green-800': record.status === 'present',
                      'bg-yellow-100 text-yellow-800': record.status === 'late',
                      'bg-red-100 text-red-800': record.status === 'absent',
                    }"
                  >
                    {{ getStatusText(record.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    @click="viewDetails(record)"
                    class="text-primary-600 hover:text-primary-900"
                  >
                    <Eye class="w-4 h-4" />
                  </button>
                </td>
              </tr>

              <tr v-if="paginatedRecords.length === 0">
                <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                  Tidak ada data yang ditemukan
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div class="text-sm text-gray-700">
            Menampilkan {{ startRecord }} - {{ endRecord }} dari {{ filteredRecords.length }} data
          </div>

          <div class="flex space-x-2">
            <button
              @click="previousPage"
              :disabled="currentPage === 1"
              class="btn btn-secondary disabled:opacity-50"
            >
              <ChevronLeft class="w-4 h-4" />
            </button>

            <span class="px-3 py-2 text-sm text-gray-700">
              {{ currentPage }} / {{ totalPages }}
            </span>

            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="btn btn-secondary disabled:opacity-50"
            >
              <ChevronRight class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Export Modal -->
    <div
      v-if="showExportModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Export Laporan</h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"> Format File </label>
            <select
              v-model="exportFormat"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="excel">Excel (.xlsx)</option>
              <option value="csv">CSV (.csv)</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Nama File (opsional)
            </label>
            <input
              type="text"
              v-model="exportFilename"
              placeholder="Akan menggunakan nama default jika kosong"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <div class="mt-6 flex space-x-3">
          <button @click="performExport" class="flex-1 btn btn-primary">
            <Download class="w-4 h-4 mr-2" />
            Export
          </button>

          <button @click="showExportModal = false" class="btn btn-secondary">Batal</button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { format } from 'date-fns'
import {
  Download,
  Printer,
  Filter,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-vue-next'
import AppLayout from '@/components/AppLayout.vue'
import { usePresensiStore } from '@/stores/presensi'
import { exportService } from '@/services/export'

const presensiStore = usePresensiStore()

const filters = ref({
  startDate: format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'),
  endDate: format(new Date(), 'yyyy-MM-dd'),
  status: '',
})

const currentPage = ref(1)
const recordsPerPage = 10
const showExportModal = ref(false)
const exportFormat = ref('excel')
const exportFilename = ref('')
const isLoading = ref(false)

const filteredRecords = computed(() => {
  let records = presensiStore.records

  if (filters.value.startDate && filters.value.endDate) {
    records = records.filter(
      (r) => r.date >= filters.value.startDate && r.date <= filters.value.endDate,
    )
  }

  if (filters.value.status) {
    records = records.filter((r) => r.status === filters.value.status)
  }

  return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

const stats = computed(() => {
  const records = filteredRecords.value
  return {
    total: records.length,
    present: records.filter((r) => r.status === 'present').length,
    late: records.filter((r) => r.status === 'late').length,
    absent: records.filter((r) => r.status === 'absent').length,
  }
})

const totalPages = computed(() => {
  return Math.ceil(filteredRecords.value.length / recordsPerPage)
})

const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * recordsPerPage
  const end = start + recordsPerPage
  return filteredRecords.value.slice(start, end)
})

const startRecord = computed(() => {
  return (currentPage.value - 1) * recordsPerPage + 1
})

const endRecord = computed(() => {
  const end = currentPage.value * recordsPerPage
  return Math.min(end, filteredRecords.value.length)
})

function formatDate(dateString: string) {
  return format(new Date(dateString), 'dd/MM/yyyy')
}

function getStatusText(status: string) {
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
}

async function applyFilters() {
  currentPage.value = 1
  isLoading.value = true
  
  try {
    await presensiStore.fetchRecords(filters.value.startDate, filters.value.endDate)
  } catch (error) {
    console.error('Error applying filters:', error)
  } finally {
    isLoading.value = false
  }
}

function resetFilters() {
  filters.value = {
    startDate: format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    status: '',
  }
  currentPage.value = 1
  applyFilters()
}

function previousPage() {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

function viewDetails(record: any) {
  // Implementation for viewing record details
  const checkInInfo = record.check_in_time ? 
    `Check In: ${record.check_in_time}${record.check_in_location ? ` (${record.check_in_location.lat.toFixed(6)}, ${record.check_in_location.lng.toFixed(6)})` : ''}` : 
    'Belum check in'
  
  const checkOutInfo = record.check_out_time ? 
    `Check Out: ${record.check_out_time}${record.check_out_location ? ` (${record.check_out_location.lat.toFixed(6)}, ${record.check_out_location.lng.toFixed(6)})` : ''}` : 
    'Belum check out'
  
  alert(`Detail untuk ${record.user_name} pada ${formatDate(record.date)}\n\n${checkInInfo}\n${checkOutInfo}\n\nStatus: ${getStatusText(record.status)}`)
}

function performExport() {
  const records = filteredRecords.value
  const filename = exportFilename.value || undefined

  if (exportFormat.value === 'excel') {
    exportService.exportToExcel(records, filename)
  } else {
    exportService.exportToCSV(records, filename)
  }

  showExportModal.value = false
  exportFilename.value = ''
}

function printReport() {
  exportService.printReport(filteredRecords.value)
}

onMounted(async () => {
  isLoading.value = true
  try {
    await presensiStore.fetchRecords(filters.value.startDate, filters.value.endDate)
  } catch (error) {
    console.error('Error loading records:', error)
  } finally {
    isLoading.value = false
  }
})
</script>
