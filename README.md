# 💧 SIPANDAWA - Sistem Pemantauan Kualitas Air Terpadu

![SIPANDAWA Banner](src/assets/hero.png)

**SIPANDAWA** adalah platform *Software as a Service (SaaS)* dan ekosistem *Internet of Things (IoT)* modern untuk memantau kualitas air (TDS & Suhu) secara real-time. Dibangun dengan antarmuka *Glassmorphism* yang elegan, fitur *Magic UX* untuk konfigurasi perangkat yang *seamless*, serta integrasi penuh dengan cloud backend untuk keandalan tingkat produksi.

---

## ✨ Fitur Utama

- 🚀 **Real-Time Telemetry**: Memantau kualitas air (TDS dalam satuan `ppm` dan Suhu dalam `°C`) yang selalu diperbarui secara real-time tanpa perlu me-refresh halaman menggunakan konektivitas WebSocket Supabase.
- 🪄 **The Magic UX Device Setup**: Alur integrasi perangkat IoT yang sangat mulus (plug-and-play). Sistem otomatis mendeteksi ketika perangkat keras terhubung dan siap memancarkan data.
- 📱 **WhatsApp Alerts**: Notifikasi terotomatisasi yang dikirimkan via WhatsApp (melalui Fonnte) untuk pelaporan rutin atau peringatan anomali (kualitas air buruk).
- 🔐 **Secure Authentication**: Sistem Login & Registrasi yang aman ditenagai oleh Supabase Auth.
- 🎨 **Premium UI/UX Design**: Antarmuka modern bergaya *Glassmorphism* yang dikembangkan menggunakan Tailwind CSS dan komponen interaktif.

## 🛠️ Teknologi yang Digunakan

### Frontend (Web Dashboard)
- **Framework:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + Lucide Icons
- **Backend/BaaS:** Supabase (PostgreSQL, Auth, Realtime Database)
- **Routing:** React Router

### Hardware (IoT Node)
- **Microcontroller:** ESP32
- **Sensors:** Analog TDS Sensor, DS18B20 (Temperature Sensor)
- **Libraries:** WiFiManager, DallasTemperature, OneWire, FonnteDuino
- **Communication:** HTTP POST (to Supabase REST API)

---

## 📂 Struktur Proyek

```text
SIPANDAWA/
├── src/                  # Source code React Frontend (Web App)
│   ├── assets/           # Asset statis (gambar, icon)
│   ├── components/       # Komponen UI Reusable
│   ├── pages/            # Halaman utama (Landing, Dashboard, Login, Setup)
│   └── supabaseClient.ts # Konfigurasi Klien Supabase
├── code.cpp              # Source code ESP32 (Firmware IoT)
└── .gitignore            # Git ignore configuration
```

## 🚀 Panduan Instalasi (Web Dashboard)

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
   Buat file `.env` di root directory proyek, lalu tambahkan *credentials* dari project Supabase Anda:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```

4. **Jalankan Development Server**
   ```bash
   npm run dev
   ```
   Buka `http://localhost:5173` di browser Anda untuk melihat aplikasi secara lokal.

## 🔌 Panduan Setup Perangkat Keras (ESP32)

1. Buka file `code.cpp` menggunakan **Arduino IDE** atau **PlatformIO**.
2. Pastikan library pendukung seperti `WiFiManager`, `DallasTemperature`, dan `FonnteDuino` telah terinstal di *Library Manager*.
3. Ubah bagian kredensial pada *source code* dengan data milik Anda:
   - `YOUR_SUPABASE_URL` dan `YOUR_SUPABASE_KEY` (Supabase API)
   - `YOUR_FONNTE_TOKEN` dan `YOUR_PHONE_NUMBER` (Untuk notifikasi via WhatsApp)
4. Lakukan *Compile* & *Upload* firmware ke board ESP32 Anda.
5. Saat ESP32 pertama kali dinyalakan, sambungkan *smartphone* atau PC Anda ke jaringan WiFi `Setup-SIPANDAWA` untuk mengatur koneksi internet lokal melalui *captive portal*.

---

## 📄 Lisensi

Proyek ini dikembangkan oleh Kelompok 3 (KSI RC) dan bersifat *open-source* untuk keperluan edukasi dan pengembangan IoT tingkat lanjut.
