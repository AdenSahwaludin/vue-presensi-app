# Sistem Presensi

Aplikasi sistem presensi berbasis web menggunakan Vue 3, TypeScript, dan Tailwind CSS.

## Fitur

### 🔐 Autentikasi

- Login dengan email dan password
- Session management dengan localStorage
- Role-based access (Admin/Employee)

### 📍 Presensi

- Check-in/check-out dengan lokasi GPS
- Validasi radius lokasi kerja
- Capture foto selfie untuk verifikasi
- QR Code scanner untuk presensi
- Riwayat presensi real-time

### 📊 Dashboard

- Overview statistik presensi
- Status kehadiran hari ini
- Grafik kehadiran mingguan/bulanan
- Quick actions untuk presensi

### 📋 Laporan (Admin Only)

- Laporan kehadiran semua karyawan
- Filter berdasarkan tanggal, department, status
- Export ke Excel/PDF
- Statistik kehadiran dan keterlambatan

### 🔔 Notifikasi

- Reminder presensi otomatis
- Notifikasi push browser
- Alert untuk keterlambatan

## Tech Stack

- **Frontend**: Vue 3 + TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Pinia
- **Router**: Vue Router 4
- **Build Tool**: Vite
- **Icons**: Lucide Vue
- **Date Handling**: date-fns
- **HTTP Client**: Axios
- **File Export**: xlsx, file-saver
- **QR Code**: qrcode library
- **Testing**: Vitest + Vue Test Utils

## Setup Proyek

### Prerequisites

- Node.js (^20.19.0 || >=22.12.0)
- npm atau yarn

### Installation

```bash
# Clone repository
git clone <repository-url>
cd presensi

# Install dependencies
npm install

# Setup environment variables (opsional)
cp .env.example .env
```

### Development

```bash
# Start development server
npm run dev

# Build untuk production
npm run build

# Preview build
npm run preview

# Run tests
npm run test:unit

# Lint code
npm run lint

# Format code
npm run format
```

## Konfigurasi

### Environment Variables

Buat file `.env` di root project:

```env
VITE_APP_TITLE=Sistem Presensi
VITE_API_BASE_URL=http://localhost:3000/api
VITE_OFFICE_LAT=-6.200000
VITE_OFFICE_LNG=106.816666
VITE_OFFICE_RADIUS=100
```

### Konfigurasi Lokasi Kantor

Update koordinat kantor di `src/services/location.ts`:

```typescript
const OFFICE_LOCATION = {
  lat: -6.2, // Latitude kantor
  lng: 106.816666, // Longitude kantor
  radius: 100, // Radius dalam meter
}
```

## Struktur Project

```
src/
├── components/          # Komponen reusable
│   └── AppLayout.vue   # Layout utama aplikasi
├── services/           # Business logic services
│   ├── auth.ts         # Authentication service
│   ├── camera.ts       # Camera/photo capture
│   ├── export.ts       # Export data ke file
│   ├── location.ts     # GPS location service
│   └── notification.ts # Push notifications
├── stores/             # Pinia stores
│   ├── auth.ts         # Auth state management
│   ├── counter.ts      # Counter example
│   └── presensi.ts     # Presensi state management
├── views/              # Halaman aplikasi
│   ├── DashboardView.vue
│   ├── LoginView.vue
│   ├── PresensiView.vue
│   └── LaporanView.vue
├── router/             # Vue router config
├── assets/             # Static assets
└── __tests__/          # Unit tests
```

## Fitur Detail

### 1. Login System

- Email: admin@example.com / Password: admin123 (Admin)
- Email: user@example.com / Password: user123 (Employee)

### 2. Presensi Features

- **GPS Location**: Validasi lokasi dalam radius kantor
- **Photo Capture**: Ambil foto selfie untuk verifikasi
- **QR Scanner**: Scan QR code untuk presensi cepat
- **Time Tracking**: Otomatis tracking waktu masuk/keluar

### 3. Dashboard Analytics

- Statistik kehadiran real-time
- Grafik trends kehadiran
- Status presensi hari ini
- Quick actions

### 4. Admin Features

- Kelola data karyawan
- Generate laporan comprehensive
- Export data ke berbagai format
- Setting konfigurasi sistem

## API Integration

Aplikasi ini siap untuk integrasi dengan backend API. Konfigurasi endpoint di:

- `src/services/` - untuk service calls
- `VITE_API_BASE_URL` - base URL API

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

**Note**: Fitur camera dan geolocation membutuhkan HTTPS di production.

## Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.
