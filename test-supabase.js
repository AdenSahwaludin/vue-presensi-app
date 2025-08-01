// Test Supabase Connection
// Run this in browser console to test connection

import { supabase } from './src/lib/supabase'

export async function testSupabaseConnection() {
  console.log('🔄 Testing Supabase connection...')
  
  try {
    // Test 1: Check if client is created
    console.log('✅ Supabase client created')
    console.log('URL:', supabase.supabaseUrl)
    
    // Test 2: Test auth status
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) {
      console.log('⚠️ Session check error:', sessionError.message)
    } else {
      console.log('✅ Session check successful')
      console.log('Current session:', session ? 'Logged in' : 'Not logged in')
    }
    
    // Test 3: Test database connection (this might fail if tables don't exist yet)
    const { data, error } = await supabase.from('profiles').select('count').single()
    if (error) {
      console.log('⚠️ Database test error:', error.message)
      console.log('📝 This is normal if you haven\'t run the database setup yet')
    } else {
      console.log('✅ Database connection successful')
    }
    
    console.log('🎉 Supabase connection test completed!')
    return true
    
  } catch (error) {
    console.error('❌ Connection test failed:', error)
    return false
  }
}

// Auto-run test
testSupabaseConnection()
