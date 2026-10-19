"use client";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { 
  Home as HomeIcon, Menu, User, Lock, Eye, EyeOff, ArrowRight, 
  MessageSquare, Bell, Plus, Heart, Calendar, Wrench, 
  DownloadCloud, Search, Bug, Send, X, ChevronLeft, 
  ShieldAlert, Globe, Smartphone, FileText, Play, Pause, Gamepad2, Music, CheckCircle2
} from "lucide-react";

const API_URL = "https://api-mikasacloud.my.id";
const API_KEY = "rahasia_banget_123";
const VIDEO_1 = "https://j.top4top.io/m_3944kuzbh0.mp4";
const VIDEO_2 = "https://d.top4top.io/m_3944j368i0.mp4";
const INTRO_VIDEO = "https://c.top4top.io/m_39443olav1.mp4";
const INTRO_AUDIO = "https://l.top4top.io/m_3944pw6n51.mp3";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  
  // Login State
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [userRole, setUserRole] = useState("FREE");
  
  // App State
  const [activeTab, setActiveTab] = useState("home");
  const [selectedTool, setSelectedTool] = useState(null);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  
  // Chat State
  const [globalMsgs, setGlobalMsgs] = useState([]);
  const [msgInput, setMsgInput] = useState("");
  
  // Video Banner
  const [videoIndex, setVideoIndex] = useState(0);
  
  // Tool State
  const [target, setTarget] = useState("");
  const [loadingTools, setLoadingTools] = useState(false);
  const [toolsResult, setToolsResult] = useState(null);

  // Music State
  const [musicQuery, setMusicQuery] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // --- LOGIN ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch("https://raw.githubusercontent.com/d3c0d34njK0Too0l/mikasa-web/main/users.json");
      const users = await res.json();
      const validUser = users.find(u => u.username === username && u.password === password);
      if (validUser) {
        setUserRole(validUser.role ? validUser.role.toUpperCase() : "FREE");
        setShowIntro(true);
      } else {
        setLoginError("Akun tidak ditemukan.");
      }
    } catch (err) {
      setLoginError("Gagal terhubung ke database.");
    }
  };

  // --- SOCKET ---
  useEffect(() => {
    if (isLoggedIn) {
      const newSocket = io(API_URL);
      setSocket(newSocket);
      newSocket.emit('user_online', username);
      newSocket.on('update_online_users', (users) => setOnlineUsers(users.filter(u => u !== username)));
      newSocket.on('receive_global_msg', (data) => setGlobalMsgs((prev) => [...prev, data]));
      return () => newSocket.close();
    }
  }, [isLoggedIn, username]);

  const sendGlobalMsg = (e) => {
    e.preventDefault();
    if (!msgInput.trim() || !socket) return;
    socket.emit('send_global_msg', { from: username, msg: msgInput });
    setMsgInput("");
  };

  const handleToolRequest = async (endpoint, payload) => {
    setLoadingTools(true);
    setToolsResult(null);
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setToolsResult(data);
    } catch (e) {
      setToolsResult({ status: false, error: "Gagal terhubung ke API" });
    } finally {
      setLoadingTools(false);
    }
  };

  // --- INTRO VIDEO ---
  if (showIntro) {
    return (
      <div className="min-h-screen bg-black relative flex items-center justify-center">
        <video autoPlay muted playsInline className="w-full h-full object-cover absolute inset-0" onEnded={() => { setShowIntro(false); setIsLoggedIn(true); }}>
          <source src={INTRO_VIDEO} type="video/mp4" />
        </video>
        <audio autoPlay><source src={INTRO_AUDIO} type="audio/mpeg" /></audio>
        <button onClick={() => { setShowIntro(false); setIsLoggedIn(true); }} className="absolute top-6 right-6 bg-black/50 border border-zinc-700 text-white px-4 py-1 rounded-full text-sm z-50 backdrop-blur-sm">Skip</button>
      </div>
    );
  }

  // --- LOGIN PAGE ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0d0914] flex flex-col items-center justify-center p-4">
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-purple-500 mb-4 shadow-[0_0_20px_rgba(168,85,247,0.4)]">
          <img src="https://i.pinimg.com/736x/8c/7d/2c/8c7d2c6d8e3b5f1d2e3c4b5a6f7e8d9c.jpg" alt="Logo" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-widest mb-8">MIKASA PROJECT</h1>
        <div className="bg-[#16111e] p-6 rounded-2xl shadow-2xl w-full max-w-sm border border-[#2a2136]">
          <div className="flex flex-col items-center mb-6"><div className="h-1 w-12 bg-purple-500 rounded-full mb-2"></div><h2 className="text-xl font-bold text-white">Login</h2></div>
          {loginError && <div className="bg-red-900/50 border border-red-500 text-red-300 text-xs p-2 rounded mb-4 text-center">{loginError}</div>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Username</label>
              <div className="relative"><User className="absolute left-3 top-3 text-zinc-500" size={18} /><input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-[#0d0914] border border-[#2a2136] rounded-lg p-3 pl-10 text-white focus:outline-none focus:border-purple-500" placeholder="Username" /></div>
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Password</label>
              <div className="relative"><Lock className="absolute left-3 top-3 text-zinc-500" size={18} /><input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#0d0914] border border-[#2a2136] rounded-lg p-3 pl-10 pr-10 text-white focus:outline-none focus:border-purple-500" placeholder="Password" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-zinc-500 hover:text-white">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
            </div>
            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 mt-2">Login <ArrowRight size={18} /></button>
          </form>
        </div>
      </div>
    );
  }

  // --- HALAMAN HOME YANG BARU ---
  const renderHome = () => (
    <main className="px-4 max-w-md mx-auto space-y-5">
      
      {/* Banner Video */}
      <div className="w-full h-44 bg-black rounded-2xl overflow-hidden relative shadow-lg border border-zinc-800">
        <video key={videoIndex} src={videoIndex === 0 ? VIDEO_1 : VIDEO_2} autoPlay muted playsInline className="w-full h-full object-cover" onEnded={() => videoIndex === 0 && setVideoIndex(1)} loop={videoIndex === 1} />
        <div className="absolute bottom-4 left-4 z-10"><h2 className="text-white font-bold text-lg">Mikasa Project</h2></div>
      </div>
      
      {/* Kartu Profil Lengkap */}
      <div className="bg-[#16111e] border border-[#2a2136] rounded-2xl p-4 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-zinc-800 border-2 border-purple-500 flex items-center justify-center">
          <User size={32} className="text-zinc-500" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-white font-bold text-lg">{username}</h3>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${userRole === 'ADMIN' ? 'bg-red-600' : 'bg-purple-600'} text-white`}>{userRole}</span>
          </div>
          <div className="flex items-center gap-1 mt-1 text-green-400 text-xs font-semibold">
            <CheckCircle2 size={14} /> STATUS: AKTIF (NOT BANNED)
          </div>
        </div>
      </div>

      {/* Musik Real-Time */}
      <div className="bg-[#16111e] border border-[#2a2136] rounded-2xl p-4">
        <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2"><Music size={16} className="text-purple-400"/> Music Player</h3>
        <div className="flex gap-2 mb-3">
          <input type="text" placeholder="Cari lagu..." value={musicQuery} onChange={(e) => setMusicQuery(e.target.value)} className="flex-1 bg-[#0f0a15] border border-[#2a2136] rounded-lg p-2 text-sm text-white" />
          <button className="bg-purple-600 p-2 rounded-lg text-white"><Search size={18}/></button>
        </div>
        <div className="bg-[#0f0a15] border border-[#2a2136] rounded-xl p-3 flex items-center justify-between">
          <div>
            <p className="text-sm text-white font-semibold">{musicQuery || "Belum ada lagu"}</p>
            <p className="text-[10px] text-zinc-500">Mikasa Music</p>
          </div>
          <button onClick={() => setIsPlaying(!isPlaying)} className="bg-purple-600 p-2 rounded-full text-white">
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>
        </div>
      </div>

      {/* Quick Action & Game */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setActiveTab("tools")} className="bg-[#1e182b] border border-purple-900/50 rounded-xl p-3 flex flex-col items-start gap-1">
          <Gamepad2 size={20} className="text-purple-400 mb-1" />
          <span className="text-sm font-bold text-white">Main Game</span>
          <span className="text-[10px] text-zinc-400">Buka menu game</span>
        </button>
        <button className="bg-[#2a1620] border border-red-900/50 rounded-xl p-3 flex flex-col items-start gap-1">
          <Heart size={20} className="text-red-400 mb-1" />
          <span className="text-sm font-bold text-white">Donasi</span>
          <span className="text-[10px] text-zinc-400">Dukung Mikasa</span>
        </button>
      </div>

      {/* Status Story */}
      <div>
        <h3 className="text-xs font-bold text-zinc-400 mb-2">STATUS ONLINE</h3>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {onlineUsers.map((name, i) => (
            <div key={i} className="flex flex-col items-center gap-1 min-w-[60px]"><div className="w-14 h-14 rounded-full border-2 border-purple-600 p-0.5"><div className="w-full h-full rounded-full bg-zinc-800 flex items-center justify-center text-purple-400 font-bold uppercase">{name.charAt(0)}</div></div><span className="text-[10px] text-zinc-300 truncate w-14 text-center">{name}</span></div>
          ))}
        </div>
      </div>

      {/* Global Chat */}
      <div className="bg-[#16111e] border border-[#2a2136] rounded-2xl p-4">
        <div className="flex justify-between items-center mb-3"><h3 className="text-white font-bold text-sm">Global Chat</h3></div>
        <div className="bg-[#0f0a15] border border-[#2a2136] rounded-xl p-3 h-16 overflow-hidden mb-3"><p className="text-xs text-zinc-300">{globalMsgs.length > 0 ? (<><span className="text-purple-400 font-bold">{globalMsgs[globalMsgs.length - 1].from}:</span> {globalMsgs[globalMsgs.length - 1].msg}</>) : ("Belum ada pesan...")}</p></div>
        <button onClick={() => setActiveTab("chat")} className="w-full bg-[#1c1526] border border-[#2a2136] text-white text-sm font-semibold py-2.5 rounded-xl">Buka</button>
      </div>

    </main>
  );

  return (
    <div className="min-h-screen bg-[#0f0a15] text-zinc-300 font-sans pb-24">
      <header className="p-4 flex items-center justify-between sticky top-0 bg-[#0f0a15]/90 backdrop-blur-md z-20">
        <Menu size={24} className="text-white" />
        <h1 className="text-white font-semibold text-lg capitalize">{activeTab}</h1>
        <User size={20} className="text-zinc-400" />
      </header>

      {activeTab === "home" && renderHome()}
      
      {/* NAVBAR BAWAH */}
      <div className="fixed bottom-0 w-full bg-[#16111e] border-t border-[#2a2136] p-2 z-30">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide px-2">
           <button onClick={() => setActiveTab("home")} className="flex flex-col items-center min-w-[70px] p-2"><div className={`p-2 rounded-full ${activeTab === 'home' ? 'bg-purple-600 text-white' : 'text-zinc-500'}`}><HomeIcon size={20} /></div><span className="text-[10px] text-zinc-400">Home</span></button>
           {/* ... (Tombol Navbar lainnya sama kayak sebelumnya) ... */}
        </div>
      </div>
    </div>
  );
}
