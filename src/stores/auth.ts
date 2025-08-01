import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']

export interface UserWithProfile {
  id: string
  email: string
  name: string
  role: 'admin' | 'employee'
  avatar?: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const profile = ref<Profile | null>(null)
  const loading = ref(true)

  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(() => profile.value?.role === 'admin')
  
  const currentUser = computed((): UserWithProfile | null => {
    if (!user.value || !profile.value) return null
    
    return {
      id: user.value.id,
      email: profile.value.email || user.value.email || '',
      name: profile.value.name || 'User',
      role: profile.value.role,
    }
  })

  const initialize = async () => {
    try {
      loading.value = true
      
      // Get initial session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        user.value = session.user
        await fetchProfile()
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event)
        
        if (session?.user) {
          user.value = session.user
          await fetchProfile()
        } else {
          user.value = null
          profile.value = null
        }
      })
    } catch (error) {
      console.error('Auth initialization error:', error)
    } finally {
      loading.value = false
    }
  }

  const fetchProfile = async () => {
    if (!user.value) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.value.id)
        .single()

      if (error) {
        // If profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          await createProfile()
        } else {
          throw error
        }
      } else {
        profile.value = data
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const createProfile = async () => {
    if (!user.value) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: user.value.id,
          email: user.value.email || '',
          name: user.value.user_metadata?.name || 'User',
          role: 'employee'
        })
        .select()
        .single()

      if (error) throw error
      profile.value = data
    } catch (error) {
      console.error('Error creating profile:', error)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      loading.value = true
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      
      user.value = data.user
      await fetchProfile()
      
      return { success: true }
    } catch (error: any) {
      console.error('Login error:', error)
      return { 
        success: false, 
        error: error.message || 'Login failed' 
      }
    } finally {
      loading.value = false
    }
  }

  const register = async (email: string, password: string, name: string) => {
    try {
      loading.value = true
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })

      if (error) throw error
      
      // Check if email confirmation is required
      if (data.user && !data.session) {
        return { 
          success: true, 
          needsConfirmation: true,
          message: 'Registration successful! Please check your email to confirm your account.',
          user: data.user 
        }
      }
      
      // If we have a session, user is automatically logged in
      if (data.session?.user) {
        user.value = data.session.user
        await fetchProfile()
      }
      
      return { success: true, user: data.user }
    } catch (error: any) {
      console.error('Registration error:', error)
      return { 
        success: false, 
        error: error.message || 'Registration failed' 
      }
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      user.value = null
      profile.value = null
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user.value) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.value.id)
        .select()
        .single()

      if (error) throw error
      profile.value = data
      
      return { success: true }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Update failed' 
      }
    }
  }

  // Legacy compatibility methods
  const initAuth = initialize

  return {
    user: currentUser,
    profile: computed(() => profile.value),
    loading: computed(() => loading.value),
    isLoggedIn,
    isAdmin,
    initialize,
    initAuth, // for compatibility
    login,
    register,
    logout,
    updateProfile,
    fetchProfile,
  }
})
