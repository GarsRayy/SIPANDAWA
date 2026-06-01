import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Droplets, Wifi, CheckCircle2, ArrowRight, Smartphone, Signal } from 'lucide-react';

type SetupPhase = 'waiting' | 'success';

// Animated radar ring
function RadarPulse() {
  return (
    <div className="relative flex items-center justify-center w-52 h-52">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border-2 border-sky-400/60"
          initial={{ width: 60, height: 60, opacity: 0.8 }}
          animate={{ width: 210, height: 210, opacity: 0 }}
          transition={{ duration: 2.4, delay: i * 0.8, repeat: Infinity, ease: 'easeOut' }}
        />
      ))}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 rounded-full border-2 border-dashed border-sky-300/50"
      />
      <div className="relative z-10 w-24 h-24 bg-gradient-to-br from-sky-400 to-blue-600 rounded-full flex items-center justify-center shadow-2xl shadow-sky-500/40">
        <Signal className="text-white" size={40} />
      </div>
    </div>
  );
}

// Success explosion
function SuccessAnimation() {
  return (
    <div className="relative flex items-center justify-center w-52 h-52">
      {[0, 1].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-emerald-400/20"
          initial={{ width: 96, height: 96, opacity: 1 }}
          animate={{ width: 220, height: 220, opacity: 0 }}
          transition={{ duration: 1, delay: i * 0.3, ease: 'easeOut' }}
        />
      ))}
      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 18 }}
        className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/40 z-10"
      >
        <CheckCircle2 className="text-white" size={48} />
      </motion.div>
    </div>
  );
}

const steps = [
  { icon: <Wifi size={20} />, title: 'Aktifkan WiFi di HP', desc: 'Buka pengaturan WiFi pada HP Anda.' },
  { icon: <Smartphone size={20} />, title: 'Sambungkan ke "Setup-SIPANDAWA"', desc: 'Pilih jaringan "Setup-SIPANDAWA" yang dipancarkan alat ESP32.' },
  { icon: <Signal size={20} />, title: 'Masukkan Kata Sandi WiFi Lokal', desc: 'Portal akan terbuka otomatis. Pilih WiFi rumah Anda dan masukkan kata sandi.' },
  { icon: <CheckCircle2 size={20} />, title: 'Tunggu Konfirmasi Otomatis', desc: 'Halaman ini akan berubah otomatis begitu alat berhasil terhubung.' },
];

export default function DeviceSetupPage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<SetupPhase>('waiting');
  const [showModal, setShowModal] = useState(false);
  const [lastLog, setLastLog] = useState<any>(null);

  useEffect(() => {
    // Subscribe to real-time inserts on water_quality_logs
    const channel = supabase
      .channel('device-setup-watch')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'water_quality_logs' }, (payload) => {
        setLastLog(payload.new);
        setPhase('success');
        setTimeout(() => setShowModal(true), 400);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // For demo: simulate device connecting
  const simulateConnect = () => {
    setPhase('success');
    setTimeout(() => setShowModal(true), 400);
    setLastLog({ tds_value: 214.5, temperature: 26.8, status: 'Ideal' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 flex flex-col relative overflow-hidden">
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-sky-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-blue-200/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <nav className="sticky top-0 z-40 backdrop-blur-md bg-white/70 border-b border-sky-100/80">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-sky-400 to-blue-600 rounded-xl shadow-md shadow-sky-200">
              <Droplets className="text-white" size={18} />
            </div>
            <span className="font-bold text-slate-700">SIPANDAWA</span>
          </div>
          <button onClick={() => navigate('/dashboard')} className="text-sm font-medium text-slate-500 hover:text-sky-600 transition-colors">
            Lewati Setup →
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-16 w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-sky-100 text-sky-700 text-sm font-semibold rounded-full border border-sky-200 mb-4">
            Langkah 1 dari 1 — Konfigurasi Perangkat
          </span>
          <h1 className="text-4xl font-black text-slate-800 mb-3">Hubungkan Alat Sensor Anda</h1>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            Ikuti langkah di bawah. Halaman ini akan <strong>berubah otomatis</strong> begitu alat ESP32 berhasil terhubung ke internet.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Left: Radar animation */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="bg-white/70 backdrop-blur-md border border-white/60 shadow-2xl shadow-sky-100 rounded-3xl p-12 flex flex-col items-center gap-6">
              <AnimatePresence mode="wait">
                {phase === 'waiting' ? (
                  <motion.div key="radar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                    <RadarPulse />
                  </motion.div>
                ) : (
                  <motion.div key="success" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring' }}>
                    <SuccessAnimation />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="text-center">
                <AnimatePresence mode="wait">
                  {phase === 'waiting' ? (
                    <motion.div key="w-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <p className="font-bold text-slate-700 text-lg">Menunggu Sinyal Perangkat</p>
                      <p className="text-slate-400 text-sm mt-1">Dashboard akan terhubung secara otomatis...</p>
                      <div className="flex justify-center gap-1.5 mt-4">
                        {[0,1,2].map(i => (
                          <motion.div key={i} className="w-2 h-2 bg-sky-400 rounded-full"
                            animate={{ y: [-4, 0, -4] }} transition={{ duration: 0.8, delay: i * 0.15, repeat: Infinity }} />
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="s-text" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <p className="font-bold text-emerald-600 text-lg">Perangkat Terdeteksi!</p>
                      <p className="text-slate-400 text-sm mt-1">Memuat modal konfirmasi...</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Simulate button for demo */}
            {phase === 'waiting' && (
              <button onClick={simulateConnect}
                className="text-xs text-slate-400 hover:text-sky-500 underline underline-offset-2 transition-colors">
                [Demo] Simulasikan perangkat terhubung
              </button>
            )}
          </motion.div>

          {/* Right: Steps */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col gap-4"
          >
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-start gap-4 bg-white/70 backdrop-blur-md border border-white/60 shadow-lg shadow-sky-100/50 rounded-2xl p-5"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm ${i < 3 ? 'bg-sky-100 text-sky-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  {i + 1}
                </div>
                <div>
                  <p className="font-bold text-slate-800 mb-0.5">{step.title}</p>
                  <p className="text-slate-500 text-sm">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>

      {/* Success Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[500] p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.7, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 250, damping: 22 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl p-10 max-w-sm w-full text-center border border-emerald-100"
            >
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/30">
                  <CheckCircle2 className="text-white" size={44} />
                </div>
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-2">Perangkat Terhubung! ✅</h2>
              <p className="text-slate-500 text-sm mb-6">
                Data perdana berhasil diterima dari sensor ESP32.
              </p>
              {lastLog && (
                <div className="grid grid-cols-3 gap-3 mb-8">
                  {[
                    { label: 'TDS', value: `${Number(lastLog.tds_value).toFixed(1)} ppm` },
                    { label: 'Suhu', value: `${Number(lastLog.temperature).toFixed(1)} °C` },
                    { label: 'Status', value: lastLog.status },
                  ].map((item, i) => (
                    <div key={i} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <p className="text-xs text-slate-400 mb-1">{item.label}</p>
                      <p className="font-bold text-slate-700 text-sm">{item.value}</p>
                    </div>
                  ))}
                </div>
              )}
              <motion.button
                whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/dashboard')}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-500/30 text-base"
              >
                Buka Dashboard Sekarang <ArrowRight size={20} />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
