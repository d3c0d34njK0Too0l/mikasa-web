"use client";
import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { 
  Home as HomeIcon, Menu, User, Lock, Eye, EyeOff, ArrowRight, 
  MessageSquare, Bell, Plus, Heart, Wrench, DownloadCloud, 
  Search, Bug, Send, X, ChevronLeft, ShieldAlert, Globe, 
  FileText, Play, Pause, Gamepad2, Music, CheckCircle2, 
  Dices, Bot, Grid3X3, Crown, CircleDollarSign, Users, 
  Puzzle, Globe2, Loader2, LogOut, Settings, Camera,
  Clock, Shield, Phone, Terminal, Link, Mail, MapPin, 
  CreditCard, Smartphone, Server, Flame, School, Ban, UserSearch,
  PlayCircle, Database, Fingerprint, Cpu, Lightbulb, Video, AlertTriangle
} from "lucide-react";

import { GameCatur, GameUno, GameUlarTangga, GameSpy, GameTicTacToe } from "./gameEngine";

const API_URL = "https://api-mikasacloud.my.id";
const API_KEY = "rahasia_banget_123";
const VIDEO_1 = "https://j.top4top.io/m_3944kuzbh0.mp4"; 
const VIDEO_2 = "https://d.top4top.io/m_3944j368i0.mp4"; 
const INTRO_VIDEO = "https://c.top4top.io/m_39443olav1.mp4";
const INTRO_AUDIO = "https://l.top4top.io/m_3944pw6n51.mp3";
const SOUND_1 = "https://b.top4top.io/m_39442c6f31.m4a";
const SOUND_2 = "https://k.top4top.io/m_3944rcsvx1.mp3";
const RAT_VIDEO = "https://a.top4top.io/m_39451serc1.mp4"; // Video Header RAT

let globalAudio = null; 
let bgmAudio = null;    

const ALL_TOOLS = [
  { id: 'spamotp', name: "Spam OTP", sub: "Bomb OTP", desc: "Mengirim spam OTP massal ke nomor target.", endpoint: "/api/spamotp", payload: "nomor", placeholder: "628xxx", cat: "Spam", icon: MessageSquare, color: "text-pink-500" },
  { id: 'spamcall', name: "Spam Call", sub: "Bomb Call", desc: "Melakukan panggilan spam ke nomor target.", endpoint: "/api/spamcall", payload: "nomor", placeholder: "628xxx", cat: "Spam", icon: Phone, color: "text-red-500" },
  { id: 'spampair', name: "Spam Pair", sub: "Bomb Pairing", desc: "Mengirim permintaan pairing WhatsApp massal.", endpoint: "/api/spampair", payload: "nomor", placeholder: "628xxx", cat: "Spam", icon: Link, color: "text-orange-500" },
  { id: 'spamngl', name: "Spam NGL", sub: "Bomb NGL", desc: "Mengirim pesan anonim massal ke akun NGL.", endpoint: "/api/spamngl", payload: "username", placeholder: "username", cat: "Spam", icon: UserSearch, color: "text-yellow-500" },
  { id: 'spamrepwa', name: "Spam Rep", sub: "Report WA", desc: "Mengirim laporan spam ke WhatsApp.", endpoint: "/api/spamrepwa", payload: "nomor", placeholder: "628xxx", cat: "Spam", icon: ShieldAlert, color: "text-rose-500" },
  { id: 'spamgmail', name: "Spam Mail", sub: "Bomb Email", desc: "Mengirim spam email ke alamat target.", endpoint: "/api/spamgmail", payload: "email", placeholder: "email@gmail.com", cat: "Spam", icon: Mail, color: "text-blue-400" },
  
  { id: 'osintnomor', name: "OSINT Nomor", sub: "Lacak Nomor", desc: "Melacak informasi dari nomor HP target.", endpoint: "/api/osint-nomor", payload: "nomor", placeholder: "628xxx", cat: "OSINT", icon: Smartphone, color: "text-cyan-500" },
  { id: 'osintusername', name: "OSINT Usr", sub: "Lacak Usn", desc: "Melacak akun media sosial berdasarkan username.", endpoint: "/api/osint-username", payload: "username", placeholder: "username", cat: "OSINT", icon: UserSearch, color: "text-teal-500" },
  { id: 'iptracker', name: "IP Tracker", sub: "Lacak IP", desc: "Melacak lokasi dan info dari alamat IP.", endpoint: "/api/iptracker", payload: "ip", placeholder: "8.8.8.8", cat: "OSINT", icon: Globe, color: "text-indigo-500" },
  { id: 'portscan', name: "Port Scan", sub: "Scan Port", desc: "Memindai port terbuka pada domain target.", endpoint: "/api/portscan", payload: "domain", placeholder: "domain.com", cat: "OSINT", icon: Server, color: "text-violet-500" },
  { id: 'nikparse', name: "NIK Parse", sub: "Baca NIK", desc: "Membaca informasi dari nomor NIK.", endpoint: "/api/nikparse", payload: "nik", placeholder: "16 digit", cat: "OSINT", icon: FileText, color: "text-fuchsia-500" },
  { id: 'cekwallet', name: "Cek Wallet", sub: "Cek E-Wallet", desc: "Mengecek kepemilikan e-wallet dari nomor.", endpoint: "/api/cekwallet", payload: "nomor", placeholder: "08xxx", cat: "OSINT", icon: CreditCard, color: "text-emerald-500" },
  { id: 'doxschool', name: "DoxSchool", sub: "Dump Data", desc: "Dump database sekolah berdasarkan NPSN.", endpoint: "/api/doxschool", payload: "npsn", placeholder: "8 digit NPSN", cat: "OSINT", icon: Database, color: "text-amber-500" },
  
  { id: 'bug-wa-verload', name: "Verload FC", sub: "Bug WA", desc: "Mengirim bug Verload FC ke target.", endpoint: "/api/bug-wa", payload: "target", placeholder: "628xxx", cat: "BugWA", icon: Flame, color: "text-red-600", extra: {type: "verload"} },
  { id: 'bug-wa-forceclose', name: "Force Close", sub: "Bug WA", desc: "Mengirim bug Force Close ke target.", endpoint: "/api/bug-wa", payload: "target", placeholder: "628xxx", cat: "BugWA", icon: Bug, color: "text-orange-600", extra: {type: "forceclose"} },
  { id: 'bug-wa-crashcall', name: "Crash Call", sub: "Bug WA", desc: "Mengirim bug Crash Call ke target.", endpoint: "/api/bug-wa", payload: "target", placeholder: "628xxx", cat: "BugWA", icon: Phone, color: "text-rose-600", extra: {type: "crashes"} },
  
  { id: 'tt', name: "TikTok DL", sub: "Unduh Video", desc: "Mengunduh video dari link TikTok.", endpoint: "/api/download/tiktok", payload: "url", placeholder: "Link TikTok", cat: "Download", icon: DownloadCloud, color: "text-pink-400" },
  { id: 'ig', name: "IG DL", sub: "Unduh Foto", desc: "Mengunduh foto/video dari link Instagram.", endpoint: "/api/download/instagram", payload: "url", placeholder: "Link IG", cat: "Download", icon: Camera, color: "text-purple-400" },
  { id: 'fb', name: "FB DL", sub: "Unduh Video", desc: "Mengunduh video dari link Facebook.", endpoint: "/api/download/facebook", payload: "url", placeholder: "Link FB", cat: "Download", icon: Globe, color: "text-blue-600" },
  
  { id: 'cekkodepos', name: "Kode Pos", sub: "Cari Wilayah", desc: "Mencari informasi wilayah dari kode pos.", endpoint: "/api/cekkodepos", payload: "kodepos", placeholder: "16112", cat: "Utility", icon: MapPin, color: "text-lime-500" },
  { id: 'ceknpsn', name: "Cek NPSN", sub: "Data Sekolah", desc: "Mencari data sekolah berdasarkan NPSN.", endpoint: "/api/ceknpsn", payload: "npsn", placeholder: "40203594", cat: "Utility", icon: School, color: "text-amber-500" },
  { id: 'cekff', name: "Cek FF", sub: "Nickname FF", desc: "Mengecek nickname Free Fire dari UID.", endpoint: "/api/cekff", payload: "uid", placeholder: "UID FF", cat: "Utility", icon: Flame, color: "text-orange-500" },
  { id: 'cekroblox', name: "Cek Roblox", sub: "Nickname Roblox", desc: "Mengecek profil Roblox dari username.", endpoint: "/api/cekroblox", payload: "username", placeholder: "Username", cat: "Utility", icon: Gamepad2, color: "text-red-400" },
  { id: 'gtk', name: "Data GTK", sub: "Cari Guru", desc: "Mencari data guru berdasarkan nama/NUPTK.", endpoint: "/api/cekdataguru", payload: "keyword", placeholder: "Nama/NUPTK", cat: "Utility", icon: Users, color: "text-sky-500" },
  { id: 'cekbandwa', name: "Cek Band", sub: "Status WA", desc: "Mengecek status band nomor WhatsApp.", endpoint: "/api/cekbandwa", payload: "nomor", placeholder: "628xxx", cat: "Utility", icon: Ban, color: "text-red-700" },
];

const CATEGORIES = ["Semua", "Spam", "OSINT", "BugWA", "Download", "Utility"];

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showIntro, setShowIntro] = useState(false); 
  const [showTapToPlay, setShowTapToPlay] = useState(false); 
  const [isScanning, setIsScanning] = useState(false); 
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [userRole, setUserRole] = useState("FREE");
  const [userProfile, setUserProfile] = useState({ name: "", avatar: "", expired: "2054-02-25" });

  const [activeTab, setActiveTab] = useState("home");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMusicLibrary, setShowMusicLibrary] = useState(false);
  const [videoIndex, setVideoIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState("");
  const [runtime, setRuntime] = useState("00:00");

  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [globalMsgs, setGlobalMsgs] = useState([]);
  const [msgInput, setMsgInput] = useState("");
  const [chatMode, setChatMode] = useState("global"); 
  const [chatTarget, setChatTarget] = useState(null); 
  const [privateMsgs, setPrivateMsgs] = useState([]);

  const [toolCategory, setToolCategory] = useState("Semua");
  const [activeTool, setActiveTool] = useState(null); 
  
  const [toolTarget, setToolTarget] = useState("");
  const [toolResult, setToolResult] = useState(null);
  const [toolLoading, setToolLoading] = useState(false);
  
  const [senderActive, setSenderActive] = useState(false);
  const [showSenderModal, setShowSenderModal] = useState(false);
  const [senderNumber, setSenderNumber] = useState("");
  const [senderCode, setSenderCode] = useState("");
  const [senderLoading, setSenderLoading] = useState(false);

  const [activeGame, setActiveGame] = useState(null); 

  const [musicSearch, setMusicSearch] = useState("");
  const [musicResults, setMusicResults] = useState([]);
  const [loadingMusic, setLoadingMusic] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // RAT DUMMY STATES
  const [ratStates, setRatStates] = useState({
    flashlight: false,
    lock: false,
    video: false,
    lag: false
  });

  const toggleRat = (key) => {
    setRatStates(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const startBGM = () => {
    if (bgmAudio) return; 
    bgmAudio = new Audio(SOUND_1);
    bgmAudio.play().then(() => {
      bgmAudio.onended = () => {
        bgmAudio = new Audio(SOUND_2);
        bgmAudio.loop = true;
        bgmAudio.play().catch(e => console.log(e));
      };
    }).catch(e => console.log("Autoplay blocked:", e));
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("mikasa_user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUsername(parsed.username);
      setUserRole(parsed.role);
      setUserProfile(parsed.profile || { name: parsed.username, avatar: "", expired: "2054-02-25" });
      setIsLoggedIn(true);
      setShowTapToPlay(true); 
    }

    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('id-ID', { hour12: false, hour: '2-digit', minute: '2-digit' }));
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setRuntime(`${hours}:${minutes}`);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch("https://raw.githubusercontent.com/d3c0d34njK0Too0l/mikasa-web/main/users.json");
      const users = await res.json();
      const validUser = users.find(u => u.username === username && u.password === password);
      
      if (validUser) {
        const role = validUser.role ? validUser.role.toUpperCase() : "FREE";
        setUserRole(role);
        const profile = { name: username, avatar: "", expired: "2054-02-25" };
        setUserProfile(profile);
        localStorage.setItem("mikasa_user", JSON.stringify({ username, role, profile }));
        setShowIntro(true);
      } else {
        setLoginError("Akun tidak ditemukan.");
      }
    } catch (err) {
      setLoginError("Gagal terhubung ke database.");
    }
  };

  const handleSkipIntro = () => {
    setShowIntro(false);
    setIsLoggedIn(true);
    startBGM(); 
    setShowTapToPlay(false); 
  };

  const handleFingerprintTap = () => {
    if (isScanning) return;
    setIsScanning(true);
    
    setTimeout(() => {
      startBGM();
      setShowTapToPlay(false);
      setIsScanning(false);
    }, 1500);
  };

  const handleLogout = () => {
    localStorage.removeItem("mikasa_user");
    setIsLoggedIn(false);
    setUsername("");
    setPassword("");
    setIsSidebarOpen(false);
    if(socket) socket.close();
    if(bgmAudio) { bgmAudio.pause(); bgmAudio = null; }
    if(globalAudio) { globalAudio.pause(); globalAudio = null; }
  };

  useEffect(() => {
    if (isLoggedIn && !showIntro) {
      const newSocket = io(API_URL);
      setSocket(newSocket);
      newSocket.emit('user_online', username);
      newSocket.on('update_online_users', (users) => setOnlineUsers(users.filter(u => u !== username)));
      newSocket.on('receive_global_msg', (data) => setGlobalMsgs((prev) => [...prev, data]));
      newSocket.on('receive_private_msg', (data) => setPrivateMsgs((prev) => [...prev, data]));
      return () => newSocket.close();
    }
  }, [isLoggedIn, showIntro, username]);

  const sendGlobalMsg = (e) => {
    e.preventDefault();
    if (!msgInput.trim() || !socket) return;
    socket.emit('send_global_msg', { from: username, msg: msgInput });
    setMsgInput("");
  };

  const sendPrivateMsg = (e) => {
    e.preventDefault();
    if (!msgInput.trim() || !socket || !chatTarget) return;
    const data = { from: username, to: chatTarget, msg: msgInput };
    socket.emit('send_private_msg', data);
    setMsgInput("");
  };

  const openPrivateChat = (targetUser) => {
    setChatTarget(targetUser);
    setChatMode("private");
    setPrivateMsgs([]); 
    setActiveTab("chat");
  };

  const handleSearchMusic = async (e) => {
    if (e) e.preventDefault();
    if (!musicSearch.trim()) return;
    setLoadingMusic(true);
    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(musicSearch)}&media=music&limit=25`);
      const data = await res.json();
      setMusicResults(data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMusic(false);
    }
  };

  const togglePlay = (e) => {
    if (e) e.stopPropagation();
    if (!globalAudio) return;
    if (isPlaying) {
      globalAudio.pause();
      setIsPlaying(false);
    } else {
      globalAudio.play();
      setIsPlaying(true);
    }
  };

  const playMusic = (track) => {
    if (!track.previewUrl) return alert("Lagu tidak ada preview.");
    if (bgmAudio) { bgmAudio.pause(); bgmAudio = null; } 
    if (currentSong?.trackId === track.trackId) { togglePlay(); return; }
    if (globalAudio) { globalAudio.pause(); globalAudio.currentTime = 0; }
    globalAudio = new Audio(track.previewUrl);
    globalAudio.play();
    globalAudio.onended = () => setIsPlaying(false);
    setCurrentSong(track);
    setIsPlaying(true);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updatedProfile = { ...userProfile };
    const savedUser = JSON.parse(localStorage.getItem("mikasa_user"));
    savedUser.profile = updatedProfile;
    localStorage.setItem("mikasa_user", JSON.stringify(savedUser));
    setUserProfile(updatedProfile);
    setShowProfileModal(false);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUserProfile(prev => ({ ...prev, avatar: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const executeTool = async () => {
    if (!activeTool || !toolTarget) return;
    setToolLoading(true);
    setToolResult(null);

    let payloadBody = {};
    if (activeTool.extra) Object.assign(payloadBody, activeTool.extra);
    payloadBody[activeTool.payload] = toolTarget;

    if (activeTool.id === 'spamgmail') {
        payloadBody.email = toolTarget;
        payloadBody.message = "Pesan spam dari Mikasa Web"; 
    }

    try {
      const res = await fetch(`${API_URL}${activeTool.endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
        body: JSON.stringify(payloadBody)
      });
      const data = await res.json();
      setToolResult(data);
    } catch (err) {
      setToolResult({ status: false, error: "Gagal terhubung ke API. Cek Tunnel Pterodactyl lu." });
    } finally {
      setToolLoading(false);
    }
  };

  const handleSenderPairing = async () => {
    if(senderNumber.length < 10) return alert("Nomor gak valid");
    setSenderLoading(true);
    setSenderCode("");
    try {
      const res = await fetch(`${API_URL}/api/pairing`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
        body: JSON.stringify({ nomor: senderNumber, userId: username })
      });
      const data = await res.json();
      if(data.code) {
         setSenderCode(data.code);
         setSenderActive(true);
      } else {
         alert(data.error || "Gagal dapet kode pairing");
      }
    } catch (err) {
      alert("Gagal konek ke server Pterodactyl.");
    } finally {
      setSenderLoading(false);
    }
  };

  const renderToolResult = (data) => {
    if (!data) return null;

    const renderValue = (val) => {
      if (val === null) return <span className="text-zinc-500 italic">null</span>;
      if (typeof val === 'boolean') return <span className={val ? "text-green-400" : "text-red-400"}>{val.toString()}</span>;
      if (typeof val === 'string' || typeof val === 'number') return <span className="text-white break-words">{val.toString()}</span>;
      
      if (Array.isArray(val)) {
        if (val.length === 0) return <span className="text-zinc-500 italic">Kosong</span>;
        return (
          <div className="pl-3 border-l border-zinc-700 mt-1 space-y-2">
            {val.map((item, i) => (
              <div key={i} className="text-xs">
                <span className="text-zinc-500 mr-2">#{i + 1}</span>
                {renderValue(item)}
              </div>
            ))}
          </div>
        );
      }
      
      if (typeof val === 'object') {
        return (
          <div className="pl-3 border-l border-zinc-700 mt-1 space-y-1">
            {Object.entries(val).map(([k, v]) => (
              <div key={k} className="flex flex-col sm:flex-row sm:items-start gap-1">
                <span className="text-zinc-400 text-xs capitalize min-w-[100px]">{k.replace(/_/g, ' ')}</span>
                <span className="text-xs flex-1">{renderValue(v)}</span>
              </div>
            ))}
          </div>
        );
      }
      return null;
    };

    return (
      <div className="mt-4 bg-[#16111e] border border-zinc-700 rounded-xl p-4 overflow-hidden">
        <h4 className="text-white font-bold text-sm mb-3 flex items-center gap-2 border-b border-zinc-700 pb-2">
          <CheckCircle2 size={16} className="text-green-500" /> Hasil Eksekusi
        </h4>
        <div className="space-y-2">
           {Object.entries(data).map(([key, value]) => {
             if (key === 'status' && value === true) return null;
             
             return (
               <div key={key} className="flex flex-col">
                 <span className="text-zinc-400 text-xs font-bold capitalize mb-1">{key.replace(/_/g, ' ')}</span>
                 <div className="bg-black/40 p-2 rounded-lg border border-zinc-800">
                    {renderValue(value)}
                 </div>
               </div>
             );
           })}
        </div>
      </div>
    );
  };


  // --- RENDERS ---
  if (showIntro) {
    return (
      <div className="min-h-screen bg-black relative flex items-center justify-center">
        <video autoPlay muted playsInline className="w-full h-full object-cover absolute inset-0" onEnded={handleSkipIntro}>
          <source src={INTRO_VIDEO} type="video/mp4" />
        </video>
        <audio autoPlay><source src={INTRO_AUDIO} type="audio/mpeg" /></audio>
        <button onClick={handleSkipIntro} className="absolute top-6 right-6 bg-transparent border border-white/50 text-white px-5 py-2 rounded-full text-sm font-bold z-50 hover:bg-white/20 transition-all">
          Skip ➔
        </button>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0f0a15] flex flex-col items-center justify-center p-4">
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-zinc-500 mb-4 shadow-[0_0_20px_rgba(100,100,100,0.4)]">
          <img src="https://e.top4top.io/p_3944jt7561.jpg" alt="Logo" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-widest mb-8">MIKASA PROJECT</h1>
        <div className="bg-[#1c1c1e] p-6 rounded-2xl shadow-2xl w-full max-w-sm border border-zinc-700">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-[#0f0a15] border border-zinc-700 rounded-lg p-3 text-white" placeholder="Username" />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#0f0a15] border border-zinc-700 rounded-lg p-3 pr-10 text-white" placeholder="Password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-zinc-500">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
            </div>
            {loginError && <div className="text-red-500 text-xs text-center">{loginError}</div>}
            <button type="submit" className="w-full bg-zinc-600 hover:bg-zinc-500 text-white font-bold py-3 rounded-lg">Login</button>
          </form>
        </div>
      </div>
    );
  }

  // --- HALAMAN TOOLS ---
  if (activeTool) {
    return (
      <div className="min-h-screen bg-[#0f0a15] text-zinc-300 font-sans pb-24">
        <header className="p-4 flex items-center justify-between sticky top-0 bg-[#0f0a15]/90 backdrop-blur-md z-30 border-b border-zinc-800">
          <button onClick={() => { setActiveTool(null); setToolTarget(""); setToolResult(null); }} className="text-white p-2">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-white font-semibold text-lg capitalize flex-1 ml-2">{activeTool.name}</h1>
        </header>

        <main className="px-4 max-w-md mx-auto mt-2 space-y-4">
          {/* HEADER JAM */}
          <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-600/20 blur-3xl rounded-full"></div>
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-white text-2xl font-bold leading-tight mb-2">{activeTool.name}</h2>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1 bg-zinc-800/80 border border-zinc-700 px-3 py-1.5 rounded-lg text-xs text-zinc-300">
                    <Shield size={12} /> {userRole}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center w-24 h-24 rounded-full border-2 border-zinc-600 bg-zinc-800/50 shadow-inner">
                <span className="text-white text-2xl font-bold">{currentTime}</span>
                <span className="text-[9px] text-zinc-400 tracking-widest mt-1">WAKTU</span>
              </div>
            </div>
          </div>

          {/* 3 TOMBOL BARIS */}
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => { setChatMode("global"); setActiveTab("chat"); setActiveTool(null); }} className="bg-blue-600 hover:bg-blue-500 transition-colors rounded-xl p-3 flex flex-col items-center justify-center gap-1 shadow-lg shadow-blue-900/20">
              <MessageSquare size={20} className="text-white" />
              <span className="text-white text-xs font-bold">Global Chat</span>
            </button>
            <button onClick={() => { setActiveTool(null); setToolTarget(""); setToolResult(null); }} className="bg-zinc-700 hover:bg-zinc-600 transition-colors rounded-xl p-3 flex flex-col items-center justify-center gap-1 shadow-lg shadow-zinc-900/20">
              <ChevronLeft size={20} className="text-white" />
              <span className="text-white text-xs font-bold">Kembali</span>
            </button>
            <a href="https://wa.me/6283832110509" target="_blank" rel="noopener noreferrer" className="bg-emerald-600 hover:bg-emerald-500 transition-colors rounded-xl p-3 flex flex-col items-center justify-center gap-1 shadow-lg shadow-emerald-900/20">
              <Phone size={20} className="text-white" />
              <span className="text-white text-xs font-bold">Developer</span>
            </a>
          </div>

          {/* KOTAK INFO FUNGSI */}
          <div className="bg-[#1c1c1e] border border-zinc-700 rounded-2xl p-4">
            <h3 className="text-white font-bold text-sm mb-2 flex items-center gap-2">
              <activeTool.icon size={16} className={activeTool.color} /> Info Fitur
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {activeTool.desc}
            </p>
          </div>

          {/* INPUT & EKSEKUSI */}
          <div className="bg-[#1c1c1e] border border-zinc-700 rounded-2xl p-4">
            <label className="text-xs text-zinc-400 block mb-2">Target / Input</label>
            <input 
              type="text" 
              value={toolTarget} 
              onChange={(e) => setToolTarget(e.target.value)} 
              className="w-full bg-[#0f0a15] border border-zinc-700 rounded-lg p-3 text-white mb-4" 
              placeholder={activeTool.placeholder || "Masukkan target..."} 
            />
            <button onClick={executeTool} disabled={toolLoading} className="w-full bg-zinc-600 text-white font-bold py-3 rounded-lg flex justify-center items-center">
              {toolLoading ? <Loader2 className="animate-spin" size={20}/> : "Eksekusi"}
            </button>
            
            {toolResult && renderToolResult(toolResult)}
          </div>
        </main>
      </div>
    );
  }

  // --- HALAMAN UTAMA (HOME) ---
  const renderSidebar = () => (
    <>
      <div className={`fixed inset-0 bg-black/60 z-40 transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)} />
      <div className={`fixed top-0 left-0 h-full w-64 bg-[#1c1c1e] border-r border-zinc-700 z-50 transform transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-zinc-700 flex justify-between items-center">
          <h2 className="text-white font-bold">Menu</h2>
          <button onClick={() => setIsSidebarOpen(false)} className="text-zinc-400"><X size={20}/></button>
        </div>
        <div className="p-4 space-y-2">
          <button onClick={() => { setShowProfileModal(true); setIsSidebarOpen(false); }} className="w-full flex items-center gap-3 p-3 text-zinc-300 hover:bg-zinc-800 rounded-lg"><Settings size={18}/> Edit Profil</button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 text-red-400 hover:bg-red-900/20 rounded-lg"><LogOut size={18}/> Logout</button>
        </div>
      </div>
    </>
  );

  const renderProfileModal = () => {
    if (!showProfileModal) return null; 
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <div className="bg-[#1c1c1e] border border-zinc-700 rounded-2xl w-full max-w-sm p-6 relative">
          <button onClick={() => setShowProfileModal(false)} className="absolute top-4 right-4 text-zinc-400"><X size={20}/></button>
          <h2 className="text-white font-bold text-lg mb-4">Edit Profil</h2>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="flex flex-col items-center mb-4 relative">
              <div className="w-24 h-24 rounded-full bg-zinc-800 border-2 border-zinc-500 overflow-hidden">
                {userProfile.avatar ? <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <User size={40} className="text-zinc-500 m-auto mt-4" />}
              </div>
              <label className="absolute top-0 w-24 h-24 rounded-full cursor-pointer bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Camera size={24} className="text-white" />
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
              <span className="text-[10px] text-zinc-500 mt-2">Klik foto untuk ganti</span>
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Nama Tampilan</label>
              <input type="text" value={userProfile.name} onChange={(e) => setUserProfile({...userProfile, name: e.target.value})} className="w-full bg-[#0f0a15] border border-zinc-700 rounded-lg p-3 text-white" />
            </div>
            <button type="submit" className="w-full bg-zinc-600 text-white font-bold py-3 rounded-lg">Simpan</button>
          </form>
        </div>
      </div>
    );
  };

  const renderSenderModal = () => {
    if (!showSenderModal) return null;
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <div className="bg-[#1c1c1e] border border-zinc-700 rounded-2xl w-full max-w-sm p-6 relative">
          <button onClick={() => setShowSenderModal(false)} className="absolute top-4 right-4 text-zinc-400"><X size={20}/></button>
          <h2 className="text-white font-bold text-lg mb-2">Sender WhatsApp</h2>
          <p className="text-xs text-zinc-400 mb-4">Masukkan nomor WA lu, lalu klik Pairing untuk dapet kode.</p>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Nomor WhatsApp</label>
              <input type="text" value={senderNumber} onChange={(e) => setSenderNumber(e.target.value)} className="w-full bg-[#0f0a15] border border-zinc-700 rounded-lg p-3 text-white" placeholder="628xxx" />
            </div>
            <button onClick={handleSenderPairing} disabled={senderLoading} className="w-full bg-green-600 text-white font-bold py-3 rounded-lg flex justify-center items-center">
              {senderLoading ? <Loader2 className="animate-spin" size={20}/> : "Minta Pairing Code"}
            </button>
            {senderCode && (
              <div className="mt-4 bg-black border border-zinc-700 p-4 rounded-lg text-center">
                <p className="text-xs text-zinc-400 mb-1">Masukkan Kode Ini di WA:</p>
                <p className="text-2xl font-bold text-green-400 tracking-widest">{senderCode}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0f0a15] text-zinc-300 font-sans pb-24">
      
      {/* OVERLAY FINGERPRINT */}
      {showTapToPlay && (
        <div 
          onClick={handleFingerprintTap} 
          className="fixed inset-0 bg-black/95 z-[999] flex flex-col items-center justify-center cursor-pointer transition-opacity duration-500"
        >
          <div className={`relative flex items-center justify-center w-32 h-32 rounded-full border-2 transition-all duration-300 ${isScanning ? 'border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.5)]' : 'border-zinc-600'}`}>
             <Fingerprint 
                size={64} 
                className={`transition-colors duration-300 ${isScanning ? 'text-green-500' : 'text-zinc-400'}`} 
             />
             {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full backdrop-blur-sm">
                   <CheckCircle2 size={64} className="text-green-500 animate-in zoom-in spin-in-12 duration-500" />
                </div>
             )}
          </div>
          <h2 className={`text-white text-xl font-bold mt-8 transition-colors duration-300 ${isScanning ? 'text-green-400' : 'text-white'}`}>
            {isScanning ? "Autentikasi Berhasil" : "Sentuh Sidik Jari"}
          </h2>
          <p className="text-zinc-500 text-sm mt-2">
            {isScanning ? "Menyiapkan antarmuka..." : "Untuk membuka akses"}
          </p>
        </div>
      )}

      <header className="p-4 flex items-center justify-between sticky top-0 bg-[#0f0a15]/90 backdrop-blur-md z-30 border-b border-zinc-800">
        <button onClick={() => setIsSidebarOpen(true)} className="text-white p-2">
          <Menu size={24} />
        </button>
        <h1 className="text-white font-semibold text-lg capitalize flex-1 ml-2">
          {activeTab === "home" ? `Hello, ${userProfile.name}` : activeTab}
        </h1>
        <button onClick={() => setShowProfileModal(true)} className="w-10 h-10 rounded-full border border-zinc-500 overflow-hidden bg-zinc-800 flex items-center justify-center">
           {userProfile.avatar ? <img src={userProfile.avatar} className="w-full h-full object-cover"/> : <User size={20} className="text-zinc-400"/>}
        </button>
      </header>

      {renderSidebar()}
      {renderProfileModal()}
      {renderSenderModal()}

      {activeGame === 'catur' && <GameCatur level="medium" onClose={() => setActiveGame(null)} />}
      {activeGame === 'uno' && <GameUno onClose={() => setActiveGame(null)} />}
      {activeGame === 'ular' && <GameUlarTangga onClose={() => setActiveGame(null)} />}
      {activeGame === 'spy' && <GameSpy onClose={() => setActiveGame(null)} />}
      {activeGame === 'tictactoe' && <GameTicTacToe level="medium" onClose={() => setActiveGame(null)} />}

      <main className="px-4 max-w-md mx-auto mt-2 space-y-6">
        
        {activeTab === "home" && (
          <>
            <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-600/20 blur-3xl rounded-full"></div>
              <div className="inline-block bg-zinc-700/50 border border-zinc-600 text-zinc-300 text-[10px] font-bold px-3 py-1 rounded-full mb-4 tracking-widest">
                MIKASA PROJECT
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-white text-2xl font-bold leading-tight mb-2">Selamat Datang,<br/>{userProfile.name}</h2>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-1 bg-zinc-800/80 border border-zinc-700 px-3 py-1.5 rounded-lg text-xs text-zinc-300">
                      <Clock size={12} /> {userProfile.expired}
                    </div>
                    <div className="flex items-center gap-1 bg-zinc-800/80 border border-zinc-700 px-3 py-1.5 rounded-lg text-xs text-zinc-300">
                      <User size={12} /> {userRole}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center w-24 h-24 rounded-full border-2 border-zinc-600 bg-zinc-800/50 shadow-inner">
                  <span className="text-white text-2xl font-bold">{currentTime}</span>
                  <span className="text-[9px] text-zinc-400 tracking-widest mt-1">WAKTU</span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold text-zinc-400 tracking-wider">PENGGUNA ONLINE</h3>
                <span className="text-[10px] text-zinc-500">{onlineUsers.length} aktif</span>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                <div className="flex flex-col items-center gap-1 min-w-[60px] cursor-pointer">
                  <div className="w-14 h-14 rounded-full border-2 border-dashed border-zinc-600 flex items-center justify-center bg-[#1c1c1e] relative">
                    <Plus size={20} className="text-zinc-400" />
                  </div>
                  <span className="text-[10px] text-zinc-400">Tambah</span>
                </div>
                {onlineUsers.map((name, i) => (
                  <div key={i} onClick={() => openPrivateChat(name)} className="flex flex-col items-center gap-1 min-w-[60px] cursor-pointer">
                    <div className="w-14 h-14 rounded-full border-2 border-green-500 p-0.5">
                      <div className="w-full h-full rounded-full bg-zinc-800 overflow-hidden flex items-center justify-center">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}&backgroundColor=1a1a24`} alt={name} className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <span className="text-[10px] text-zinc-300 truncate w-14 text-center">{name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => { setChatMode("global"); setActiveTab("chat"); }} className="bg-blue-600 hover:bg-blue-500 transition-colors rounded-xl p-3 flex flex-col items-center justify-center gap-1 shadow-lg shadow-blue-900/20">
                <MessageSquare size={20} className="text-white" />
                <span className="text-white text-xs font-bold">Public Chat</span>
              </button>
              <a href="https://wa.me/6283832110509" target="_blank" rel="noopener noreferrer" className="bg-emerald-600 hover:bg-emerald-500 transition-colors rounded-xl p-3 flex flex-col items-center justify-center gap-1 shadow-lg shadow-emerald-900/20">
                <Phone size={20} className="text-white" />
                <span className="text-white text-xs font-bold">Developer</span>
              </a>
              <button onClick={() => setActiveTab("games")} className="bg-yellow-600 hover:bg-yellow-500 transition-colors rounded-xl p-3 flex flex-col items-center justify-center gap-1 shadow-lg shadow-yellow-900/20">
                <Gamepad2 size={20} className="text-white" />
                <span className="text-white text-xs font-bold">Games</span>
              </button>
            </div>

            <div>
              <h3 className="text-xs font-bold text-zinc-400 tracking-wider mb-2">NOW PLAYING</h3>
              <div onClick={() => setShowMusicLibrary(true)} className="bg-[#1c1c1e] border border-zinc-700 rounded-xl p-3 flex items-center justify-between cursor-pointer hover:border-zinc-500 transition-all">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden ${isPlaying ? 'bg-zinc-700' : 'bg-zinc-800'}`}>
                    {currentSong?.artworkUrl100 ? <img src={currentSong.artworkUrl100} className="w-full h-full object-cover" alt="art"/> : <Music size={20} className="text-zinc-500" />}
                  </div>
                  <div>
                    <p className="text-sm text-zinc-300 font-semibold truncate max-w-[150px]">{currentSong ? currentSong.trackName : "Belum ada lagu"}</p>
                    <p className="text-[10px] text-zinc-500">{currentSong ? currentSong.artistName : "Buka Music library"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {currentSong && <button onClick={(e) => { e.stopPropagation(); togglePlay(); }} className="p-2 bg-zinc-800 text-zinc-300 rounded-full">{isPlaying ? <Pause size={16}/> : <Play size={16}/>}</button>}
                </div>
              </div>
            </div>

            <div className="w-full h-48 bg-black rounded-2xl overflow-hidden relative shadow-lg border border-zinc-800">
              <video 
                key={videoIndex} 
                autoPlay 
                muted 
                playsInline 
                className="w-full h-full object-cover" 
                onEnded={() => setVideoIndex(1)}
                loop={videoIndex === 1}
              >
                <source src={videoIndex === 0 ? VIDEO_1 : VIDEO_2} type="video/mp4" />
              </video>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><ShieldAlert size={16} className="text-zinc-400"/> Statistik Akun</h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-[#1c1c1e] border border-zinc-700 rounded-xl p-3 flex flex-col items-center justify-center">
                  <CheckCircle2 size={20} className="text-zinc-400 mb-2" />
                  <span className="text-[9px] text-zinc-500 mb-1">EXPIRED</span>
                  <span className="text-xs text-white font-bold">{userProfile.expired}</span>
                </div>
                <div className="bg-[#1c1c1e] border border-zinc-700 rounded-xl p-3 flex flex-col items-center justify-center">
                  <User size={20} className="text-zinc-400 mb-2" />
                  <span className="text-[9px] text-zinc-500 mb-1">ROLE</span>
                  <span className="text-xs text-white font-bold uppercase">{userRole}</span>
                </div>
                <div className="bg-[#1c1c1e] border border-zinc-700 rounded-xl p-3 flex flex-col items-center justify-center">
                  <Clock size={20} className="text-zinc-400 mb-2" />
                  <span className="text-[9px] text-zinc-500 mb-1">RUNTIME</span>
                  <span className="text-xs text-white font-bold">{runtime}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Wrench size={16} className="text-zinc-400"/> Semua Fitur</h3>
              
              <div className="bg-[#1c1c1e] border border-zinc-700 rounded-xl p-3 mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield size={18} className={senderActive ? "text-green-500" : "text-red-500"} />
                  <div>
                    <p className="text-white text-sm font-bold">Sender WA</p>
                    <p className="text-[10px] text-zinc-500">{senderActive ? senderNumber : "Belum terhubung"}</p>
                  </div>
                </div>
                <button onClick={() => setShowSenderModal(true)} className="bg-zinc-800 px-3 py-1 rounded-lg text-xs text-white">{senderActive ? "Ganti" : "Hubungkan"}</button>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide mb-2">
                {CATEGORIES.map((cat) => (
                  <button key={cat} onClick={() => setToolCategory(cat)} className={`px-3 py-1 text-xs rounded-full whitespace-nowrap ${toolCategory === cat ? 'bg-zinc-600 text-white' : 'bg-[#1c1c1e] text-zinc-400 border border-zinc-700'}`}>
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {ALL_TOOLS.filter(t => toolCategory === "Semua" || t.cat === toolCategory).map((tool) => (
                  <button key={tool.id} onClick={() => setActiveTool(tool)} className="bg-[#1c1c1e] border border-zinc-700 rounded-2xl p-3 flex items-center gap-3 hover:bg-zinc-800 transition-colors text-left">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border bg-black/30 ${tool.color} border-zinc-600`}>
                      <tool.icon size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-white font-bold">{tool.name}</span>
                      <span className="text-[9px] text-zinc-500">{tool.sub}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === "chat" && (
          <div className="fixed inset-0 bg-[#0f0a15] z-40 flex flex-col h-[100dvh]">
            <div className="bg-[#0f0a15]/90 backdrop-blur-md flex items-center px-4 border-b border-zinc-800 pt-4 pb-2 shrink-0">
              <button onClick={() => setActiveTab("home")} className="p-2 mr-2 text-white">
                <ChevronLeft size={24} />
              </button>
              <div className="flex flex-col">
                <span className="text-white font-bold">{chatMode === "global" ? "Public Chat" : chatTarget}</span>
                <span className="text-[10px] text-zinc-400">{chatMode === "global" ? "Semua User" : "Private Message"}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
              {(chatMode === "global" ? globalMsgs : privateMsgs).map((m, i) => (
                <div key={i} className={`flex ${m.from === username ? 'flex-row-reverse' : 'flex-row'} items-start gap-2`}>
                  <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs text-white uppercase flex-shrink-0">{m.from.charAt(0)}</div>
                  <div className={`flex flex-col ${m.from === username ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] text-zinc-400 mb-1">{m.from}</span>
                    <div className={`p-3 rounded-2xl max-w-[80%] text-sm ${m.from === username ? 'bg-zinc-600 text-white rounded-tr-sm' : 'bg-[#1c1c1e] text-zinc-200 rounded-tl-sm border border-zinc-700'}`}>{m.msg}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <form onSubmit={chatMode === "global" ? sendGlobalMsg : sendPrivateMsg} className="p-3 bg-[#1c1c1e] border-t border-zinc-700 flex gap-2 items-center shrink-0">
              <input type="text" value={msgInput} onChange={e=>setMsgInput(e.target.value)} placeholder="Ketik pesan..." className="flex-1 bg-[#0f0a15] border border-zinc-700 rounded-full px-4 py-2 text-sm text-white focus:outline-none" />
              <button type="submit" className="bg-zinc-600 p-2 rounded-full text-white"><Send size={16} /></button>
            </form>
          </div>
        )}

        {activeTab === "games" && (
          <div>
            <button onClick={() => setActiveTab("home")} className="text-zinc-400 text-sm mb-4 flex items-center gap-1"><ChevronLeft size={16}/> Kembali ke Home</button>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "catur", title: "Catur", icon: <Crown size={24} className="text-zinc-300" /> },
                { id: "uno", title: "Uno", icon: <CircleDollarSign size={24} className="text-red-400" /> },
                { id: "tictactoe", title: "Tic Tac Toe", icon: <Grid3X3 size={24} className="text-green-400" /> },
                { id: "ular", title: "Ular Tangga", icon: <Dices size={24} className="text-orange-400" /> },
                { id: "spy", title: "Who's The Spy", icon: <Users size={24} className="text-purple-400" /> },
              ].map((game) => (
                <div key={game.id} onClick={() => setActiveGame(game.id)} className="bg-[#1c1c1e] border border-zinc-700 rounded-xl p-4 flex flex-col items-center text-center cursor-pointer hover:border-zinc-500">
                  <div className="w-12 h-12 bg-[#0f0a15] rounded-full flex items-center justify-center mb-2">{game.icon}</div>
                  <h3 className="text-white font-bold text-sm">{game.title}</h3>
                  <span className="text-[10px] text-zinc-400 mt-2">Main vs NPC</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* HALAMAN RAT DUMMY */}
        {activeTab === "rat" && (
          <div className="space-y-4">
            <h2 className="text-white font-bold text-xl mb-4">RAT Control</h2>
            
            {/* VIDEO ATAS */}
            <div className="w-full h-48 bg-black rounded-2xl overflow-hidden relative shadow-lg border border-zinc-800 mb-4">
              <video autoPlay muted loop playsInline className="w-full h-full object-cover">
                <source src={RAT_VIDEO} type="video/mp4" />
              </video>
              <div className="absolute top-2 left-2 bg-black/50 px-2 py-1 rounded text-xs text-white font-bold border border-zinc-700">Target Device</div>
            </div>

            {/* DUMMY SWITCHES */}
            <div className="space-y-3">
              <div className="bg-[#1c1c1e] border border-zinc-700 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lightbulb className={ratStates.flashlight ? "text-yellow-400" : "text-zinc-500"} />
                  <span className="text-white font-bold text-sm">Senter HP</span>
                </div>
                <button onClick={() => toggleRat('flashlight')} className={`w-12 h-6 rounded-full transition-colors relative ${ratStates.flashlight ? 'bg-green-500' : 'bg-zinc-700'}`}>
                   <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${ratStates.flashlight ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>

              <div className="bg-[#1c1c1e] border border-zinc-700 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock size={20} className={ratStates.lock ? "text-red-500" : "text-zinc-500"} />
                  <span className="text-white font-bold text-sm">Lock HP</span>
                </div>
                <button onClick={() => toggleRat('lock')} className={`w-12 h-6 rounded-full transition-colors relative ${ratStates.lock ? 'bg-red-500' : 'bg-zinc-700'}`}>
                   <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${ratStates.lock ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>

              <div className="bg-[#1c1c1e] border border-zinc-700 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Video size={20} className={ratStates.video ? "text-purple-500" : "text-zinc-500"} />
                  <span className="text-white font-bold text-sm">Putar Video</span>
                </div>
                <button onClick={() => toggleRat('video')} className={`w-12 h-6 rounded-full transition-colors relative ${ratStates.video ? 'bg-purple-500' : 'bg-zinc-700'}`}>
                   <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${ratStates.video ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>

              <div className="bg-[#1c1c1e] border border-zinc-700 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle size={20} className={ratStates.lag ? "text-red-500" : "text-zinc-500"} />
                  <span className="text-white font-bold text-sm">Bikin Lag Parah</span>
                </div>
                <button onClick={() => toggleRat('lag')} className={`w-12 h-6 rounded-full transition-colors relative ${ratStates.lag ? 'bg-red-500' : 'bg-zinc-700'}`}>
                   <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${ratStates.lag ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-4">
             <h2 className="text-white font-bold text-xl mb-4">Settings</h2>
             <button onClick={() => setShowProfileModal(true)} className="w-full bg-[#1c1c1e] border border-zinc-700 p-4 rounded-xl flex items-center gap-4 hover:bg-zinc-800">
                <User size={20} className="text-zinc-400" />
                <span className="text-white">Edit Profil</span>
             </button>
             <button onClick={handleLogout} className="w-full bg-red-900/20 border border-red-900/50 p-4 rounded-xl flex items-center gap-4 text-red-400 hover:bg-red-900/40">
                <LogOut size={20} />
                <span>Logout Akun</span>
             </button>
             
             <div className="bg-[#1c1c1e] border border-zinc-700 p-4 rounded-xl mt-6">
                <h3 className="text-white font-bold mb-2">Info Aplikasi</h3>
                <p className="text-xs text-zinc-400">Versi: 2.0.0 (Mikasa Update)</p>
                <p className="text-xs text-zinc-400">Developer: Rullzzz06</p>
             </div>
          </div>
        )}
      </main>

      {/* BOTTOM NAVBAR BARU */}
      <div className="fixed bottom-0 w-full bg-[#1c1c1e] border-t border-zinc-700 p-2 z-30">
        <div className="flex justify-around items-center px-2">
           {[
             { id: 'rat', icon: <Cpu size={20}/>, label: 'RAT' }, // MENU RAT BARU
             { id: 'home', icon: <HomeIcon size={20}/>, label: 'Home' },
             { id: 'chat', icon: <MessageSquare size={20}/>, label: 'Chat' },
             { id: 'settings', icon: <Settings size={20}/>, label: 'Setting' },
           ].map((item) => (
             <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex flex-col items-center p-2 ${activeTab === item.id ? 'text-zinc-300' : 'text-zinc-600'}`}>
               <div className={`p-2 rounded-full ${activeTab === item.id ? 'bg-zinc-700 text-white' : ''}`}>{item.icon}</div>
               <span className="text-[10px]">{item.label}</span>
             </button>
           ))}
        </div>
      </div>

      {showMusicLibrary && (
        <div className="fixed inset-0 bg-[#0f0a15] z-50 flex flex-col p-4 h-[100dvh]">
          <div className="flex items-center gap-3 mb-6 shrink-0">
            <button onClick={() => setShowMusicLibrary(false)} className="p-2 bg-[#1c1c1e] border border-zinc-700 rounded-lg text-zinc-400"><ChevronLeft size={20}/></button>
            <h2 className="text-white font-bold text-xl">Music Library</h2>
          </div>
          <form onSubmit={handleSearchMusic} className="relative mb-6 shrink-0">
            <Search className="absolute left-4 top-3.5 text-zinc-500" size={20} />
            <input type="text" placeholder="Cari lagu / artis..." value={musicSearch} onChange={(e) => setMusicSearch(e.target.value)} className="w-full bg-[#1c1c1e] border border-zinc-700 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none" />
            <button type="submit" className="absolute right-2 top-2 bg-zinc-600 p-2 rounded-lg text-white"><Search size={16}/></button>
          </form>
          <div className="flex-1 overflow-y-auto space-y-3">
            {loadingMusic ? (
              <div className="flex justify-center items-center h-40"><Loader2 className="animate-spin text-zinc-400" size={32}/></div>
            ) : musicResults.length === 0 ? (
              <p className="text-center text-zinc-500 mt-10">Ketik judul lagu lalu enter</p>
            ) : (
              musicResults.map((song, i) => (
                <div key={i} onClick={() => playMusic(song)} className="flex items-center gap-3 p-2 bg-[#1c1c1e] border border-zinc-700 rounded-xl hover:bg-[#2a2a2e] cursor-pointer">
                  <img src={song.artworkUrl100} alt="cover" className="w-14 h-14 rounded-lg object-cover" />
                  <div className="flex-1 overflow-hidden">
                    <h4 className="text-white font-bold text-sm truncate">{song.trackName}</h4>
                    <p className="text-xs text-zinc-400 truncate">{song.artistName}</p>
                  </div>
                  <div className="p-3 bg-zinc-800 rounded-full text-zinc-300">
                    {currentSong?.trackId === song.trackId && isPlaying ? <button onClick={(e) => { e.stopPropagation(); togglePlay(); }}><Pause size={18}/></button> : <Play size={18}/>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
