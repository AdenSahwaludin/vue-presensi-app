import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { format } from 'date-fns'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'
import { useAuthStore } from './auth'

type PresensiRow = Database['public']['Tables']['presensi']['Row']
type PresensiInsert = Database['public']['Tables']['presensi']['Insert']
type PresensiUpdate = Database['public']['Tables']['presensi']['Update']

export interface PresensiRecord {
  id: string
  user_id: string
  user_name: string
  date: string
  check_in_time?: string
  check_in_location?: { lat: number; lng: number }
  check_in_photo?: string
  check_out_time?: string
  check_out_location?: { lat: number; lng: number }
  check_out_photo?: string
  status: 'present' | 'late' | 'absent'
  created_at?: string
  updated_at?: string
}

export const usePresensiStore = defineStore('presensi', () => {
  const records = ref<PresensiRecord[]>([])
  const isCheckingIn = ref(false)
  const isCheckingOut = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const authStore = useAuthStore()

  const todayRecord = computed(() => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const currentUserId = authStore.user?.id
    return records.value.find((r) => r.date === today && r.user_id === currentUserId)
  })

  const hasCheckedIn = computed(() => !!todayRecord.value?.check_in_time)
  const hasCheckedOut = computed(() => !!todayRecord.value?.check_out_time)
  const canCheckOut = computed(() => hasCheckedIn.value && !hasCheckedOut.value)

  const fetchRecords = async (startDate?: string, endDate?: string) => {
    try {
      loading.value = true
      error.value = null

      let query = supabase
        .from('presensi')
        .select('*')
        .order('date', { ascending: false })

      if (startDate && endDate) {
        query = query.gte('date', startDate).lte('date', endDate)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      records.value = data.map((record: any) => ({
        id: record.id,
        user_id: record.user_id,
        user_name: 'Unknown User', // We'll fetch this separately if needed
        date: record.date,
        check_in_time: record.check_in_time,
        check_in_location: record.check_in_location,
        check_in_photo: record.check_in_photo,
        check_out_time: record.check_out_time,
        check_out_location: record.check_out_location,
        check_out_photo: record.check_out_photo,
        status: record.status,
        created_at: record.created_at,
        updated_at: record.updated_at,
      }))

      return { success: true }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch records'
      console.error('Error fetching records:', err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const fetchTodayRecord = async () => {
    const currentUser = authStore.user
    if (!currentUser) return

    try {
      const today = format(new Date(), 'yyyy-MM-dd')
      
      const { data, error: fetchError } = await supabase
        .from('presensi')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('date', today)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError
      }

      if (data) {
        const record: PresensiRecord = {
          id: data.id,
          user_id: data.user_id,
          user_name: currentUser.name,
          date: data.date,
          check_in_time: data.check_in_time,
          check_in_location: data.check_in_location,
          check_in_photo: data.check_in_photo,
          check_out_time: data.check_out_time,
          check_out_location: data.check_out_location,
          check_out_photo: data.check_out_photo,
          status: data.status,
          created_at: data.created_at,
          updated_at: data.updated_at,
        }

        // Update or add to records
        const existingIndex = records.value.findIndex(r => r.id === record.id)
        if (existingIndex >= 0) {
          records.value[existingIndex] = record
        } else {
          records.value.unshift(record)
        }
      }
    } catch (err: any) {
      console.error('Error fetching today record:', err)
    }
  }

  const checkIn = async (
    location: { lat: number; lng: number },
    photo?: string,
  ) => {
    const currentUser = authStore.user
    if (!currentUser) {
      throw new Error('User not authenticated')
    }

    try {
      isCheckingIn.value = true
      error.value = null

      const today = format(new Date(), 'yyyy-MM-dd')
      const currentTime = format(new Date(), 'HH:mm:ss')

      // Determine status based on time
      const hour = new Date().getHours()
      const status = hour > 9 ? 'late' : 'present'

      const recordData: PresensiInsert = {
        user_id: currentUser.id,
        date: today,
        check_in_time: currentTime,
        check_in_location: location,
        check_in_photo: photo,
        status: status,
      }

      const { data, error: insertError } = await supabase
        .from('presensi')
        .insert(recordData)
        .select()
        .single()

      if (insertError) throw insertError

      // Add to local records
      const newRecord: PresensiRecord = {
        id: data.id,
        user_id: data.user_id,
        user_name: currentUser.name,
        date: data.date,
        check_in_time: data.check_in_time,
        check_in_location: data.check_in_location,
        check_in_photo: data.check_in_photo,
        status: data.status,
        created_at: data.created_at,
        updated_at: data.updated_at,
      }

      records.value.unshift(newRecord)

      return { success: true, record: newRecord }
    } catch (err: any) {
      error.value = err.message || 'Check-in failed'
      console.error('Check-in error:', err)
      return { success: false, error: error.value }
    } finally {
      isCheckingIn.value = false
    }
  }

  const checkOut = async (location: { lat: number; lng: number }, photo?: string) => {
    const currentUser = authStore.user
    if (!currentUser) {
      throw new Error('User not authenticated')
    }

    try {
      isCheckingOut.value = true
      error.value = null

      const today = format(new Date(), 'yyyy-MM-dd')
      const currentTime = format(new Date(), 'HH:mm:ss')

      // Find today's record
      const existingRecord = todayRecord.value
      if (!existingRecord) {
        throw new Error('No check-in record found for today')
      }

      const updateData: PresensiUpdate = {
        check_out_time: currentTime,
        check_out_location: location,
        check_out_photo: photo,
        updated_at: new Date().toISOString(),
      }

      const { data, error: updateError } = await supabase
        .from('presensi')
        .update(updateData)
        .eq('id', existingRecord.id)
        .select()
        .single()

      if (updateError) throw updateError

      // Update local record
      const recordIndex = records.value.findIndex(r => r.id === existingRecord.id)
      if (recordIndex >= 0) {
        records.value[recordIndex] = {
          ...records.value[recordIndex],
          check_out_time: data.check_out_time,
          check_out_location: data.check_out_location,
          check_out_photo: data.check_out_photo,
          updated_at: data.updated_at,
        }
      }

      return { success: true }
    } catch (err: any) {
      error.value = err.message || 'Check-out failed'
      console.error('Check-out error:', err)
      return { success: false, error: error.value }
    } finally {
      isCheckingOut.value = false
    }
  }

  const getRecordsByDateRange = (startDate: string, endDate: string) => {
    return records.value.filter((r) => r.date >= startDate && r.date <= endDate)
  }

  const getRecordsByUser = (userId: string) => {
    return records.value.filter((r) => r.user_id === userId)
  }

  const deleteRecord = async (recordId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('presensi')
        .delete()
        .eq('id', recordId)

      if (deleteError) throw deleteError

      // Remove from local records
      records.value = records.value.filter(r => r.id !== recordId)

      return { success: true }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete record'
      console.error('Delete record error:', err)
      return { success: false, error: errorMessage }
    }
  }

  // Legacy compatibility methods
  const loadFromLocalStorage = () => {
    console.warn('loadFromLocalStorage is deprecated with Supabase integration')
    // For compatibility, we'll fetch records instead
    fetchRecords()
  }

  return {
    records: computed(() => records.value),
    isCheckingIn: computed(() => isCheckingIn.value),
    isCheckingOut: computed(() => isCheckingOut.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    todayRecord,
    hasCheckedIn,
    hasCheckedOut,
    canCheckOut,
    fetchRecords,
    fetchTodayRecord,
    checkIn,
    checkOut,
    getRecordsByDateRange,
    getRecordsByUser,
    deleteRecord,
    loadFromLocalStorage, // for compatibility
  }
})
