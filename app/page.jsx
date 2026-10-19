"use client";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { 
  Home as HomeIcon, Menu, User, Lock, Eye, EyeOff, ArrowRight, 
  MessageSquare, Bell, Plus, Heart, Calendar, Wrench, 
  DownloadCloud, Search, Bug, Send, X, ChevronLeft, 
  ShieldAlert, Globe, Smartphone, FileText, Play, Pause, Gamepad2, Music, CheckCircle2,
  Dices, Swords, Bot, Grid3X3, Crown, CircleDollarSign, Users, Puzzle, Globe2, CreditCard
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
        <button onClick={() => { setShowIntro(false); setIsLoggedIn(true); }} className="absolute top-6 right-6 bg-black/60 border border-zinc-600 text-white px-5 py-2 rounded-full text-sm font-bold z-50 backdrop-blur-md shadow-lg hover:bg-black/80 transition-all">Skip ➔</button>
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

  // --- DATA GAME ---
  const gamesList = [
    { id: "catur", title: "Catur", desc: "Main catur klasik", icon: <Crown size={24} className="text-yellow-400" />, online: true, ai: true },
    { id: "domino", title: "Domino", desc: "Kartu domino 99", icon: <Grid3X3 size={24} className="text-blue-400" />, online: true, ai: true },
    { id: "uno", title: "Uno", desc: "Kartu warna warni", icon: <CircleDollarSign size={24} className="text-red-400" />, online: true, ai: true },
    { id: "spy", title: "Who's The Spy", desc: "Tebak kata rahasia", icon: <Users size={24} className="text-purple-400" />, online: true, ai: false },
    { id: "tictactoe", title: "Tic Tac Toe", desc: "X dan O", icon: <Grid3X3 size={24} className="text-green-400" />, online: true, ai: true },
    { id: "sos", title: "SOS", desc: "Game klasik SOS", icon: <Puzzle size={24} className="text-pink-400" />, online: true, ai: true },
    { id: "ular", title: "Ular Tangga", desc: "Naik tangga turun ular", icon: <Dices size={24} className="text-orange-400" />, online: true, ai: true },
  ];

  // --- HALAMAN GAME MENU ---
  const renderGameMenu = () => (
    <main className="px-4 max-w-md mx-auto mt-4">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => setActiveTab("home")} className="text-zinc-400 p-1 bg-[#16111e] rounded-lg border border-[#2a2136]"><ChevronLeft size={20}/></button>
        <h2 className="text-white font-bold text-lg">Game Arcade</h2>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {gamesList.map((game) => (
          <div key={game.id} className="bg-[#16111e] border border-[#2a2136] rounded-xl p-4 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-[#0f0a15] rounded-full flex items-center justify-center mb-2">{game.icon}</div>
            <h3 className="text-white font-bold text-sm">{game.title}</h3>
            <p className="text-[9px] text-zinc-500 mb-3">{game.desc}</p>
            
            <div className="flex flex-col gap-1 w-full mt-auto">
              {game.online && <button className="bg-purple-600/20 text-purple-400 border border-purple-600/50 text-[10px] font-bold py-1.5 rounded flex items-center justify-center gap-1 hover:bg-purple-600 hover:text-white transition-all"><Globe2 size={12}/> Online</button>}
              {game.ai && <button className="bg-zinc-800/50 text-zinc-300 border border-zinc-700 text-[10px] font-bold py-1.5 rounded flex items-center justify-center gap-1 hover:bg-zinc-700 transition-all"><Bot size={12}/> VS NPC</button>}
            </div>
          </div>
        ))}
      </div>
    </main>
  );

  // --- HALAMAN HOME ---
  const renderHome = () => (
    <main className="px-4 max-w-md mx-auto space-y-5">
      <div className="w-full h-44 bg-black rounded-2xl overflow-hidden relative shadow-lg border border-zinc-800">
        <video key={videoIndex} src={videoIndex === 0 ? VIDEO_1 : VIDEO_2} autoPlay muted playsInline className="w-full h-full object-cover" onEnded={() => videoIndex === 0 && setVideoIndex(1)} loop={videoIndex === 1} />
        <div className="absolute bottom-4 left-4 z-10"><h2 className="text-white font-bold text-lg">Mikasa Project</h2></div>
      </div>
      
      <div className="bg-[#16111e] border border-[#2a2136] rounded-2xl p-4 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-zinc-800 border-2 border-purple-500 flex items-center justify-center"><User size={32} className="text-zinc-500" /></div>
        <div className="flex-1"><div className="flex items-center gap-2"><h3 className="text-white font-bold text-lg">{username}</h3><span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${userRole === 'ADMIN' ? 'bg-red-600' : 'bg-purple-600'} text-white`}>{userRole}</span></div></div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-3"><h3 className="text-xs font-bold text-zinc-400 tracking-wider">STATUS</h3><span className="text-xs text-purple-500 font-semibold cursor-pointer">Lihat semua</span></div>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex flex-col items-center gap-1 min-w-[60px] cursor-pointer"><div className="w-14 h-14 rounded-full border-2 border-dashed border-zinc-600 flex items-center justify-center bg-[#16111e] relative"><Plus size={20} className="text-zinc-400" /><div className="absolute bottom-0 right-0 bg-purple-600 rounded-full p-0.5 border-2 border-[#0f0a15]"><Plus size={10} className="text-white"/></div></div><span className="text-[10px] text-zinc-400">Tambah</span></div>
          {onlineUsers.map((name, i) => (
            <div key={i} className="flex flex-col items-center gap-1 min-w-[60px]"><div className="w-14 h-14 rounded-full border-2 border-purple-600 p-0.5"><div className="w-full h-full rounded-full bg-zinc-800 overflow-hidden flex items-center justify-center"><img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}&backgroundColor=1a1a24`} alt={name} className="w-full h-full object-cover" /></div></div><span className="text-[10px] text-zinc-300 truncate w-14 text-center">{name}</span></div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold text-zinc-400 tracking-wider mb-2">NOW PLAYING</h3>
        <div className="bg-[#16111e] border border-[#2a2136] rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isPlaying ? 'bg-green-900/50' : 'bg-zinc-800'}`}><Music size={20} className={isPlaying ? 'text-green-500' : 'text-zinc-500'} /></div><div><p className="text-sm text-zinc-300 font-semibold">{musicQuery || "Belum ada lagu"}</p><p className="text-[10px] text-zinc-500">{musicQuery ? "Mikasa Music" : "Buka Music library"}</p></div></div>
          <ArrowRight size={16} className="text-zinc-500" />
        </div>
      </div>

      <div className="bg-[#16111e] border border-[#2a2136] rounded-2xl p-4">
        <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2"><Music size={16} className="text-purple-400"/> Music Library</h3>
        <div className="flex gap-2 mb-3">
          <input type="text" placeholder="Cari lagu..." value={musicQuery} onChange={(e) => setMusicQuery(e.target.value)} className="flex-1 bg-[#0f0a15] border border-[#2a2136] rounded-lg p-2 text-sm text-white" />
          <button className="bg-purple-600 p-2 rounded-lg text-white"><Search size={18}/></button>
        </div>
        <button onClick={() => setIsPlaying(!isPlaying)} className="w-full bg-[#1c1526] border border-[#2a2136] py-2 rounded-lg text-white font-semibold flex justify-center items-center gap-2">
           {isPlaying ? <><Pause size={16}/> Pause Lagu</> : <><Play size={16}/> Putar Lagu</>}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setActiveTab("games")} className="bg-[#1e182b] border border-purple-900/50 rounded-xl p-3 flex flex-col items-start gap-1 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
          <Gamepad2 size={20} className="text-purple-400 mb-1" /><span className="text-sm font-bold text-white">Main Game</span><span className="text-[10px] text-zinc-400">Buka menu game</span>
        </button>
        <button className="bg-[#2a1620] border border-red-900/50 rounded-xl p-3 flex flex-col items-start gap-1">
          <Heart size={20} className="text-red-400 mb-1" /><span className="text-sm font-bold text-white">Donasi</span><span className="text-[10px] text-zinc-400">Dukung Mikasa</span>
        </button>
      </div>

      <div className="bg-[#16111e] border border-[#2a2136] rounded-2xl p-4">
        <div className="flex justify-between items-center mb-3"><h3 className="text-white font-bold text-sm">Global Chat</h3></div>
        <div className="bg-[#0f0a15] border border-[#2a2136] rounded-xl p-3 h-16 overflow-hidden mb-3"><p className="text-xs text-zinc-300">{globalMsgs.length > 0 ? (<><span className="text-purple-400 font-bold">{globalMsgs[globalMsgs.length - 1].from}:</span> {globalMsgs[globalMsgs.length - 1].msg}</>) : ("Belum ada pesan...")}</p></div>
        <button onClick={() => setActiveTab("chat")} className="w-full bg-[#1c1526] border border-[#2a2136] text-white text-sm font-semibold py-2.5 rounded-xl">Buka</button>
      </div>
    </main>
  );

  // --- RENDER HALAMAN ---
  const renderContent = () => {
    if (activeTab === "home") return renderHome();
    if (activeTab === "games") return renderGameMenu();

    if (activeTab === "chat") {
      return (
        <div className="flex flex-col h-[calc(100vh-130px)]">
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
            <input type="text" value={msgInput} onChange={e=>setMsgInput(e.target.value)} placeholder="Ketik pesan..." className="flex-1 bg-[#0f0a15] border border-[#2a2136] rounded-full px-4 py-2 text-sm text-white focus:outline-none" />
            <button type="submit" className="bg-purple-600 p-2 rounded-full text-white"><Send size={16} /></button>
          </form>
        </div>
      );
    }

    if (selectedTool) {
      return (
        <main className="px-4 max-w-md mx-auto mt-4">
           <button onClick={() => { setSelectedTool(null); setToolsResult(null); setTarget(""); }} className="text-zinc-400 text-sm mb-4 flex items-center gap-1"><ChevronLeft size={16} /> Kembali</button>
           <div className="bg-[#16111e] border border-[#2a2136] rounded-2xl p-5">
             <h2 className="text-white font-bold mb-4 uppercase text-sm tracking-widest text-purple-400">{selectedTool.title}</h2>
             <input type="text" placeholder="Masukkan Target" value={target} onChange={(e) => setTarget(e.target.value)} className="w-full bg-[#0f0a15] border border-[#2a2136] rounded-lg p-3 text-white text-sm mb-4" />
             <button onClick={() => handleToolRequest(selectedTool.endpoint, selectedTool.payload)} className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl">EKSEKUSI</button>
             {loadingTools && <p className="text-center text-xs text-purple-400 mt-4 animate-pulse">Memproses...</p>}
             {toolsResult && (<div className="mt-4 bg-black border border-zinc-800 p-3 rounded-lg max-h-40 overflow-y-auto"><pre className="text-[10px] text-zinc-400 whitespace-pre-wrap">{JSON.stringify(toolsResult, null, 2)}</pre></div>)}
           </div>
        </main>
      );
    }

    // --- DATA MENU LENGKAP ---
    const menuData = {
      tools: [
        { title: "Cek NPSN", desc: "Cari data sekolah", icon: <FileText size={24} className="text-blue-400" />, endpoint: "/api/ceknpsn", payload: { npsn: target } },
        { title: "Cek IMEI", desc: "Spesifikasi HP", icon: <Smartphone size={24} className="text-green-400" />, endpoint: "/api/cekimei", payload: { imei: target } },
        { title: "Cek FreeFire", desc: "Cek akun FF", icon: <Gamepad2 size={24} className="text-yellow-400" />, endpoint: "/api/cekff", payload: { uid: target } },
        { title: "Cek Roblox", desc: "Cek akun Roblox", icon: <Gamepad2 size={24} className="text-red-400" />, endpoint: "/api/cekroblox", payload: { username: target } },
        { title: "Cek Resi", desc: "Lacak paket", icon: <FileText size={24} className="text-orange-400" />, endpoint: "/api/cekresi", payload: { courier: "jne", awb: target } }
      ],
      osint: [
        { title: "OSINT Nomor", desc: "Lacak nomor HP", icon: <Search size={24} className="text-yellow-400" />, endpoint: "/api/osint-nomor", payload: { nomor: target } },
        { title: "OSINT IP", desc: "Lacak IP Address", icon: <Globe size={24} className="text-blue-400" />, endpoint: "/api/osint-ip", payload: { ip: target } },
        { title: "NIK Parse", desc: "Bongkar data NIK", icon: <User size={24} className="text-purple-400" />, endpoint: "/api/nikparse", payload: { nik: target } },
        { title: "Cek E-Wallet", desc: "Cek kepemilikan wallet", icon: <CreditCard size={24} className="text-green-400" />, endpoint: "/api/cekwallet", payload: { nomor: target } },
        { title: "Cek Band WA", desc: "Cek banned WA", icon: <ShieldAlert size={24} className="text-red-400" />, endpoint: "/api/cekbandwa", payload: { nomor: target } }
      ],
      download: [
        { title: "TikTok DL", desc: "Unduh video TikTok", icon: <DownloadCloud size={24} className="text-pink-400" />, endpoint: "/api/download/tiktok", payload: { url: target } },
        { title: "Instagram DL", desc: "Unduh foto/video IG", icon: <DownloadCloud size={24} className="text-purple-400" />, endpoint: "/api/download/instagram", payload: { url: target } },
        { title: "Facebook DL", desc: "Unduh video FB", icon: <DownloadCloud size={24} className="text-blue-400" />, endpoint: "/api/download/facebook", payload: { url: target } },
        { title: "Spotify DL", desc: "Unduh lagu Spotify", icon: <Music size={24} className="text-green-400" />, endpoint: "/api/download/spotify", payload: { url: target } }
      ],
      spam: [
        { title: "Spam OTP", desc: "Kirim OTP massal", icon: <MessageSquare size={24} className="text-blue-400" />, endpoint: "/api/spamotp", payload: { nomor: target } },
        { title: "Spam Call", desc: "Kirim panggilan", icon: <Smartphone size={24} className="text-green-400" />, endpoint: "/api/spamcall", payload: { nomor: target } },
        { title: "Spam Pair", desc: "Kirim kode pairing", icon: <FileText size={24} className="text-yellow-400" />, endpoint: "/api/spampair", payload: { nomor: target } },
        { title: "Spam Report WA", desc: "Laporkan WA target", icon: <ShieldAlert size={24} className="text-red-400" />, endpoint: "/api/spamrepwa", payload: { nomor: target } }
      ],
      bug: [
        { title: "Verload FC", desc: "Force Close", icon: <Bug size={24} className="text-red-500" />, endpoint: "/api/bug-wa", payload: { target: target, senderId: username, type: "verload" } },
        { title: "Invisible FC", desc: "Invisible Crash", icon: <Bug size={24} className="text-purple-500" />, endpoint: "/api/bug-wa", payload: { target: target, senderId: username, type: "invisible" } },
        { title: "Crash Calls", desc: "Bug panggilan", icon: <Bug size={24} className="text-yellow-500" />, endpoint: "/api/bug-wa", payload: { target: target, senderId: username, type: "crashcalls" } },
        { title: "Button Crash", desc: "Tombol rusak", icon: <Bug size={24} className="text-blue-500" />, endpoint: "/api/bug-wa", payload: { target: target, senderId: username, type: "button" } }
      ]
    };

    const items = menuData[activeTab] || [];
    return (
      <main className="px-4 max-w-md mx-auto mt-4 space-y-4">
        {items.map((item, idx) => (
          <div key={idx} onClick={() => setSelectedTool(item)} className="bg-[#16111e] border border-[#2a2136] rounded-2xl p-5 flex items-center gap-4 cursor-pointer hover:border-purple-600 transition-all shadow-lg">
            <div className="w-14 h-14 rounded-2xl bg-[#0f0a15] border border-[#2a2136] flex items-center justify-center flex-shrink-0">{item.icon}</div>
            <div className="flex-1"><h3 className="text-white font-bold text-sm">{item.title}</h3><p className="text-xs text-zinc-400 mt-1">{item.desc}</p></div>
            <div className="bg-purple-600 p-2 rounded-full text-white"><ArrowRight size={16} /></div>
          </div>
        ))}
      </main>
    );
  };

  // --- LAYOUT UTAMA ---
  return (
    <div className="min-h-screen bg-[#0f0a15] text-zinc-300 font-sans pb-24">
      <header className="p-4 flex items-center justify-between sticky top-0 bg-[#0f0a15]/90 backdrop-blur-md z-20">
        <Menu size={24} className="text-white" />
        <h1 className="text-white font-semibold text-lg capitalize">{activeTab === "games" ? "Game Arcade" : activeTab}</h1>
        <User size={20} className="text-zinc-400" />
      </header>

      {renderContent()}

      {/* NAVBAR BAWAH */}
      <div className="fixed bottom-0 w-full bg-[#16111e] border-t border-[#2a2136] p-2 z-30">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide px-2">
           <button onClick={() => { setActiveTab("home"); setSelectedTool(null); }} className="flex flex-col items-center min-w-[70px] p-2"><div className={`p-2 rounded-full ${activeTab === 'home' ? 'bg-purple-600 text-white' : 'text-zinc-500'}`}><HomeIcon size={20} /></div><span className="text-[10px] text-zinc-400">Home</span></button>
           <button onClick={() => { setActiveTab("tools"); setSelectedTool(null); }} className="flex flex-col items-center min-w-[70px] p-2"><div className={`p-2 rounded-full ${activeTab === 'tools' ? 'bg-purple-600 text-white' : 'text-zinc-500'}`}><Wrench size={20} /></div><span className="text-[10px] text-zinc-400">Tools</span></button>
           <button onClick={() => { setActiveTab("download"); setSelectedTool(null); }} className="flex flex-col items-center min-w-[70px] p-2"><div className={`p-2 rounded-full ${activeTab === 'download' ? 'bg-purple-600 text-white' : 'text-zinc-500'}`}><DownloadCloud size={20} /></div><span className="text-[10px] text-zinc-400">Download</span></button>
           <button onClick={() => { setActiveTab("osint"); setSelectedTool(null); }} className="flex flex-col items-center min-w-[70px] p-2"><div className={`p-2 rounded-full ${activeTab === 'osint' ? 'bg-purple-600 text-white' : 'text-zinc-500'}`}><Search size={20} /></div><span className="text-[10px] text-zinc-400">OSINT</span></button>
           <button onClick={() => { setActiveTab("spam"); setSelectedTool(null); }} className="flex flex-col items-center min-w-[70px] p-2"><div className={`p-2 rounded-full ${activeTab === 'spam' ? 'bg-purple-600 text-white' : 'text-zinc-500'}`}><MessageSquare size={20} /></div><span className="text-[10px] text-zinc-400">Spam</span></button>
           <button onClick={() => { setActiveTab("bug"); setSelectedTool(null); }} className="flex flex-col items-center min-w-[70px] p-2"><div className={`p-2 rounded-full ${activeTab === 'bug' ? 'bg-purple-600 text-white' : 'text-zinc-500'}`}><Bug size={20} /></div><span className="text-[10px] text-zinc-400">Bug WA</span></button>
        </div>
      </div>
    </div>
  );
}
