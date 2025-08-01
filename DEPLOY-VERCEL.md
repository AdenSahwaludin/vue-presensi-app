# Deploy ke Vercel

## Setup GitHub Repository
1. Buat repository baru di GitHub
2. Push code ke GitHub:

```bash
git init
git add .
git commit -m "Initial commit - Vue Presensi App"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO-NAME.git
git push -u origin main
```

## Deploy ke Vercel
1. Buka https://vercel.com
2. Sign in dengan GitHub
3. Klik "New Project"
4. Import repository GitHub Anda
5. Konfigurasi:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

## Environment Variables
Tambahkan di Vercel Dashboard:
- `VITE_SUPABASE_URL` = `https://ffsrblyixkkmtigvtgsn.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Update Supabase Site URL
Di Supabase Dashboard → Authentication → URL Configuration:
- Site URL: `https://your-app.vercel.app`
- Redirect URLs: `https://your-app.vercel.app/**`

## Auto Deploy
Setiap push ke main branch akan auto deploy!
