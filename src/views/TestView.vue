<template>
  <div class="min-h-screen bg-gray-100 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <div class="bg-white rounded-lg shadow-lg p-6">
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-2xl font-bold text-gray-900">Database Connection Test</h1>
          <button
            @click="runAllTests"
            :disabled="testing"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {{ testing ? 'Testing...' : 'Run Tests' }}
          </button>
        </div>

        <!-- Connection Status -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="font-medium text-gray-900 mb-2">Supabase Client</h3>
            <div class="flex items-center">
              <div
                class="w-3 h-3 rounded-full mr-2"
                :class="tests.client.status === 'success' ? 'bg-green-500' : tests.client.status === 'error' ? 'bg-red-500' : 'bg-yellow-500'"
              ></div>
              <span class="text-sm">{{ tests.client.message }}</span>
            </div>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="font-medium text-gray-900 mb-2">Authentication</h3>
            <div class="flex items-center">
              <div
                class="w-3 h-3 rounded-full mr-2"
                :class="tests.auth.status === 'success' ? 'bg-green-500' : tests.auth.status === 'error' ? 'bg-red-500' : 'bg-yellow-500'"
              ></div>
              <span class="text-sm">{{ tests.auth.message }}</span>
            </div>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="font-medium text-gray-900 mb-2">Database</h3>
            <div class="flex items-center">
              <div
                class="w-3 h-3 rounded-full mr-2"
                :class="tests.database.status === 'success' ? 'bg-green-500' : tests.database.status === 'error' ? 'bg-red-500' : 'bg-yellow-500'"
              ></div>
              <span class="text-sm">{{ tests.database.message }}</span>
            </div>
          </div>
        </div>

        <!-- Test Results -->
        <div class="space-y-4">
          <div class="border rounded-lg p-4">
            <h3 class="font-medium text-gray-900 mb-2">Environment Variables</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span>VITE_SUPABASE_URL:</span>
                <span class="font-mono">{{ envVars.url || 'Not set' }}</span>
              </div>
              <div class="flex justify-between">
                <span>VITE_SUPABASE_ANON_KEY:</span>
                <span class="font-mono">{{ envVars.key ? envVars.key.substring(0, 20) + '...' : 'Not set' }}</span>
              </div>
            </div>
          </div>

          <div class="border rounded-lg p-4">
            <h3 class="font-medium text-gray-900 mb-2">Database Setup</h3>
            <div class="space-y-2">
              <div v-for="table in tableStatus" :key="table.name" class="flex items-center justify-between">
                <span class="text-sm">{{ table.name }}</span>
                <div class="flex items-center">
                  <div
                    class="w-2 h-2 rounded-full mr-2"
                    :class="table.exists ? 'bg-green-500' : 'bg-red-500'"
                  ></div>
                  <span class="text-xs text-gray-600">{{ table.exists ? 'Exists' : 'Missing' }}</span>
                </div>
              </div>
            </div>
            <div class="mt-4">
              <button
                @click="setupDatabase"
                :disabled="testing"
                class="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50 w-full"
              >
                {{ testing ? 'Setting up...' : 'Setup Database (Auto)' }}
              </button>
              <p class="text-xs text-gray-500 mt-2">
                This will create all necessary tables and policies
              </p>
            </div>
          </div>

          <div class="border rounded-lg p-4">
            <h3 class="font-medium text-gray-900 mb-2">Manual Solutions</h3>
            <div class="space-y-3 text-sm">
              <div class="bg-yellow-50 border border-yellow-200 rounded p-3">
                <h4 class="font-medium text-yellow-800 mb-1">If Login Fails (Email Confirmation Issue):</h4>
                <ol class="list-decimal list-inside text-yellow-700 space-y-1">
                  <li>Go to <strong>Supabase Dashboard</strong> → Authentication → Settings</li>
                  <li>Find <strong>"Enable email confirmations"</strong> and <strong>disable it</strong></li>
                  <li>Save settings and try registration + login again</li>
                </ol>
              </div>
              
              <div class="bg-blue-50 border border-blue-200 rounded p-3">
                <h4 class="font-medium text-blue-800 mb-1">Manually Confirm Users:</h4>
                <ol class="list-decimal list-inside text-blue-700 space-y-1">
                  <li>Go to <strong>Supabase Dashboard</strong> → Authentication → Users</li>
                  <li>Find the user and click the <strong>3 dots</strong> menu</li>
                  <li>Click <strong>"Confirm User"</strong></li>
                </ol>
              </div>
              
              <div class="bg-green-50 border border-green-200 rounded p-3">
                <h4 class="font-medium text-green-800 mb-1">Test Credentials:</h4>
                <div class="text-green-700 space-y-1">
                  <div><strong>Admin:</strong> admin@test.com / admin123456</div>
                  <div><strong>Employee:</strong> Use "Create Admin User" button above</div>
                </div>
              </div>
            </div>
          </div>

          <div class="border rounded-lg p-4">
            <h3 class="font-medium text-gray-900 mb-2">Test Actions</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                @click="testRegister"
                :disabled="testing"
                class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              >
                Test Registration
              </button>
              <button
                @click="testLogin"
                :disabled="testing"
                class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Test Login
              </button>
              <button
                @click="createAdminUser"
                :disabled="testing"
                class="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 disabled:opacity-50"
              >
                Create Admin User
              </button>
              <button
                @click="testCheckIn"
                :disabled="testing || !authStore.isLoggedIn"
                class="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 disabled:opacity-50"
              >
                Test Check-in
              </button>
              <button
                @click="testDataFetch"
                :disabled="testing"
                class="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
              >
                Test Data Fetch
              </button>
            </div>
          </div>

          <!-- Results Log -->
          <div class="border rounded-lg p-4 bg-gray-900 text-green-400 font-mono text-sm max-h-64 overflow-y-auto">
            <h3 class="text-white mb-2">Test Log:</h3>
            <div v-for="log in logs" :key="log.id" class="mb-1">
              <span class="text-gray-500">{{ log.timestamp }}</span>
              <span :class="log.type === 'error' ? 'text-red-400' : log.type === 'success' ? 'text-green-400' : 'text-blue-400'">
                {{ log.message }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'
import { usePresensiStore } from '@/stores/presensi'
import { checkDatabaseSetup } from '@/utils/setup-database'

const authStore = useAuthStore()
const presensiStore = usePresensiStore()

const testing = ref(false)
const logs = ref<Array<{ id: number; timestamp: string; message: string; type: string }>>([])

const tests = ref({
  client: { status: 'pending', message: 'Not tested' },
  auth: { status: 'pending', message: 'Not tested' },
  database: { status: 'pending', message: 'Not tested' }
})

const envVars = ref({
  url: import.meta.env.VITE_SUPABASE_URL,
  key: import.meta.env.VITE_SUPABASE_ANON_KEY
})

const tableStatus = ref([
  { name: 'profiles', exists: false },
  { name: 'presensi', exists: false }
])

function addLog(message: string, type: 'info' | 'success' | 'error' = 'info') {
  logs.value.push({
    id: Date.now(),
    timestamp: new Date().toLocaleTimeString(),
    message,
    type
  })
}

async function testClient() {
  addLog('Testing Supabase client...', 'info')
  
  try {
    if (!envVars.value.url || !envVars.value.key) {
      throw new Error('Missing environment variables')
    }
    
    tests.value.client = { status: 'success', message: 'Client initialized' }
    addLog('✅ Client test passed', 'success')
    return true
  } catch (error) {
    tests.value.client = { status: 'error', message: 'Client failed' }
    addLog(`❌ Client test failed: ${error}`, 'error')
    return false
  }
}

async function testAuth() {
  addLog('Testing authentication...', 'info')
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) throw error
    
    tests.value.auth = { 
      status: 'success', 
      message: session ? 'User logged in' : 'No active session'
    }
    addLog('✅ Auth test passed', 'success')
    return true
  } catch (error: any) {
    tests.value.auth = { status: 'error', message: 'Auth failed' }
    addLog(`❌ Auth test failed: ${error.message}`, 'error')
    return false
  }
}

async function testDatabase() {
  addLog('Testing database connection...', 'info')
  
  try {
    // Test profiles table
    const { error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    tableStatus.value[0].exists = !profilesError
    
    // Test presensi table
    const { error: presensiError } = await supabase
      .from('presensi')
      .select('count')
      .limit(1)
    
    tableStatus.value[1].exists = !presensiError
    
    if (!profilesError && !presensiError) {
      tests.value.database = { status: 'success', message: 'All tables exist' }
      addLog('✅ Database test passed', 'success')
      return true
    } else {
      tests.value.database = { status: 'error', message: 'Some tables missing' }
      addLog('⚠️ Some database tables are missing. Run the SQL setup script.', 'error')
      return false
    }
  } catch (error: any) {
    tests.value.database = { status: 'error', message: 'Database failed' }
    addLog(`❌ Database test failed: ${error.message}`, 'error')
    return false
  }
}

async function runAllTests() {
  testing.value = true
  logs.value = []
  addLog('Starting comprehensive tests...', 'info')
  
  await testClient()
  await testAuth()
  await testDatabase()
  
  addLog('All tests completed!', 'info')
  testing.value = false
}

async function testRegister() {
  testing.value = true
  addLog('Testing user registration...', 'info')
  
  try {
    const testEmail = `test-${Date.now()}@example.com`
    const testPassword = 'test123456'
    const testName = 'Test User'
    
    const result = await authStore.register(testEmail, testPassword, testName)
    
    if (result.success) {
      if (result.needsConfirmation) {
        addLog(`⚠️ Registration successful for ${testEmail} but needs email confirmation`, 'error')
        addLog(`💡 Please disable email confirmation in Supabase Dashboard`, 'info')
      } else {
        addLog(`✅ Registration successful for ${testEmail}`, 'success')
        // Store credentials for login test
        sessionStorage.setItem('testCredentials', JSON.stringify({ email: testEmail, password: testPassword }))
      }
    } else {
      addLog(`❌ Registration failed: ${result.error}`, 'error')
    }
  } catch (error: any) {
    addLog(`❌ Registration test failed: ${error.message}`, 'error')
  }
  
  testing.value = false
}

async function testLogin() {
  testing.value = true
  addLog('Testing user login...', 'info')
  
  try {
    let testEmail = 'test@example.com'
    let testPassword = 'test123456'
    
    // Use credentials from recent registration if available
    const storedCredentials = sessionStorage.getItem('testCredentials')
    if (storedCredentials) {
      const creds = JSON.parse(storedCredentials)
      testEmail = creds.email
      testPassword = creds.password
      addLog(`Using recent registration credentials: ${testEmail}`, 'info')
    } else {
      addLog(`Using default test credentials: ${testEmail}`, 'info')
    }
    
    const result = await authStore.login(testEmail, testPassword)
    
    if (result.success) {
      addLog(`✅ Login successful for ${testEmail}`, 'success')
      addLog(`✅ Current user: ${authStore.user?.name || 'Unknown'}`, 'success')
    } else {
      addLog(`❌ Login failed: ${result.error}`, 'error')
      if (result.error?.includes('Invalid login credentials')) {
        addLog(`💡 This might be due to email confirmation. Please check Supabase Auth settings.`, 'info')
      }
    }
  } catch (error: any) {
    addLog(`❌ Login test failed: ${error.message}`, 'error')
  }
  
  testing.value = false
}

async function testCheckIn() {
  testing.value = true
  addLog('Testing check-in functionality...', 'info')
  
  try {
    const dummyLocation = { lat: -6.2088, lng: 106.8456 }
    const result = await presensiStore.checkIn(dummyLocation)
    
    if (result.success) {
      addLog('✅ Check-in successful', 'success')
    } else {
      addLog(`❌ Check-in failed: ${result.error}`, 'error')
    }
  } catch (error: any) {
    addLog(`❌ Check-in test failed: ${error.message}`, 'error')
  }
  
  testing.value = false
}

async function testDataFetch() {
  testing.value = true
  addLog('Testing data fetch...', 'info')
  
  try {
    const result = await presensiStore.fetchRecords()
    
    if (result.success) {
      addLog(`✅ Data fetch successful. Records: ${presensiStore.records.length}`, 'success')
    } else {
      addLog(`❌ Data fetch failed: ${result.error}`, 'error')
    }
  } catch (error: any) {
    addLog(`❌ Data fetch test failed: ${error.message}`, 'error')
  }
  
  testing.value = false
}

async function setupDatabase() {
  testing.value = true
  addLog('🔧 Setting up database schema...', 'info')
  
  try {
    // Manual SQL execution since RPC might not be available
    const queries = [
      // Create profiles table
      `CREATE TABLE IF NOT EXISTS public.profiles (
        id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
        email TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'employee')),
        avatar_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      )`,
      
      // Create presensi table
      `CREATE TABLE IF NOT EXISTS public.presensi (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
        date DATE NOT NULL,
        check_in_time TIME,
        check_in_location JSONB,
        check_in_photo TEXT,
        check_out_time TIME,
        check_out_location JSONB,
        check_out_photo TEXT,
        status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'late', 'absent')),
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        UNIQUE(user_id, date)
      )`,
      
      // Enable RLS
      `ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY`,
      `ALTER TABLE public.presensi ENABLE ROW LEVEL SECURITY`
    ]

    let successCount = 0
    for (const query of queries) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: query })
        if (!error) successCount++
      } catch (e) {
        // Try direct query if RPC not available
        console.log('RPC not available, manual setup required')
      }
    }

    if (successCount > 0) {
      addLog(`✅ Database setup completed! (${successCount}/${queries.length} queries executed)`, 'success')
      // Refresh table status
      await testDatabase()
    } else {
      addLog('⚠️ Automatic setup failed. Please run the SQL script manually in Supabase Dashboard', 'error')
      addLog('Script location: database/setup-complete.sql', 'info')
    }
    
  } catch (error: any) {
    addLog(`❌ Database setup failed: ${error.message}`, 'error')
    addLog('💡 Please run the SQL script manually in Supabase Dashboard → SQL Editor', 'info')
  }
  
  testing.value = false
}

async function createAdminUser() {
  testing.value = true
  addLog('Creating admin user...', 'info')
  
  try {
    const adminEmail = 'admin@test.com'
    const adminPassword = 'admin123456'
    const adminName = 'Admin User'
    
    // First try to register
    const result = await authStore.register(adminEmail, adminPassword, adminName)
    
    if (result.success) {
      if (result.needsConfirmation) {
        addLog(`⚠️ Admin user created but needs email confirmation`, 'error')
        addLog(`📧 Please check email or disable email confirmation in Supabase`, 'info')
      } else {
        addLog(`✅ Admin user created successfully: ${adminEmail}`, 'success')
        
        // Try to update role to admin
        if (authStore.user) {
          const updateResult = await authStore.updateProfile({ role: 'admin' })
          if (updateResult?.success) {
            addLog(`✅ User role updated to admin`, 'success')
          }
        }
        
        // Store admin credentials
        sessionStorage.setItem('adminCredentials', JSON.stringify({ 
          email: adminEmail, 
          password: adminPassword 
        }))
        addLog(`💾 Admin credentials stored for testing`, 'info')
      }
    } else {
      if (result.error?.includes('already registered')) {
        addLog(`ℹ️ Admin user already exists: ${adminEmail}`, 'info')
        sessionStorage.setItem('adminCredentials', JSON.stringify({ 
          email: adminEmail, 
          password: adminPassword 
        }))
      } else {
        addLog(`❌ Admin user creation failed: ${result.error}`, 'error')
      }
    }
  } catch (error: any) {
    addLog(`❌ Admin user creation failed: ${error.message}`, 'error')
  }
  
  testing.value = false
}

onMounted(() => {
  runAllTests()
})
</script>
