"use client";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { 
  Home, Menu, User, Lock, Eye, EyeOff, ArrowRight, 
  MessageSquare, Bell, Plus, CheckCircle2, 
  Heart, Calendar, Wrench, DownloadCloud, Search, Bug, 
  Send, X, ChevronLeft
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
  
  // State Login
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // State App
  const [activeTab, setActiveTab] = useState("home");
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  
  // State Chat
  const [globalMsgs, setGlobalMsgs] = useState([]);
  const [msgInput, setMsgInput] = useState("");
  
  // State Video Banner
  const [videoIndex, setVideoIndex] = useState(0);
  
  // State Tools
  const [target, setTarget] = useState("");
  const [loadingTools, setLoadingTools] = useState(false);
  const [toolsResult, setToolsResult] = useState(null);
  const [bugType, setBugType] = useState("verload");

  // --- FUNGSI LOGIN ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setIsLoading(true);
    
    try {
      const githubRawUrl = "https://raw.githubusercontent.com/d3c0d34njK0Too0l/mikasa-web/main/users.json";
      const res = await fetch(githubRawUrl);
      const users = await res.json();
      
      const validUser = users.find(u => u.username === username && u.password === password);
      
      if (validUser) {
        setShowIntro(true); // Masuk layar video
      } else {
        setLoginError("Akun tidak ditemukan atau password salah.");
      }
    } catch (err) {
      setLoginError("Gagal terhubung ke database.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- INISIALISASI SOCKET (REAL-TIME) ---
  useEffect(() => {
    if (isLoggedIn) {
      const newSocket = io(API_URL);
      setSocket(newSocket);
      
      newSocket.emit('user_online', username);

      newSocket.on('update_online_users', (users) => {
        setOnlineUsers(users.filter(u => u !== username)); 
      });

      newSocket.on('receive_global_msg', (data) => {
        setGlobalMsgs((prev) => [...prev, data]);
      });

      return () => newSocket.close();
    }
  }, [isLoggedIn, username]);

  // --- FUNGSI KIRIM PESAN GLOBAL ---
  const sendGlobalMsg = (e) => {
    e.preventDefault();
    if (!msgInput.trim() || !socket) return;
    socket.emit('send_global_msg', { from: username, msg: msgInput });
    setMsgInput("");
  };

  // --- FUNGSI NEMBAK API TOOLS ---
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

  // --- HALAMAN INTRO VIDEO + AUDIO ---
  if (showIntro) {
    return (
      <div className="min-h-screen bg-black relative flex items-center justify-center">
        <video 
          autoPlay muted playsInline className="w-full h-full object-cover absolute inset-0"
          onTimeUpdate={(e) => { if (e.target.currentTime > 3) { setShowIntro(false); setIsLoggedIn(true); } }}
          onEnded={() => { setShowIntro(false); setIsLoggedIn(true); }}
        >
          <source src={INTRO_VIDEO} type="video/mp4" />
        </video>
        <audio autoPlay>
          <source src={INTRO_AUDIO} type="audio/mpeg" />
        </audio>
        <button onClick={() => { setShowIntro(false); setIsLoggedIn(true); }} className="absolute top-6 right-6 bg-black/50 border border-zinc-700 text-white px-4 py-1 rounded-full text-sm z-50 backdrop-blur-sm">Skip</button>
      </div>
    );
  }

  // --- HALAMAN LOGIN UNGU ---
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
            <button type="submit" disabled={isLoading} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 mt-2">{isLoading ? "Memeriksa..." : "Login"} <ArrowRight size={18} /></button>
          </form>
        </div>
        <div className="text-center mt-8 text-xs text-zinc-600"><p>© 2026 Mikasa Project · Dibuat oleh Rullzzz</p></div>
      </div>
    );
  }

  // --- HALAMAN CHAT GLOBAL (TERPISAH) ---
  if (activeTab === "chat") {
    return (
      <div className="min-h-screen bg-[#0f0a15] flex flex-col h-screen">
        <header className="bg-[#16111e] p-4 flex items-center gap-3 border-b border-[#2a2136]">
          <button onClick={() => setActiveTab("home")}><ChevronLeft size={24} className="text-white" /></button>
          <h1 className="text-white font-bold text-lg">Global Chat</h1>
        </header>
        <div className="bg-[#1c1526] p-2 flex items-center justify-between text-[10px] text-purple-300 font-bold border-b border-[#2a2136]"><span>📢 BACA RULE — KLIK ICON PALU DIATAS</span><X size={14} className="text-zinc-500" /></div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {globalMsgs.map((m, i) => (
            <div key={i} className={`flex ${m.from === username ? 'flex-row-reverse' : 'flex-row'} items-start gap-2`}>
              <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs text-white uppercase flex-shrink-0">{m.from.charAt(0)}</div>
              <div className={`flex flex-col ${m.from === username ? 'items-end' : 'items-start'}`}>
                <span className="text-[10px] text-zinc-400 mb-1">{m.from}</span>
                <div className={`p-3 rounded-2xl max-w-[80%] text-sm ${m.from === username ? 'bg-purple-600 text-white rounded-tr-sm' : 'bg-[#1c1526] text-zinc-200 rounded-tl-sm border border-[#2a2136]'}`}>{m.msg}</div>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={sendGlobalMsg} className="p-3 bg-[#16111e] border-t border-[#2a2136] flex gap-2 items-center">
          <button type="button" className="text-zinc-500"><Plus size={20} /></button>
          <input type="text" value={msgInput} onChange={e=>setMsgInput(e.target.value)} placeholder="Ketik pesan..." className="flex-1 bg-[#0f0a15] border border-[#2a2136] rounded-full px-4 py-2 text-sm text-white focus:outline-none" />
          <button type="submit" className="bg-purple-600 p-2 rounded-full text-white"><Send size={16} /></button>
        </form>
      </div>
    );
  }

  // --- RENDER KONTEN UTAMA (HOME / TOOLS) ---
  const renderContent = () => {
    if (activeTab === "home") {
      return (
        <main className="px-4 max-w-md mx-auto space-y-5">
          <div className="w-full h-44 bg-black rounded-2xl overflow-hidden relative shadow-lg border border-zinc-800">
            <video key={videoIndex} src={videoIndex === 0 ? VIDEO_1 : VIDEO_2} autoPlay muted playsInline className="w-full h-full object-cover" onEnded={() => videoIndex === 0 && setVideoIndex(1)} loop={videoIndex === 1} />
            <div className="absolute bottom-4 left-4 z-10"><h2 className="text-white font-bold text-lg">Mikasa Project</h2><p className="text-xs text-purple-400 font-semibold mt-1">{new Date().toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} | {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</p></div>
          </div>
          <div className="bg-[#16111e] border border-[#2a2136] rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3"><div className="w-12 h-12 rounded-full bg-zinc-800 border border-purple-500 flex items-center justify-center"><User size={24} className="text-zinc-500" /></div><div><p className="text-xs text-purple-400 font-semibold tracking-wider">SALAM,</p><h3 className="text-white font-bold text-lg">{username}</h3></div></div>
            <button className="bg-[#1c1526] border border-[#2a2136] text-xs text-zinc-300 px-3 py-1 rounded-full flex items-center gap-1">FREE <ArrowRight size={12} /></button>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2"><h3 className="text-xs font-bold text-zinc-400 tracking-wider">STATUS</h3><span className="text-xs text-purple-500 font-semibold">Lihat semua</span></div>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              <div className="flex flex-col items-center gap-1 min-w-[60px]"><div className="w-14 h-14 rounded-full border-2 border-dashed border-zinc-600 flex items-center justify-center bg-[#16111e]"><Plus size={20} className="text-zinc-400" /></div><span className="text-[10px] text-zinc-400">Tambah</span></div>
              {onlineUsers.map((name, i) => (
                <div key={i} className="flex flex-col items-center gap-1 min-w-[60px]"><div className="w-14 h-14 rounded-full border-2 border-purple-600 p-0.5"><div className="w-full h-full rounded-full bg-zinc-800 flex items-center justify-center text-purple-400 font-bold uppercase">{name.charAt(0)}</div></div><span className="text-[10px] text-zinc-300 truncate w-14 text-center">{name}</span></div>
              ))}
            </div>
          </div>
          <div className="bg-[#16111e] border border-[#2a2136] rounded-2xl p-4">
            <div className="flex justify-between items-center mb-3"><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-purple-900/50 flex items-center justify-center"><MessageSquare size={16} className="text-purple-400" /></div><h3 className="text-white font-bold text-sm">Global Chat</h3></div><div className="w-2 h-2 rounded-full bg-green-500"></div></div>
            <div className="bg-[#0f0a15] border border-[#2a2136] rounded-xl p-3 h-16 overflow-hidden mb-3"><p className="text-xs text-zinc-300 leading-relaxed">{globalMsgs.length > 0 ? (<><span className="text-purple-400 font-bold">{globalMsgs[globalMsgs.length - 1].from}:</span> {globalMsgs[globalMsgs.length - 1].msg}</>) : ("Belum ada pesan...")}</p></div>
            <button onClick={() => setActiveTab("chat")} className="w-full bg-[#1c1526] border border-[#2a2136] hover:bg-[#2a2136] text-white text-sm font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2"><MessageSquare size={16} /> Buka</button>
          </div>
        </main>
      );
    }

    return (
      <main className="px-4 max-w-md mx-auto mt-4 space-y-4">
        <div className="bg-[#16111e] border border-[#2a2136] rounded-2xl p-5">
          <h2 className="text-white font-bold mb-4 uppercase text-sm tracking-widest text-purple-400">{activeTab} TOOLS</h2>
          <input type="text" placeholder="Masukkan Target (Nomor / URL / NPSN / IP)" value={target} onChange={(e) => setTarget(e.target.value)} className="w-full bg-[#0f0a15] border border-[#2a2136] rounded-lg p-3 text-white text-sm mb-3" />
          {activeTab === 'bug' && (
            <select value={bugType} onChange={(e) => setBugType(e.target.value)} className="w-full bg-[#0f0a15] border border-[#2a2136] rounded-lg p-3 text-white text-sm mb-3">
              <option value="verload">Verload FC</option>
              <option value="forceclose">Force Close</option>
              <option value="crashcalls">Crash Calls</option>
            </select>
          )}
          <div className="grid grid-cols-2 gap-2">
            {activeTab === 'tools' && (
              <>
                <button onClick={() => handleToolRequest('/api/ceknpsn', { npsn: target })} className="bg-zinc-800 border border-zinc-700 text-white p-3 rounded-lg text-xs font-bold">Cek NPSN</button>
                <button onClick={() => handleToolRequest('/api/cekimei', { imei: target })} className="bg-zinc-800 border border-zinc-700 text-white p-3 rounded-lg text-xs font-bold">Cek IMEI</button>
              </>
            )}
            {activeTab === 'download' && (
              <>
                <button onClick={() => handleToolRequest('/api/download/tiktok', { url: target })} className="bg-zinc-800 border border-zinc-700 text-white p-3 rounded-lg text-xs font-bold">TikTok</button>
                <button onClick={() => handleToolRequest('/api/download/instagram', { url: target })} className="bg-zinc-800 border border-zinc-700 text-white p-3 rounded-lg text-xs font-bold">Instagram</button>
              </>
            )}
            {activeTab === 'osint' && (
              <>
                <button onClick={() => handleToolRequest('/api/osint-nomor', { nomor: target })} className="bg-zinc-800 border border-zinc-700 text-white p-3 rounded-lg text-xs font-bold">Cek Nomor</button>
                <button onClick={() => handleToolRequest('/api/osint-ip', { ip: target })} className="bg-zinc-800 border border-zinc-700 text-white p-3 rounded-lg text-xs font-bold">Cek IP</button>
              </>
            )}
            {activeTab === 'spam' && (
              <>
                <button onClick={() => handleToolRequest('/api/spamotp', { nomor: target })} className="bg-zinc-800 border border-zinc-700 text-white p-3 rounded-lg text-xs font-bold">Spam OTP</button>
                <button onClick={() => handleToolRequest('/api/spamcall', { nomor: target })} className="bg-zinc-800 border border-zinc-700 text-white p-3 rounded-lg text-xs font-bold">Spam Call</button>
              </>
            )}
            {activeTab === 'bug' && (
              <button onClick={() => handleToolRequest('/api/bug-wa', { target: target, senderId: username, type: bugType })} className="bg-red-900 border border-red-700 text-white p-3 rounded-lg text-xs font-bold col-span-2">KIRIM BUG</button>
            )}
          </div>
          {loadingTools && <p className="text-center text-xs text-purple-400 mt-4 animate-pulse">Memproses...</p>}
          {toolsResult && (
            <div className="mt-4 bg-black border border-zinc-800 p-3 rounded-lg max-h-40 overflow-y-auto">
              <pre className="text-[10px] text-zinc-400 whitespace-pre-wrap">{JSON.stringify(toolsResult, null, 2)}</pre>
            </div>
          )}
        </div>
      </main>
    );
  };

  // --- LAYOUT UTAMA ---
  return (
    <div className="min-h-screen bg-[#0f0a15] text-zinc-300 font-sans pb-24">
      <header className="p-4 flex items-center justify-between sticky top-0 bg-[#0f0a15]/90 backdrop-blur-md z-20">
        <Menu size={24} className="text-white" />
        <h1 className="text-white font-semibold text-lg capitalize">{activeTab}</h1>
        <div className="flex items-center gap-3"><User size={20} className="text-zinc-400" /><div className="relative"><Bell size={20} className="text-zinc-400" /><div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-[#0f0a15]"></div></div></div>
      </header>

      {renderContent()}

      {/* NAVBAR BAWAH */}
      <div className="fixed bottom-0 w-full bg-[#16111e] border-t border-[#2a2136] p-2 z-30">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide px-2">
           <button onClick={() => setActiveTab("home")} className="flex flex-col items-center min-w-[70px] p-2"><div className={`p-2 rounded-full ${activeTab === 'home' ? 'bg-purple-600 text-white' : 'text-zinc-500'}`}><Home size={20} /></div><span className="text-[10px] mt-1 text-zinc-400">Home</span></button>
           <button onClick={() => setActiveTab("tools")} className="flex flex-col items-center min-w-[70px] p-2"><div className={`p-2 rounded-full ${activeTab === 'tools' ? 'bg-purple-600 text-white' : 'text-zinc-500'}`}><Wrench size={20} /></div><span className="text-[10px] mt-1 text-zinc-400">Tools</span></button>
           <button onClick={() => setActiveTab("download")} className="flex flex-col items-center min-w-[70px] p-2"><div className={`p-2 rounded-full ${activeTab === 'download' ? 'bg-purple-600 text-white' : 'text-zinc-500'}`}><DownloadCloud size={20} /></div><span className="text-[10px] mt-1 text-zinc-400">Download</span></button>
           <button onClick={() => setActiveTab("osint")} className="flex flex-col items-center min-w-[70px] p-2"><div className={`p-2 rounded-full ${activeTab === 'osint' ? 'bg-purple-600 text-white' : 'text-zinc-500'}`}><Search size={20} /></div><span className="text-[10px] mt-1 text-zinc-400">OSINT</span></button>
           <button onClick={() => setActiveTab("spam")} className="flex flex-col items-center min-w-[70px] p-2"><div className={`p-2 rounded-full ${activeTab === 'spam' ? 'bg-purple-600 text-white' : 'text-zinc-500'}`}><MessageSquare size={20} /></div><span className="text-[10px] mt-1 text-zinc-400">Spam</span></button>
           <button onClick={() => setActiveTab("bug")} className="flex flex-col items-center min-w-[70px] p-2"><div className={`p-2 rounded-full ${activeTab === 'bug' ? 'bg-purple-600 text-white' : 'text-zinc-500'}`}><Bug size={20} /></div><span className="text-[10px] mt-1 text-zinc-400">Bug WA</span></button>
        </div>
      </div>
    </div>
  );
}
