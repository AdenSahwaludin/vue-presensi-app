# Deploy ke Netlify

## Manual Upload (Drag & Drop)
1. Buka https://netlify.com
2. Sign up/Login
3. Drag folder `dist` ke Netlify dashboard
4. Set environment variables di Site Settings

## GitHub Deploy (Recommended)
1. Connect GitHub repository
2. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Environment variables sama seperti Vercel

## Redirect Rules
File `_redirects` sudah dibuat otomatis untuk Vue Router.
