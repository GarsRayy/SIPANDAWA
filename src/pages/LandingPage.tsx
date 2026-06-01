import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Droplets, Activity, Map, FileText, Wifi, ChevronRight, Shield, Zap } from 'lucide-react';

const features = [
  { icon: <Activity size={24} />, title: 'Live Telemetry', desc: 'Data TDS & Suhu diperbarui secara real-time via Supabase WebSocket tanpa perlu refresh halaman.' },
  { icon: <Map size={24} />, title: 'Web GIS Interaktif', desc: 'Petakan lokasi sensor secara visual di atas peta OpenStreetMap dengan marker berdenyut.' },
  { icon: <Zap size={24} />, title: 'AI Prediction', desc: 'Analisis tren otomatis menggunakan regresi linear untuk memprediksi kualitas air ke depan.' },
  { icon: <FileText size={24} />, title: 'Automated Reporting', desc: 'Ekspor laporan PDF profesional lengkap dengan tabel data dan kop surat hanya dalam satu klik.' },
  { icon: <Wifi size={24} />, title: 'Zero-Config IoT', desc: 'Hubungkan ESP32 ke jaringan WiFi manapun melalui Captive Portal tanpa menyentuh kode.' },
  { icon: <Shield size={24} />, title: 'Aman & Terenkripsi', desc: 'Dibangun di atas Supabase dengan autentikasi penuh dan enkripsi data end-to-end.' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 }
};

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 overflow-x-hidden">
      {/* Decorative blobs */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-sky-200/40 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-48 w-[500px] h-[500px] bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-[400px] h-[400px] bg-sky-300/20 rounded-full blur-3xl" />
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-sky-100/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-sky-400 to-blue-600 rounded-xl shadow-lg shadow-sky-200">
              <Droplets className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-blue-700">SIPANDAWA</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="text-slate-600 hover:text-sky-600 font-medium transition-colors text-sm"
            >
              Masuk
            </button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-sky-500/30 hover:shadow-sky-500/50 transition-shadow"
            >
              Mulai Gratis <ChevronRight size={16} />
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-24 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center gap-6"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 bg-sky-100 border border-sky-200 text-sky-700 rounded-full text-sm font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Sistem Pemantauan Air Desa Generasi Baru
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-black text-slate-800 leading-tight max-w-4xl">
            Pantau Kualitas Air Desa
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-blue-600">
              Secara Real-Time
            </span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-xl text-slate-500 max-w-2xl leading-relaxed">
            SIPANDAWA menghubungkan sensor IoT langsung ke dashboard web cerdas. Pantau TDS, suhu, dan kualitas air desa Anda dari mana saja, kapan saja.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mt-4">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/login')}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white px-8 py-4 rounded-2xl text-lg font-bold shadow-xl shadow-sky-500/30 hover:shadow-sky-500/50 transition-all"
            >
              Coba Dashboard Sekarang <ChevronRight size={20} />
            </motion.button>
            <button className="flex items-center justify-center gap-2 bg-white/70 backdrop-blur-sm border border-slate-200 text-slate-600 px-8 py-4 rounded-2xl text-lg font-medium hover:bg-white hover:border-slate-300 transition-all">
              Pelajari Lebih Lanjut
            </button>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            variants={itemVariants}
            className="mt-16 w-full max-w-4xl bg-white/60 backdrop-blur-md border border-white/80 shadow-2xl shadow-sky-100/80 rounded-3xl p-8"
          >
            <div className="grid grid-cols-3 gap-6 mb-8">
              {[
                { label: 'Total Dissolved Solids', value: '247.5', unit: 'ppm', color: 'sky', icon: <Droplets size={22} /> },
                { label: 'Suhu Air', value: '26.8', unit: '°C', color: 'amber', icon: <Activity size={22} /> },
                { label: 'Status Kualitas', value: 'Ideal', unit: '', color: 'emerald', icon: <Shield size={22} /> },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.15 }}
                  className="bg-white/70 rounded-2xl p-5 border border-slate-100"
                >
                  <div className={`w-10 h-10 rounded-xl bg-${item.color}-50 flex items-center justify-center text-${item.color}-500 mb-3`}>
                    {item.icon}
                  </div>
                  <p className="text-xs text-slate-400 font-medium mb-1">{item.label}</p>
                  <p className="text-2xl font-black text-slate-800">{item.value} <span className="text-sm font-normal text-slate-400">{item.unit}</span></p>
                </motion.div>
              ))}
            </div>
            {/* Fake chart bars */}
            <div className="h-24 flex items-end gap-1.5">
              {[40,55,48,62,70,58,80,75,92,85,78,95,88,72,60,82,90,97,85,88].map((h,i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: 0.8 + i * 0.03, duration: 0.5, ease: 'easeOut' }}
                  className="flex-1 bg-gradient-to-t from-sky-400 to-sky-200 rounded-t-sm opacity-80"
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-black text-slate-800 mb-4">Semua yang Anda Butuhkan</h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">Platform lengkap untuk memantau, menganalisis, dan melaporkan kualitas air desa Anda.</p>
        </motion.div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((f, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              whileHover={{ y: -6 }}
              className="bg-white/60 backdrop-blur-md border border-white/60 shadow-xl shadow-sky-100/50 rounded-2xl p-6"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center text-sky-600 mb-4">
                {f.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">{f.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-3xl p-12 text-center text-white shadow-2xl shadow-sky-500/30"
        >
          <h2 className="text-4xl font-black mb-4">Siap Memulai?</h2>
          <p className="text-sky-100 text-lg mb-8 max-w-xl mx-auto">Hubungkan sensor IoT Anda dan mulai pantau kualitas air desa dalam hitungan menit.</p>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/login')}
            className="bg-white text-sky-600 px-10 py-4 rounded-2xl text-lg font-black shadow-xl hover:shadow-2xl transition-all"
          >
            Mulai Sekarang — Gratis
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8 text-center text-slate-400 text-sm">
        © 2026 SIPANDAWA · Sistem Peringatan Dini dan Pemantauan Air Desa · Pervasif Computing
      </footer>
    </div>
  );
}
