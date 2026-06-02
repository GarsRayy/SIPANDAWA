import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Droplets, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Jika sudah login, redirect langsung ke dashboard
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/dashboard', { replace: true });
      }
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/setup');
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccess('Akun berhasil dibuat! Cek email untuk konfirmasi, lalu masuk.');
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-sky-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="inline-flex p-4 bg-gradient-to-br from-sky-400 to-blue-600 rounded-2xl shadow-xl shadow-sky-500/30 mb-4">
            <Droplets className="text-white" size={32} />
          </motion.div>
          <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-blue-700">SIPANDAWA</h1>
          <p className="text-slate-500 mt-1 text-sm">Sistem Peringatan Dini Pemantauan Air Desa</p>
        </div>

        <div className="bg-white/70 backdrop-blur-md border border-white/60 shadow-2xl shadow-sky-100/80 rounded-3xl p-8">
          <div className="flex bg-slate-100 rounded-xl p-1 mb-8">
            {['Masuk', 'Daftar'].map((label, i) => (
              <button key={i} onClick={() => { setIsLogin(i === 0); setError(null); setSuccess(null); }}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${(isLogin ? i === 0 : i === 1) ? 'bg-white text-sky-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Alamat Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all text-slate-800 placeholder:text-slate-300" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Kata Sandi</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type={showPass ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full pl-11 pr-12 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all text-slate-800 placeholder:text-slate-300" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-medium">{error}</motion.div>}
              {success && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium">{success}</motion.div>}
            </AnimatePresence>

            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02, y: loading ? 0 : -1 }} whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-sky-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2">
              {loading ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
              {loading ? 'Memproses...' : isLogin ? 'Masuk ke Dashboard' : 'Buat Akun Baru'}
            </motion.button>
          </form>
        </div>
        <p className="text-center text-slate-400 text-xs mt-6">© 2026 SIPANDAWA · Pervasif Computing</p>
      </motion.div>
    </div>
  );
}
