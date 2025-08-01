# 🚀 Quick Setup Guide - Sistem Presensi dengan Supabase

## Step 1: Setup Database di Supabase

1. **Buka Supabase Dashboard**: https://ffsrblyixkkmtigvtgsn.supabase.co
2. **Masuk ke SQL Editor** (ikon terminal di sidebar kiri)
3. **Copy paste script** dari file `database/setup-complete.sql`
4. **Klik RUN** untuk menjalankan setup database

## Step 2: Test Aplikasi

1. **Akses aplikasi**: http://localhost:5173/test
2. **Klik "Run Tests"** untuk cek koneksi database
3. **Pastikan semua status hijau** ✅

## Step 3: Register User Pertama

1. **Akses**: http://localhost:5173/login
2. **Klik "Need an account? Register"**
3. **Isi data**:
   - Name: Admin User
   - Email: admin@example.com
   - Password: admin123456
4. **Klik "Create Account"**

## Step 4: Set User Sebagai Admin

1. **Buka Supabase Dashboard** > Database > Table Editor
2. **Pilih table "profiles"**
3. **Edit user yang baru dibuat**
4. **Ubah "role" dari "employee" ke "admin"**
5. **Save**

## Step 5: Test Complete Workflow

1. **Login** dengan user admin
2. **Akses Dashboard** - harus bisa lihat menu "Laporan" dan "DB Test"
3. **Test Check-in** di menu Presensi
4. **Cek data** di menu Laporan

---

## 🔥 Quick Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Test build
npm run preview
```

## 🧪 Testing URLs

- **Main App**: http://localhost:5173/
- **Login**: http://localhost:5173/login
- **Database Test**: http://localhost:5173/test
- **Dashboard**: http://localhost:5173/dashboard

## ✅ Success Indicators

- [ ] Database test page shows all green ✅
- [ ] User registration works
- [ ] Login redirects to dashboard
- [ ] Admin can see "Laporan" menu
- [ ] Check-in creates record in database
- [ ] Laporan shows data from database

## 🚨 Troubleshooting

**❌ Database connection failed**
→ Run the SQL setup script in Supabase

**❌ Registration fails**
→ Check email confirmation settings in Supabase

**❌ Can't see admin menus**
→ Update user role to 'admin' in profiles table

**❌ Check-in doesn't save**
→ Check RLS policies and user authentication

---

**Status**: Ready to test with real data! 🎉
