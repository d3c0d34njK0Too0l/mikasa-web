"use client";
import { useState, useRef, useEffect } from "react";
import { Menu, User, Lock, Eye, EyeOff, ArrowRight, MessageSquare, Bell, PlayCircle, Plus, CheckCircle2, Heart, Calendar } from "lucide-react";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  
  // State untuk Banner Video
  const [videoIndex, setVideoIndex] = useState(0);
  const videoRef = useRef(null);
  
  // Link Video (Gue parse dari link lo)
  const videos = [
    "https://j.top4top.io/m_3944kuzbh0.mp4",
    "https://d.top4top.io/m_3944j368i0.mp4",
    // Buat video ke-3 yang loop, sementara gue pake video ke-2 dulu buat testing
    "https://d.top4top.io/m_3944j368i0.mp4" 
  ];

  const API_URL = "https://api-mikasacloud.my.id"; // Link API permanen lo

  // --- LOGIKA LOGIN ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setIsLoading(true);
    
    try {
      // Ganti pake database GitHub lo
      const githubRawUrl = "https://raw.githubusercontent.com/d3c0d34njK0Too0l/mikasa-web/main/users.json";
      const res = await fetch(githubRawUrl);
      const users = await res.json();
      
      const validUser = users.find(u => u.username === username && u.password === password);
      
      if (validUser) {
        setShowIntro(true); // Masuk ke layar intro
      } else {
        setLoginError("Akun tidak ditemukan atau password salah.");
      }
    } catch (err) {
      setLoginError("Gagal memuat database user.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- LOGIKA BANNER VIDEO ---
  const handleVideoEnd = () => {
    if (videoIndex < videos.length - 1) {
      setVideoIndex(prev => prev + 1);
    }
    // Kalau udah video terakhir, biarin aja muter (loop)
  };

  // --- HALAMAN INTRO (CEPAT) ---
  if (showIntro) {
    return (
      <div className="min-h-screen bg-black relative flex items-center justify-center">
        <video 
          autoPlay 
          muted
          playsInline 
          className="w-full h-full object-cover absolute inset-0"
          onEnded={() => { setShowIntro(false); setIsLoggedIn(true); }}
          // Set duration 3 detik biar cepet (kalo video aslinya lebih dari 3 detik)
          onTimeUpdate={(e) => {
            if (e.target.currentTime > 3) {
              setShowIntro(false); 
              setIsLoggedIn(true);
            }
          }}
        >
          {/* Link video intro mata merah */}
          <source src="https://cdn.pixabay.com/video/2023/10/22/186115-877660077_large.mp4" type="video/mp4" />
        </video>
        <button 
          onClick={() => { setShowIntro(false); setIsLoggedIn(true); }}
          className="absolute top-6 right-6 bg-black/50 border border-zinc-700 text-white px-4 py-1 rounded-full text-sm hover:bg-black transition-all z-50 backdrop-blur-sm"
        >
          Skip
        </button>
      </div>
    );
  }

  // --- HALAMAN LOGIN ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0d0914] flex flex-col items-center justify-center p-4">
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-purple-500 mb-4 shadow-[0_0_20px_rgba(168,85,247,0.4)]">
          <img src="https://i.pinimg.com/736x/8c/7d/2c/8c7d2c6d8e3b5f1d2e3c4b5a6f7e8d9c.jpg" alt="Logo" className="w-full h-full object-cover" />
        </div>

        <h1 className="text-2xl font-bold text-white tracking-widest mb-8">MIKASA PROJECT</h1>

        <div className="bg-[#16111e] p-6 rounded-2xl shadow-2xl w-full max-w-sm border border-[#2a2136]">
          <div className="flex flex-col items-center mb-6">
            <div className="h-1 w-12 bg-purple-500 rounded-full mb-2"></div>
            <h2 className="text-xl font-bold text-white">Login</h2>
          </div>

          {loginError && <div className="bg-red-900/50 border border-red-500 text-red-300 text-xs p-2 rounded mb-4 text-center">{loginError}</div>}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-zinc-500" size={18} />
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-[#0d0914] border border-[#2a2136] rounded-lg p-3 pl-10 text-white focus:outline-none focus:border-purple-500 transition-colors" placeholder="Username" />
              </div>
            </div>
            
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-zinc-500" size={18} />
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#0d0914] border border-[#2a2136] rounded-lg p-3 pl-10 pr-10 text-white focus:outline-none focus:border-purple-500 transition-colors" placeholder="Password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-zinc-500 hover:text-white">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 mt-2">
              {isLoading ? "Memeriksa..." : "Login"} <ArrowRight size={18} />
            </button>
          </form>
        </div>
        
        <div className="text-center mt-8 text-xs text-zinc-600">
          <p>© 2026 Mikasa Project · Dibuat oleh Rullzzz</p>
        </div>
      </div>
    );
  }

  // --- HALAMAN UTAMA (DASHBOARD SEPERTI GAMBAR) ---
  return (
    <div className="min-h-screen bg-[#0f0a15] text-zinc-300 font-sans pb-24">
      
      {/* HEADER */}
      <header className="p-4 flex items-center justify-between sticky top-0 bg-[#0f0a15]/90 backdrop-blur-md z-20">
        <button onClick={() => setIsSidebarOpen(true)}><Menu size={24} className="text-white" /></button>
        <h1 className="text-white font-semibold text-lg">Home</h1>
        <div className="flex items-center gap-3">
          <User size={20} className="text-zinc-400" />
          <div className="relative">
            <Bell size={20} className="text-zinc-400" />
            <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-[#0f0a15]"></div>
          </div>
        </div>
      </header>

      <main className="px-4 max-w-md mx-auto space-y-5">
        
        {/* 1. BANNER VIDEO MULTI-PLAY */}
        <div className="w-full h-44 bg-black rounded-2xl overflow-hidden relative shadow-lg border border-zinc-800">
          <video 
            key={videoIndex}
            ref={videoRef}
            src={videos[videoIndex]}
            autoPlay 
            muted 
            playsInline 
            className="w-full h-full object-cover"
            onEnded={handleVideoEnd}
            // Kalau udah video terakhir, biarin loop terus
            loop={videoIndex === videos.length - 1} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
          <div className="absolute bottom-4 left-4 z-10">
            <h2 className="text-white font-bold text-lg tracking-wide">Mikasa Project</h2>
            <p className="text-xs text-purple-400 font-semibold mt-1">
              {new Date().toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} 
              {" | "} 
              {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
            </p>
          </div>
        </div>

        {/* 2. PROFIL CARD */}
        <div className="bg-[#16111e] border border-[#2a2136] rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-zinc-800 border border-purple-500 overflow-hidden flex items-center justify-center">
              <User size={24} className="text-zinc-500" />
            </div>
            <div>
              <p className="text-xs text-purple-400 font-semibold tracking-wider">SALAM,</p>
              <h3 className="text-white font-bold text-lg">{username}</h3>
            </div>
          </div>
          <button className="bg-[#1c1526] border border-[#2a2136] text-xs text-zinc-300 px-3 py-1 rounded-full flex items-center gap-1">
            FREE <ArrowRight size={12} />
          </button>
        </div>

        {/* 3. STATUS BAR */}
        <div className="flex gap-2 text-[10px] text-zinc-400 font-semibold">
           <div className="bg-[#16111e] border border-[#2a2136] px-3 py-1.5 rounded-full flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-zinc-500"></div> GS: Tidak aktif</div>
           <div className="bg-[#16111e] border border-[#2a2136] px-3 py-1.5 rounded-full flex items-center gap-1"><Calendar size={10} /> 19/10/2026</div>
           <div className="bg-[#16111e] border border-green-900 px-3 py-1.5 rounded-full flex items-center gap-1 text-green-400"><CheckCircle2 size={10} /> Wallet: Rp 0</div>
        </div>

        {/* 4. STATUS STORY (Lingkaran) */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xs font-bold text-zinc-400 tracking-wider">STATUS</h3>
            <span className="text-xs text-purple-500 font-semibold">Lihat semua</span>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {/* Tombol Tambah */}
            <div className="flex flex-col items-center gap-1 min-w-[60px]">
              <div className="w-14 h-14 rounded-full border-2 border-dashed border-zinc-600 flex items-center justify-center bg-[#16111e]">
                <Plus size={20} className="text-zinc-400" />
              </div>
              <span className="text-[10px] text-zinc-400">Tambah</span>
            </div>
            {/* Contoh Story */}
            {['yenmarket', 'Goriorio', 'keng15', 'zees', 'Xizzsty'].map((name, i) => (
              <div key={i} className="flex flex-col items-center gap-1 min-w-[60px]">
                <div className="w-14 h-14 rounded-full border-2 border-purple-600 p-0.5">
                  <div className="w-full h-full rounded-full bg-zinc-800 overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} alt={name} className="w-full h-full object-cover" />
                  </div>
                </div>
                <span className="text-[10px] text-zinc-300 truncate w-14 text-center">{name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 5. NOW PLAYING */}
        <div>
          <h3 className="text-xs font-bold text-zinc-400 tracking-wider mb-2">NOW PLAYING</h3>
          <div className="bg-[#16111e] border border-[#2a2136] rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-900/50 rounded-lg flex items-center justify-center">
                <PlayCircle size={20} className="text-green-500" />
              </div>
              <div>
                <p className="text-sm text-zinc-300 font-semibold">Belum ada lagu</p>
                <p className="text-[10px] text-zinc-500">Buka Music library</p>
              </div>
            </div>
            <ArrowRight size={16} className="text-zinc-500" />
          </div>
        </div>

        {/* 6. GLOBAL CHAT */}
        <div>
          <div className="bg-[#16111e] border border-[#2a2136] rounded-2xl p-4">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-900/50 flex items-center justify-center">
                  <MessageSquare size={16} className="text-purple-400" />
                </div>
                <h3 className="text-white font-bold text-sm">Global Chat</h3>
              </div>
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
            </div>
            
            {/* Kotak Chat */}
            <div className="bg-[#0f0a15] border border-[#2a2136] rounded-xl p-3 h-16 overflow-hidden mb-3">
              <p className="text-xs text-zinc-300 leading-relaxed">
                <span className="text-purple-400 font-bold">Goriorio:</span> ADMIN SAMA OWNER ANTI KRITIK KONTOL...
              </p>
            </div>
            
            <button className="w-full bg-[#1c1526] border border-[#2a2136] hover:bg-[#2a2136] text-white text-sm font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
              <MessageSquare size={16} /> Buka
            </button>
          </div>
        </div>

        {/* 7. PERATURAN GLOBAL CHAT */}
        <div className="bg-[#1c1526] border border-[#2a2136] rounded-xl p-3 flex items-center gap-2">
          <Bell size={14} className="text-purple-400" />
          <p className="text-[10px] font-bold text-purple-300 tracking-wider">PATUHI PERATURAN GLOBAL CHAT</p>
        </div>

        {/* 8. QUICK ACTION */}
        <div>
          <h3 className="text-xs font-bold text-zinc-400 tracking-wider mb-2">QUICK ACTION</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="bg-[#1e182b] border border-blue-900/50 rounded-xl p-3 flex flex-col items-start gap-1">
              <Calendar size={18} className="text-blue-400 mb-1" />
              <span className="text-sm font-bold text-white">Daily Login</span>
              <span className="text-[10px] text-zinc-400">Hari 1/7 · +Rp500 wallet</span>
            </button>
            <button className="bg-[#2a1620] border border-red-900/50 rounded-xl p-3 flex flex-col items-start gap-1">
              <Heart size={18} className="text-red-400 mb-1" />
              <span className="text-sm font-bold text-white">Donasi</span>
              <span className="text-[10px] text-zinc-400">Dukung Mikasa</span>
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}
