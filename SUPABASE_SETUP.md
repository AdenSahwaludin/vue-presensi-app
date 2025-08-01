# Setup Supabase untuk Sistem Presensi

## 1. Persiapan Supabase Project

### a. Buat Project Baru
1. Login ke [Supabase Dashboard](https://supabase.com/dashboard)
2. Klik "New Project"
3. Isi nama project: `presensi-app` atau sesuai keinginan
4. Pilih organization dan password database
5. Klik "Create new project"

### b. Dapatkan API Keys
1. Setelah project selesai dibuat, buka Settings > API
2. Copy `Project URL` dan `anon/public key`
3. Update file `.env` dengan nilai yang benar:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 2. Setup Database Schema

### a. Jalankan SQL Schema
1. Buka Supabase Dashboard > SQL Editor
2. Copy seluruh isi file `database/schema.sql`
3. Paste ke SQL Editor dan klik "Run"
4. Pastikan tidak ada error

### b. Verifikasi Tables
Periksa di Database > Tables bahwa tabel berikut sudah dibuat:
- `profiles` - untuk data user
- `presensi` - untuk data presensi

## 3. Setup Authentication

### a. Enable Email Auth
1. Buka Authentication > Settings
2. Pastikan "Enable email confirmations" sesuai kebutuhan
3. Set redirect URLs jika diperlukan

### b. Test Registration
1. Jalankan aplikasi: `npm run dev`
2. Akses `/login`
3. Coba register user baru
4. Periksa di Authentication > Users apakah user berhasil dibuat

## 4. Konfigurasi Row Level Security (RLS)

Schema sudah include RLS policies, tapi verifikasi di Database > Policies:

### Policies untuk `profiles`:
- Users can view own profile
- Users can update own profile
- Admin can view all profiles
- Enable insert for authenticated users only

### Policies untuk `presensi`:
- Users can view own presensi
- Users can insert own presensi
- Users can update own presensi
- Admin can view all presensi
- Admin can delete presensi

## 5. Setup Admin User

### a. Cara Manual (Setelah register via app):
1. Register user normal via aplikasi
2. Buka Database > Table Editor > profiles
3. Edit user yang ingin dijadikan admin
4. Ubah `role` dari `employee` ke `admin`

### b. Cara SQL:
```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'admin@example.com';
```

## 6. Testing Aplikasi

### a. Test User Registration
1. Register user baru
2. Periksa apakah profile dibuat otomatis
3. Login dengan user tersebut

### b. Test Admin Features
1. Login sebagai admin
2. Akses halaman `/laporan`
3. Pastikan bisa melihat semua data presensi

### c. Test Employee Features
1. Login sebagai employee
2. Akses halaman `/presensi`
3. Test check-in dan check-out
4. Periksa data tersimpan di database

## 7. Troubleshooting

### Error: "Failed to fetch"
- Periksa VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY
- Pastikan project Supabase masih aktif
- Check network connection

### Error: "Row Level Security policy violation"
- Periksa RLS policies sudah dibuat dengan benar
- Pastikan user sudah login
- Verify user role untuk admin features

### Error: "relation does not exist"
- Pastikan schema.sql sudah dijalankan
- Check table names dan column names
- Refresh Supabase dashboard

### Camera/Location Issues
- Pastikan aplikasi dijalankan dengan HTTPS (production)
- Test dengan localhost dulu untuk development
- Check browser permissions untuk camera dan location

## 8. Production Deployment

### a. Environment Variables
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_NAME=Sistem Presensi
VITE_OFFICE_LAT=-6.200000
VITE_OFFICE_LNG=106.816666
VITE_OFFICE_RADIUS=100
```

### b. Build & Deploy
```bash
npm run build
# Deploy dist folder ke hosting (Vercel, Netlify, etc.)
```

### c. Security Checklist
- [ ] RLS policies aktif
- [ ] API keys tidak ter-expose di client
- [ ] HTTPS enabled untuk production
- [ ] Camera dan location permissions configured
- [ ] Admin users properly configured

## 9. Backup & Recovery

### Database Backup
```sql
-- Export data
SELECT * FROM profiles;
SELECT * FROM presensi;
```

### Schema Backup
Copy seluruh schema dari Database > Schema Visualizer

---

**Catatan:** Simpan credentials Supabase dengan aman dan jangan commit file `.env` ke git repository.
