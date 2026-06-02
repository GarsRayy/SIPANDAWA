# 💧 SIPANDAWA - Sistem Pemantauan Kualitas Air Terpadu

**SIPANDAWA** adalah platform *Software as a Service (SaaS)* dan ekosistem *Internet of Things (IoT)* modern untuk memantau kualitas air (TDS & Suhu) secara real-time. Dibangun dengan antarmuka *Glassmorphism* yang elegan, fitur *Magic UX* untuk konfigurasi perangkat yang *seamless*, serta integrasi penuh dengan cloud backend untuk keandalan tingkat produksi.

---

## ✨ Fitur Utama

- 🚀 **Real-Time Telemetry** — Data TDS & Suhu diperbarui secara real-time via Supabase WebSocket tanpa perlu refresh halaman.
- 🪄 **The Magic UX Device Setup** — Alur integrasi perangkat IoT yang mulus. Sistem otomatis mendeteksi ketika perangkat keras terhubung dan siap memancarkan data.
- 📱 **WhatsApp Alerts** — Notifikasi via WhatsApp (melalui Fonnte) untuk pelaporan rutin dan peringatan anomali kualitas air buruk.
- 🔐 **Secure Authentication** — Sistem Login & Registrasi yang aman ditenagai oleh Supabase Auth dengan **Protected Routes**.
- 🗺️ **Web GIS Interaktif** — Pemetaan lokasi sensor di atas OpenStreetMap dengan marker berdenyut dan fitur geolokasi.
- 🤖 **AI Prediction** — Analisis tren TDS otomatis menggunakan regresi linear untuk memprediksi kualitas air ke depan.
- 📊 **Automated PDF Reporting** — Ekspor laporan profesional lengkap dengan tabel data dalam satu klik.
- 🎨 **Premium UI/UX** — Antarmuka modern bergaya *Glassmorphism* dengan micro-animations dan dark mode elements.

## 🛠️ Teknologi yang Digunakan

### Frontend (Web Dashboard)
| Teknologi | Keterangan |
|-----------|------------|
| React 18 + TypeScript | Framework UI |
| Vite | Build tool & dev server |
| Tailwind CSS | Styling utility-first |
| Framer Motion | Animasi & transisi |
| Recharts | Grafik & visualisasi data |
| React Leaflet | Peta interaktif (Web GIS) |
| jsPDF | Ekspor laporan PDF |
| Supabase | Backend-as-a-Service (Auth, Database, Realtime) |

### Hardware (IoT Node)
| Komponen | Keterangan |
|----------|------------|
| ESP32 | Microcontroller utama |
| TDS Sensor (Analog) | Mengukur Total Dissolved Solids |
| DS18B20 | Sensor suhu air (OneWire) |
| LCD I2C 16x2 | Display lokal |
| WiFiManager | Captive portal untuk setup WiFi |
| FonnteDuino | Notifikasi WhatsApp via Fonnte API |

---

## 📂 Struktur Proyek

```text
SIPANDAWA/
├── src/
│   ├── components/
│   │   └── ProtectedRoute.tsx   # Auth guard untuk halaman privat
│   ├── pages/
│   │   ├── LandingPage.tsx      # Halaman utama publik
│   │   ├── LoginPage.tsx        # Login & Register (Supabase Auth)
│   │   ├── DeviceSetupPage.tsx  # Magic UX setup perangkat IoT
│   │   └── Dashboard.tsx        # Dashboard monitoring real-time
│   ├── supabaseClient.ts        # Konfigurasi klien Supabase
│   ├── App.tsx                  # Routing dengan Protected Routes
│   └── main.tsx                 # Entry point aplikasi
├── code.cpp                     # Firmware ESP32 (Arduino/PlatformIO)
├── vercel.json                  # Konfigurasi deploy Vercel (SPA routing)
├── .env                         # Environment variables (TIDAK di-push)
└── .gitignore
```

---

## 🚀 Panduan Instalasi

### Web Dashboard

1. **Clone Repository**
   ```bash
   git clone https://github.com/GarsRayy/SIPANDAWA.git
   cd SIPANDAWA
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variables**
   Buat file `.env` di root directory proyek:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```

4. **Jalankan Development Server**
   ```bash
   npm run dev
   ```
   Buka `http://localhost:5173` di browser.

5. **Build untuk Production**
   ```bash
   npm run build
   ```

### Deploy ke Vercel

1. Push repository ke GitHub.
2. Buka [vercel.com](https://vercel.com) → Import project dari GitHub.
3. Tambahkan **Environment Variables** (`VITE_SUPABASE_URL` dan `VITE_SUPABASE_PUBLISHABLE_KEY`) di pengaturan Vercel.
4. Klik **Deploy** — selesai!

---

## 🔌 Panduan Setup Perangkat Keras (ESP32)

### Wiring LCD I2C ke ESP32

| Pin LCD I2C | Pin ESP32 |
|-------------|-----------|
| GND         | GND       |
| VCC         | 5V / VIN  |
| SDA         | GPIO 21   |
| SCL         | GPIO 22   |

### Konfigurasi Firmware

1. Buka `code.cpp` menggunakan **Arduino IDE** atau **PlatformIO**.
2. Install library: `WiFiManager`, `DallasTemperature`, `OneWire`, `LiquidCrystal_I2C`, `FonnteDuino`.
3. **Ganti placeholder** pada kode dengan kredensial Anda:
   ```cpp
   // Supabase
   const String supabase_url = "https://YOUR_PROJECT_ID.supabase.co/rest/v1/water_quality_logs";
   const String supabase_key = "YOUR_SUPABASE_ANON_KEY";

   // Fonnte (WhatsApp)
   FonnteDuino fonnte("YOUR_FONNTE_TOKEN");

   // Nomor HP tujuan notifikasi
   fonnte.sendMessage("YOUR_PHONE_NUMBER", pesan);
   ```
4. **Compile & Upload** firmware ke board ESP32.
5. Saat ESP32 pertama kali dinyalakan, sambungkan ke jaringan WiFi `Setup-SIPANDAWA` melalui *captive portal* untuk mengatur koneksi internet.

### Reset WiFi
Tekan dan tahan tombol **BOOT** (GPIO 0) selama 3 detik untuk menghapus kredensial WiFi dan masuk kembali ke mode setup.

---

## 🏗️ Arsitektur Sistem

```
┌──────────────┐     HTTP POST      ┌──────────────────┐     WebSocket     ┌──────────────┐
│   ESP32 +    │  ──────────────►   │    Supabase      │  ──────────────►  │   Vercel     │
│   Sensors    │    setiap 1 min    │  (PostgreSQL +   │    real-time      │  (React App) │
│   (IoT Node) │                    │   Realtime)      │                   │  Dashboard   │
└──────────────┘                    └──────────────────┘                   └──────────────┘
       │                                    │
       │  WhatsApp (Fonnte)                 │  Supabase Auth
       ▼                                    ▼
  ┌──────────┐                        ┌──────────┐
  │   User   │                        │   User   │
  │   (HP)   │                        │ (Browser)│
  └──────────┘                        └──────────┘
```

---

## 🔒 Keamanan

- ✅ **Protected Routes** — Halaman Dashboard dan Device Setup hanya bisa diakses oleh user yang sudah login.
- ✅ **Supabase Auth** — Autentikasi email & password yang aman.
- ✅ **Environment Variables** — API keys disimpan di `.env` (tidak di-push ke GitHub).
- ✅ **`.gitignore`** — File sensitif (`.env`, `node_modules`, `dist`) otomatis diabaikan oleh Git.

---

## 📄 Lisensi

Proyek ini dikembangkan oleh **Kelompok 3 (KSI RC)** dan bersifat *open-source* untuk keperluan edukasi Pervasif Computing dan pengembangan IoT tingkat lanjut.

© 2026 SIPANDAWA · Pervasif Computing
