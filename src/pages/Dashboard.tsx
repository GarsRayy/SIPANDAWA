import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { 
  Activity, Droplets, Thermometer, AlertTriangle, Download, 
  Settings, LayoutDashboard, Bell, Map as MapIcon, Crosshair, Sparkles, LogOut, Menu, X
} from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { format, subDays, isAfter } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Fix Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Interactive Control to find user's current browser location
function LocateControl() {
  const map = useMap();
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const [locating, setLocating] = useState(false);

  const handleLocate = () => {
    setLocating(true);
    map.locate({ setView: true, maxZoom: 16 });
  };

  useEffect(() => {
    const onLocationFound = (e: L.LocationEvent) => {
      setLocating(false);
      setPosition(e.latlng);
    };

    const onLocationError = (e: L.ErrorEvent) => {
      setLocating(false);
      alert("Gagal mengambil lokasi. Pastikan izin lokasi browser Anda aktif dan menggunakan localhost/HTTPS: " + e.message);
    };

    map.on('locationfound', onLocationFound);
    map.on('locationerror', onLocationError);

    return () => {
      map.off('locationfound', onLocationFound);
      map.off('locationerror', onLocationError);
    };
  }, [map]);

  return (
    <>
      <button 
        onClick={handleLocate}
        className="absolute bottom-6 right-6 z-[400] flex items-center gap-2 bg-white hover:bg-sky-50 text-sky-600 border border-sky-100 font-bold px-4 py-3 rounded-xl shadow-xl transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95 focus:outline-none"
      >
        <Crosshair className={`w-5 h-5 ${locating ? 'animate-spin' : ''}`} />
        {locating ? 'Mencari...' : 'Cari Lokasi Saya'}
      </button>
      {position && (
        <Marker position={position}>
          <Popup>Anda berada di sini</Popup>
        </Marker>
      )}
    </>
  );
}

const CircularGauge = ({ value, max, unit, label, icon: Icon, colorClass, gradientClass }: any) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-32 h-32 flex-shrink-0 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90 drop-shadow-sm" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
          <motion.circle 
            cx="50" cy="50" r={radius} 
            stroke="currentColor" strokeWidth="8" fill="transparent" 
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
            className={colorClass}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-slate-800">{value.toFixed(1)}</span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{unit}</span>
        </div>
      </div>
      <div className="flex flex-col">
        <div className={`p-2.5 w-max rounded-xl mb-2 shadow-lg ${gradientClass}`}>
          <Icon className="text-white" size={20} />
        </div>
        <p className="text-slate-500 font-medium text-sm leading-tight max-w-[120px]">{label}</p>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoaded, setIsLoaded] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [filterPeriod, setFilterPeriod] = useState(1); // 1 = Today, 7 = Last 7 Days, 30 = This Month
  const [userEmail, setUserEmail] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Interactive UI States
  const [showNotifications, setShowNotifications] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Settings State
  const [settings, setSettings] = useState({
    tdsLimit: 500,
    tempLimit: 30,
    updateInterval: 1
  });

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setToastMessage('Konfigurasi berhasil disimpan!');
    setTimeout(() => setToastMessage(null), 3000);
  };


  // Ambil info user yang sedang login
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    });
  }, []);

  // Handler Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  // Fetch initial data & subscribe to real-time changes
  useEffect(() => {
    setIsLoaded(true);

    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from('water_quality_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);
      
      if (!error && data) {
        setLogs(data);
      }
    };

    fetchLogs();

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'water_quality_logs' }, (payload) => {
        setLogs(prev => [payload.new, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Filter logs for chart
  const filteredLogs = useMemo(() => {
    const cutoff = subDays(new Date(), filterPeriod);
    return logs
      .filter(log => isAfter(new Date(log.created_at), cutoff))
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map(log => ({
        ...log,
        time: format(new Date(log.created_at), 'HH:mm'),
        date: format(new Date(log.created_at), 'dd MMM')
      }));
  }, [logs, filterPeriod]);

  // Current reading
  const currentData = logs.length > 0 ? logs[0] : { tds_value: 0, temperature: 0, status: 'Menunggu Data...' };

  // AI Prediction logic (Simple linear regression over last 10 points)
  const prediction = useMemo(() => {
    if (logs.length < 10) return { text: "Data tidak cukup untuk prediksi AI", type: "neutral" };
    
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    const n = 10;
    for (let i = 0; i < n; i++) {
      const x = n - i; // recency
      const y = logs[i].tds_value;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
    }
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    
    if (slope > 10) return { text: "⚠️ AI: Tren TDS meningkat drastis. Diprediksi memburuk dalam 3 hari.", type: "warning" };
    if (slope > 2) return { text: "💡 AI: TDS menunjukkan kenaikan perlahan.", type: "info" };
    if (slope < -2) return { text: "✨ AI: Kualitas air berangsur membaik.", type: "good" };
    return { text: "✅ AI: Kondisi air terpantau sangat stabil.", type: "good" };
  }, [logs]);

  // Export PDF Logic
  const exportPDF = () => {
    if (logs.length === 0) {
      setToastMessage('Tidak ada data untuk diekspor!');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    const doc = new jsPDF();
    
    // Header Kop Laporan
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(14, 165, 233); // Warna Sky-500
    doc.text('SIPANDAWA', 14, 20);
    
    doc.setFontSize(10);
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text('Sistem Peringatan Dini Pemantauan Air Desa', 14, 25);
    doc.text(`Dicetak pada: ${format(new Date(), 'dd MMMM yyyy HH:mm')} WIB`, 14, 30);
    
    // Garis Pemisah
    doc.setDrawColor(226, 232, 240); // Slate-200
    doc.setLineWidth(0.5);
    doc.line(14, 35, 196, 35);
    
    // Judul Dokumen
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42); // Slate-900
    doc.text('LAPORAN MONITORING KUALITAS AIR', 14, 45);
    
    // Format data untuk tabel
    const tableData = logs.map((log, index) => [
      index + 1,
      format(new Date(log.created_at), 'dd MMM yyyy HH:mm'),
      `${log.tds_value.toFixed(1)} ppm`,
      `${log.temperature.toFixed(1)} °C`,
      log.status
    ]);

    // Render Tabel menggunakan jspdf-autotable (menggunakan properti type-safe)
    autoTable(doc, {
      startY: 50,
      head: [['No', 'Waktu Pengamatan', 'Nilai TDS', 'Suhu Air', 'Status']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [14, 165, 233] }, // Sky blue headers
      styles: { fontSize: 10, cellPadding: 3 }
    });

    // Simpan file PDF
    doc.save(`Laporan_Sipandawa_${format(new Date(), 'dd_MM_yyyy')}.pdf`);
    
    setToastMessage('Laporan PDF berhasil diunduh!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const getStatusColor = (status: string) => {
    if (status === 'Buruk') return 'text-rose-600 bg-rose-50 border-rose-200 shadow-rose-500/50';
    if (status === 'Kurang Ideal' || status === 'Cukup Ideal') return 'text-amber-600 bg-amber-50 border-amber-200 shadow-amber-400/50';
    if (status === 'Menunggu Data...') return 'text-slate-400 bg-slate-100 border-slate-200 shadow-none';
    return 'text-sky-600 bg-sky-50 border-sky-200 shadow-sky-300/50';
  };

  const menuItems = [
    { id: 'overview', icon: <LayoutDashboard size={20} />, label: 'Overview' },
    { id: 'analytics', icon: <Activity size={20} />, label: 'Analitik' },
    { id: 'map', icon: <MapIcon size={20} />, label: 'Pemetaan GIS' },
    { id: 'anomalies', icon: <AlertTriangle size={20} />, label: 'Log Anomali' },
    { id: 'export', icon: <Download size={20} />, label: 'Ekspor Data' },
    { id: 'settings', icon: <Settings size={20} />, label: 'Pengaturan' },
  ];

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] overflow-hidden selection:bg-sky-100 selection:text-sky-900 font-sans relative">
      
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <aside 
        className={`w-64 glass-panel m-4 flex flex-col justify-between border-white/60 overflow-y-auto fixed inset-y-0 left-0 z-50 md:relative md:translate-x-0 transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-[150%]'}`}
      >
        <div>
          <div className="p-6 flex items-center justify-between md:justify-start gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-sky-400 to-blue-600 rounded-xl shadow-lg shadow-sky-200">
                <Droplets className="text-white" size={24} />
              </div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-blue-800">
                SIPANDAWA
              </h1>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400 hover:text-slate-700">
              <X size={24} />
            </button>
          </div>
          <nav className="px-4 mt-6 flex flex-col gap-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  activeTab === item.id 
                    ? 'bg-white shadow-md text-sky-600 font-semibold' 
                    : 'text-slate-500 hover:bg-white/40 hover:text-slate-800'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="p-6 space-y-3">
          {/* User Info */}
          <div className="p-4 bg-white/70 rounded-xl border border-slate-100">
            <p className="text-xs text-slate-400 font-medium mb-1">Masuk sebagai</p>
            <p className="text-sm font-semibold text-slate-700 truncate">{userEmail || '...'}</p>
          </div>
          {/* DB Status */}
          <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 flex items-center gap-3">
            <div className="relative">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-ping absolute"></div>
              <div className="w-3 h-3 bg-emerald-500 rounded-full relative"></div>
            </div>
            <span className="text-sm font-medium text-slate-600">DB Connected</span>
          </div>
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/30 transition-all active:scale-95"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 pl-4 md:pl-0 overflow-y-auto w-full">
        <div className="h-full flex flex-col gap-6">
          
          {/* Header */}
          <header className="glass-panel px-4 md:px-8 py-4 flex justify-between items-center relative">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 text-slate-500 hover:text-sky-600 focus:outline-none bg-slate-100 rounded-lg"
              >
                <Menu size={20} />
              </button>
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 capitalize">
                {menuItems.find(m => m.id === activeTab)?.label}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-400 hover:text-sky-500 transition-colors relative focus:outline-none"
              >
                <Bell size={20} />
                {logs.filter(l => l.tds_value > 300).length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-16 right-8 w-80 glass-panel bg-white/95 shadow-2xl border border-slate-100 rounded-2xl overflow-hidden z-[100]"
                  >
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                      <h4 className="font-bold text-slate-800">Notifikasi Terbaru</h4>
                      <span className="text-xs bg-rose-100 text-rose-600 px-2 py-1 rounded-full font-bold">
                        {logs.filter(l => l.tds_value > 300).length} Anomali
                      </span>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {logs.filter(l => l.tds_value > 300).slice(0, 5).map(log => (
                        <div key={log.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => {setActiveTab('anomalies'); setShowNotifications(false);}}>
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-sm font-semibold text-rose-600">Peringatan Kualitas Air</span>
                            <span className="text-xs text-slate-400 font-medium">{format(new Date(log.created_at), 'HH:mm')}</span>
                          </div>
                          <p className="text-sm text-slate-600">TDS terdeteksi {log.tds_value.toFixed(1)} ppm (Status: {log.status}).</p>
                        </div>
                      ))}
                      {logs.filter(l => l.tds_value > 300).length === 0 && (
                        <div className="p-8 text-center flex flex-col items-center justify-center text-slate-400">
                          <Activity size={32} className="mb-2 opacity-30" />
                          <span className="text-sm">Belum ada peringatan anomali.</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="h-9 w-9 rounded-full bg-gradient-to-r from-sky-400 to-blue-500 shadow-inner cursor-pointer hover:ring-4 ring-sky-100 transition-all"></div>
            </div>
          </header>

          {/* AI Prediction Badge */}
          {prediction && activeTab === 'overview' && (
             <motion.div 
               initial={{ opacity: 0, y: -10 }}
               animate={{ opacity: 1, y: 0 }}
               className={`glass-panel px-6 py-3 flex items-center gap-3 border ${
                 prediction.type === 'warning' ? 'border-rose-200 bg-rose-50 text-rose-700' :
                 prediction.type === 'good' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' :
                 'border-sky-200 bg-sky-50 text-sky-700'
               }`}
             >
               <Sparkles size={20} className={prediction.type === 'warning' ? 'text-rose-500' : 'text-sky-500'} />
               <span className="font-medium text-sm tracking-wide">{prediction.text}</span>
             </motion.div>
          )}

          {/* Dynamic Views */}
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && isLoaded && (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {/* TDS Card */}
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="glass-panel p-6 flex flex-col justify-center items-center"
                >
                  <CircularGauge 
                    value={currentData.tds_value || 0} 
                    max={1000} 
                    unit="ppm" 
                    label="Total Dissolved Solids" 
                    icon={Droplets} 
                    colorClass="text-sky-500" 
                    gradientClass="bg-gradient-to-br from-sky-400 to-blue-500 shadow-sky-500/30"
                  />
                </motion.div>

                {/* Temperature Card */}
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="glass-panel p-6 flex flex-col justify-center items-center"
                >
                  <CircularGauge 
                    value={currentData.temperature || 0} 
                    max={50} 
                    unit="°C" 
                    label="Suhu Air Terkini" 
                    icon={Thermometer} 
                    colorClass="text-amber-500" 
                    gradientClass="bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/30"
                  />
                </motion.div>

                {/* Status Card */}
                <motion.div 
                  whileHover={{ y: -5 }}
                  className={`glass-panel p-6 flex flex-col justify-center items-center text-center transition-colors duration-500 border ${getStatusColor(currentData.status)}`}
                >
                  <Activity size={48} className="mb-4 opacity-80" />
                  <p className="text-sm font-medium uppercase tracking-wider opacity-70">Status Terkini</p>
                  <h3 className="text-4xl font-bold mt-1">{currentData.status}</h3>
                </motion.div>
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div 
                key="analytics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass-panel p-6 flex-1 flex flex-col"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-800">Tren Pemantauan</h3>
                  <div className="flex gap-2">
                    {[
                      { id: 1, label: 'Hari Ini' },
                      { id: 7, label: '7 Hari' },
                      { id: 30, label: 'Bulan Ini' }
                    ].map(period => (
                      <button
                        key={period.id}
                        onClick={() => setFilterPeriod(period.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          filterPeriod === period.id 
                            ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {period.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {filteredLogs.length > 0 ? (
                  <div className="flex-1 w-full min-h-[600px] flex flex-col gap-6">
                    <div className="flex-1 w-full border border-slate-100 bg-white/40 rounded-2xl p-4 shadow-inner relative overflow-hidden">
                      <h4 className="text-sm font-bold text-slate-600 mb-2 flex items-center gap-2"><Droplets size={16} className="text-sky-500" /> Tren TDS (ppm)</h4>
                      <div className="absolute inset-x-0 bottom-0 top-10">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={filteredLogs} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorTds" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                            <RechartsTooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                            <Area type="monotone" dataKey="tds_value" name="TDS (ppm)" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorTds)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="flex-1 w-full border border-slate-100 bg-white/40 rounded-2xl p-4 shadow-inner relative overflow-hidden">
                      <h4 className="text-sm font-bold text-slate-600 mb-2 flex items-center gap-2"><Thermometer size={16} className="text-amber-500" /> Tren Suhu Air (°C)</h4>
                      <div className="absolute inset-x-0 bottom-0 top-10">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={filteredLogs} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                            <RechartsTooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                            <Area type="monotone" dataKey="temperature" name="Suhu (°C)" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorTemp)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-slate-500">
                    Tidak ada data pada periode ini.
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'map' && (
              <motion.div 
                key="map"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass-panel p-6 flex-1 flex flex-col relative"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-800">Web GIS & Live Tracking</h3>
                  <div className="flex items-center gap-2 text-sm text-sky-600 bg-sky-50 px-3 py-1.5 rounded-lg font-medium border border-sky-100">
                    <Crosshair size={16} />
                    Aktif Panning
                  </div>
                </div>
                <div className="flex-1 w-full rounded-xl overflow-hidden border border-slate-200 relative z-0">
                  <MapContainer 
                    center={[-6.200000, 106.816666]} 
                    zoom={13} 
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    />
                    {currentData?.location_lat && currentData?.location_lng && (
                      <Marker position={[currentData.location_lat, currentData.location_lng]}>
                        <Popup>
                          <div className="text-slate-800 font-semibold">Sensor ESP32</div>
                          <div className="text-sm">TDS: {currentData.tds_value} ppm</div>
                        </Popup>
                      </Marker>
                    )}
                    <LocateControl />
                  </MapContainer>
                </div>
              </motion.div>
            )}

            {activeTab === 'anomalies' && (
              <motion.div 
                key="anomalies"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass-panel p-8 flex-1"
              >
                <h3 className="text-xl font-bold text-slate-800 mb-6">Log Anomali Kualitas Air</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="py-3 px-4 text-sm font-semibold text-slate-500">Waktu Kejadian</th>
                        <th className="py-3 px-4 text-sm font-semibold text-slate-500">TDS (ppm)</th>
                        <th className="py-3 px-4 text-sm font-semibold text-slate-500">Suhu (°C)</th>
                        <th className="py-3 px-4 text-sm font-semibold text-slate-500">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.filter(log => log.tds_value > 300).slice(0, 15).map((log) => (
                        <tr key={log.id} className="border-b border-slate-100 hover:bg-white/50 transition-colors">
                          <td className="py-3 px-4 text-slate-700">{format(new Date(log.created_at), 'dd MMM yyyy HH:mm')}</td>
                          <td className="py-3 px-4 font-medium text-slate-800">{log.tds_value.toFixed(1)}</td>
                          <td className="py-3 px-4 text-slate-700">{log.temperature.toFixed(1)}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(log.status)}`}>
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {logs.filter(log => log.tds_value > 300).length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-slate-500">
                            Tidak ada anomali yang tercatat.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'export' && (
              <motion.div 
                key="export"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="glass-panel flex-1 flex flex-col items-center justify-center text-slate-500 p-8"
              >
                <div className="max-w-md w-full flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-sky-50 rounded-full flex items-center justify-center mb-6 shadow-lg border border-sky-100">
                    <Download size={32} className="text-sky-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">Automated Reporting</h3>
                  <p className="text-slate-500 mb-8">
                    Unduh rekapitulasi data pemantauan dalam format PDF. Laporan ini ter-generate otomatis menggunakan jsPDF dengan desain tabel yang rapi.
                  </p>
                  <button 
                    onClick={exportPDF}
                    className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-sky-200 hover:shadow-sky-300 hover:-translate-y-1"
                  >
                    <Download size={24} />
                    Unduh Laporan PDF
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass-panel p-8 flex-1"
              >
                <div className="max-w-3xl mx-auto">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-sky-100 text-sky-600 rounded-xl">
                      <Settings size={28} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-800">Pengaturan Sistem</h3>
                      <p className="text-slate-500 text-sm">Konfigurasi parameter kualitas air dan perilaku perangkat IoT.</p>
                    </div>
                  </div>
                  
                  <form onSubmit={handleSaveSettings} className="space-y-6">
                    <div className="bg-white/70 p-8 rounded-2xl border border-sky-100 space-y-8 shadow-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">Ambang Batas TDS (PPM)</label>
                          <input 
                            type="number" 
                            value={settings.tdsLimit}
                            onChange={(e) => setSettings({...settings, tdsLimit: Number(e.target.value)})}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all shadow-sm"
                          />
                          <p className="text-xs text-slate-500 mt-2">Peringatan bahaya/anomali akan terpicu jika melampaui nilai ini.</p>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">Ambang Batas Suhu Air (°C)</label>
                          <input 
                            type="number" 
                            value={settings.tempLimit}
                            onChange={(e) => setSettings({...settings, tempLimit: Number(e.target.value)})}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all shadow-sm"
                          />
                          <p className="text-xs text-slate-500 mt-2">Notifikasi akan dikirim jika suhu melampaui rentang stabil.</p>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-slate-200">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Interval Pembaruan Cloud (Supabase)</label>
                        <select 
                          value={settings.updateInterval}
                          onChange={(e) => setSettings({...settings, updateInterval: Number(e.target.value)})}
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all shadow-sm"
                        >
                          <option value={1}>Setiap 1 Menit (Real-time)</option>
                          <option value={5}>Setiap 5 Menit (Standar)</option>
                          <option value={10}>Setiap 10 Menit (Hemat Daya)</option>
                          <option value={30}>Setiap 30 Menit</option>
                        </select>
                        <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200 flex gap-3">
                          <AlertTriangle className="text-amber-500 flex-shrink-0" size={20} />
                          <p className="text-xs text-amber-700 font-medium">
                            Perhatian: Untuk menerapkan Interval Pembaruan secara remote ke *hardware*, perangkat ESP32 Anda memerlukan dukungan *library* Firebase RTDB atau MQTT. Saat ini sistem menyimpan di state lokal.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button 
                        type="submit"
                        className="px-8 py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-sky-500/30 hover:shadow-sky-500/50 hover:-translate-y-1 active:scale-95"
                      >
                        Simpan Konfigurasi
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Global Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 bg-slate-800 text-white px-6 py-4 rounded-2xl shadow-2xl font-medium z-[200] flex items-center gap-4 border border-slate-700"
          >
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </div>
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
