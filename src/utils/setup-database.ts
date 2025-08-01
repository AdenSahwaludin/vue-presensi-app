import { supabase } from '@/lib/supabase'

export async function setupDatabase() {
  try {
    console.log('🔧 Setting up database...')
    
    // SQL script untuk setup database
    const setupSQL = `
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'employee')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create presensi table
CREATE TABLE IF NOT EXISTS public.presensi (
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
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presensi ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own presensi" ON public.presensi;
DROP POLICY IF EXISTS "Users can insert own presensi" ON public.presensi;
DROP POLICY IF EXISTS "Users can update own presensi" ON public.presensi;
DROP POLICY IF EXISTS "Admin can view all presensi" ON public.presensi;
DROP POLICY IF EXISTS "Admin can delete presensi" ON public.presensi;

-- Create policies for profiles table
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users only" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Admin can view all profiles
CREATE POLICY "Admin can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policies for presensi table
CREATE POLICY "Users can view own presensi" ON public.presensi
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own presensi" ON public.presensi
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own presensi" ON public.presensi
  FOR UPDATE USING (auth.uid() = user_id);

-- Admin can view all presensi records
CREATE POLICY "Admin can view all presensi" ON public.presensi
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin can delete presensi records
CREATE POLICY "Admin can delete presensi" ON public.presensi
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create function to handle updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS handle_updated_at_profiles ON public.profiles;
DROP TRIGGER IF EXISTS handle_updated_at_presensi ON public.presensi;

CREATE TRIGGER handle_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_presensi
  BEFORE UPDATE ON public.presensi
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    'employee'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_presensi_user_id ON public.presensi(user_id);
CREATE INDEX IF NOT EXISTS idx_presensi_date ON public.presensi(date);
CREATE INDEX IF NOT EXISTS idx_presensi_user_date ON public.presensi(user_id, date);
`

    // Execute setup SQL
    const { error } = await supabase.rpc('exec_sql', { sql: setupSQL })
    
    if (error) {
      console.error('Database setup error:', error)
      throw error
    }

    console.log('✅ Database setup completed successfully!')
    return { success: true }
    
  } catch (error: any) {
    console.error('Database setup failed:', error)
    return { 
      success: false, 
      error: error.message || 'Database setup failed' 
    }
  }
}

export async function checkDatabaseSetup() {
  try {
    // Check if tables exist
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('count', { count: 'exact' })
      .limit(1)

    const { data: presensi, error: presensiError } = await supabase
      .from('presensi')
      .select('count', { count: 'exact' })
      .limit(1)

    return {
      profiles: !profilesError,
      presensi: !presensiError,
      errors: {
        profiles: profilesError?.message,
        presensi: presensiError?.message
      }
    }
  } catch (error) {
    console.error('Database check error:', error)
    return {
      profiles: false,
      presensi: false,
      errors: {
        profiles: 'Connection error',
        presensi: 'Connection error'
      }
    }
  }
}
