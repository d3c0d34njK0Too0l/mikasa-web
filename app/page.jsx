"use client";
import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { 
  Home as HomeIcon, Menu, User, Lock, Eye, EyeOff, ArrowRight, 
  MessageSquare, Bell, Plus, Heart, Wrench, DownloadCloud, 
  Search, Bug, Send, X, ChevronLeft, ShieldAlert, Globe, 
  FileText, Play, Pause, Gamepad2, Music, CheckCircle2, 
  Dices, Bot, Grid3X3, Crown, CircleDollarSign, Users, 
  Puzzle, Globe2, Loader2, LogOut, Settings, Edit3, Camera,
  Clock, Shield, BookOpen, Phone, Terminal, Code2
} from "lucide-react";

const API_URL = "https://api-mikasacloud.my.id";
const VIDEO_1 = "https://j.top4top.io/m_3944kuzbh0.mp4";
const VIDEO_2 = "https://d.top4top.io/m_3944j368i0.mp4";

let globalAudio = null;

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
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

  // Time & Runtime State
  const [currentTime, setCurrentTime] = useState("");
  const [runtime, setRuntime] = useState("00:00");

  // Socket & Chat State
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [globalMsgs, setGlobalMsgs] = useState([]);
  const [msgInput, setMsgInput] = useState("");

  // Music State
  const [musicSearch, setMusicSearch] = useState("");
  const [musicResults, setMusicResults] = useState([]);
  const [loadingMusic, setLoadingMusic] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Game State
  const [activeGame, setActiveGame] = useState(null);

  // --- AUTO LOGIN & CLOCK ---
  useEffect(() => {
    const savedUser = localStorage.getItem("mikasa_user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUsername(parsed.username);
      setUserRole(parsed.role);
      setUserProfile(parsed.profile || { name: parsed.username, avatar: "", expired: "2054-02-25" });
      setIsLoggedIn(true);
    }

    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('id-ID', { hour12: false, hour: '2-digit', minute: '2-digit' }));
      
      // Hitung runtime dari jam 00:00 atau dari login
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
        setIsLoggedIn(true);
      } else {
        setLoginError("Akun tidak ditemukan.");
      }
    } catch (err) {
      setLoginError("Gagal terhubung ke database.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("mikasa_user");
    setIsLoggedIn(false);
    setUsername("");
    setPassword("");
    setIsSidebarOpen(false);
  };

  // --- SOCKET CHAT ---
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

  // --- MUSIC LOGIC ---
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
    if (currentSong?.trackId === track.trackId) { togglePlay(); return; }
    if (globalAudio) { globalAudio.pause(); globalAudio.currentTime = 0; }
    globalAudio = new Audio(track.previewUrl);
    globalAudio.play();
    globalAudio.onended = () => setIsPlaying(false);
    setCurrentSong(track);
    setIsPlaying(true);
  };

  // --- PROFILE EDIT ---
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


  // --- LOGIN PAGE ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0f0a15] flex flex-col items-center justify-center p-4">
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-zinc-500 mb-4 shadow-[0_0_20px_rgba(100,100,100,0.4)]">
          <img src="https://i.pinimg.com/736x/8c/7d/2c/8c7d2c6d8e3b5f1d2e3c4b5a6f7e8d9c.jpg" alt="Logo" className="w-full h-full object-cover" />
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

  // --- PROFILE MODAL ---
  const renderProfileModal = () => (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-[#1c1c1e] border border-zinc-700 rounded-2xl w-full max-w-sm p-6 relative">
        <button onClick={() => setShowProfileModal(false)} className="absolute top-4 right-4 text-zinc-400"><X size={20}/></button>
        <h2 className="text-white font-bold text-lg mb-4">Edit Profil</h2>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="flex flex-col items-center mb-4">
            <div className="w-24 h-24 rounded-full bg-zinc-800 border-2 border-zinc-500 overflow-hidden relative group cursor-pointer">
              {userProfile.avatar ? <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <User size={40} className="text-zinc-500 m-auto mt-4" />}
              <label className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center cursor-pointer">
                <Camera size={24} className="text-white" />
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            </div>
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

  // --- SIDEBAR MENU ---
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

  // --- GAME ENGINE ---
  const renderGameEngine = () => {
    if (!activeGame) return null;
    const { type, mode } = activeGame;
    const [board, setBoard] = useState(Array(9).fill(null));
    const [turn, setTurn] = useState('X');

    const handleTicTacToeClick = (i) => {
      if (board[i] || checkTicTacToeWin(board)) return;
      const newBoard = [...board];
      newBoard[i] = turn;
      setBoard(newBoard);
      setTurn(turn === 'X' ? 'O' : 'X');
      if (mode === 'npc' && !checkTicTacToeWin(newBoard)) {
        setTimeout(() => npcTicTacToeMove(newBoard), 500);
      }
    };

    const npcTicTacToeMove = (currentBoard) => {
      const empty = currentBoard.map((v, i) => v === null ? i : null).filter(v => v !== null);
      if (!empty.length) return;
      let move = empty[Math.floor(Math.random() * empty.length)]; 
      if (activeGame.level === 'hard') {
        for (let i of empty) {
          let temp = [...currentBoard]; temp[i] = 'O';
          if (checkTicTacToeWin(temp) === 'O') { move = i; break; }
        }
      }
      const newBoard = [...currentBoard];
      newBoard[move] = 'O';
      setBoard(newBoard);
      setTurn('X');
    };

    const checkTicTacToeWin = (b) => {
      const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
      for (let line of lines) {
        if (b[line[0]] && b[line[0]] === b[line[1]] && b[line[0]] === b[line[2]]) return b[line[0]];
      }
      return b.includes(null) ? null : 'Draw';
    };

    const renderTicTacToe = () => {
      const winner = checkTicTacToeWin(board);
      return (
        <div className="flex flex-col items-center p-6 bg-[#1c1c1e] rounded-2xl border border-zinc-700 w-full max-w-sm">
          <h3 className="text-white font-bold mb-4">{winner ? (winner === 'Draw' ? 'Seri!' : `Menang: ${winner}`) : `Giliran: ${turn}`}</h3>
          <div className="grid grid-cols-3 gap-2">
            {board.map((cell, i) => (
              <button key={i} onClick={() => handleTicTacToeClick(i)} className="w-20 h-20 bg-[#0f0a15] border border-zinc-700 rounded-xl text-3xl font-bold flex items-center justify-center">
                <span className={cell === 'X' ? 'text-zinc-400' : 'text-red-500'}>{cell}</span>
              </button>
            ))}
          </div>
          <button onClick={() => { setBoard(Array(9).fill(null)); setTurn('X'); }} className="mt-6 w-full bg-zinc-600 text-white font-bold py-3 rounded-xl">Reset</button>
        </div>
      );
    };

    const [unoDeck, setUnoDeck] = useState(["merah 5", "biru 7", "hijau 2", "kuning 9"]);
    const [unoTarget, setUnoTarget] = useState("merah 3");
    
    const renderUno = () => (
      <div className="flex flex-col items-center p-6 bg-[#1c1c1e] rounded-2xl border border-zinc-700 w-full max-w-sm text-center">
        <h3 className="text-white font-bold mb-4">Uno</h3>
        <p className="text-sm text-zinc-400 mb-2">Kartu Target:</p>
        <div className={`w-24 h-32 rounded-xl mb-6 flex items-center justify-center text-white text-2xl font-bold shadow-lg ${unoTarget.includes("merah") ? "bg-red-600" : "bg-blue-600"}`}>
          {unoTarget}
        </div>
        <p className="text-sm text-zinc-400 mb-2">Kartu Kamu:</p>
        <div className="flex gap-2 mb-6">
          {unoDeck.map((c, i) => (
             <div key={i} className={`w-16 h-24 rounded-lg flex items-center justify-center text-white font-bold ${c.includes("merah") ? "bg-red-600" : c.includes("biru") ? "bg-blue-600" : "bg-green-600"}`}>{c}</div>
          ))}
        </div>
      </div>
    );

    const [playerPos, setPlayerPos] = useState(1);
    const [dice, setDice] = useState(1);
    
    const rollDice = () => {
      const d = Math.floor(Math.random() * 6) + 1;
      setDice(d);
      let newPos = Math.min(25, playerPos + d);
      const snakes = { 12: 5, 18: 8, 24: 16 };
      const ladders = { 3: 10, 7: 15, 14: 21 };
      if (snakes[newPos]) newPos = snakes[newPos];
      if (ladders[newPos]) newPos = ladders[newPos];
      setPlayerPos(newPos);
      if (newPos === 25) alert("Kamu Menang! 🎉");
    };

    const renderUlarTangga = () => {
      const boardCells = [];
      for (let i = 25; i >= 1; i--) boardCells.push(i);

      return (
        <div className="flex flex-col items-center p-4 bg-[#1c1c1e] rounded-2xl border border-zinc-700 w-full max-w-sm">
          <h3 className="text-white font-bold mb-4">Ular Tangga</h3>
          <div className="grid grid-cols-5 gap-1 mb-6 w-full aspect-square bg-[#0f0a15] p-2 rounded-xl border border-zinc-700">
            {boardCells.map((num) => (
              <div key={num} className={`flex items-center justify-center text-xs font-bold text-white rounded ${num === playerPos ? "bg-zinc-600" : "bg-[#2a2a2e]"}`}>
                {num === playerPos ? "P" : num}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mb-6">
            <div className="text-4xl">{['⚀','⚁','⚂','⚃','⚄','⚅'][dice-1]}</div>
            <div className="text-white font-bold">Posisi: {playerPos}</div>
          </div>
          <button onClick={rollDice} className="w-full bg-zinc-600 text-white font-bold py-3 rounded-xl mb-2">Lempar Dadu</button>
        </div>
      );
    };

    const renderChess = () => {
      const pieces = ["♜","♞","♝","♛","♚","♝","♞","♜","♟","♟","♟","♟","♟","♟","♟","♟","","","","","","","","","","","","","","","","","♙","♙","♙","♙","♙","♙","♙","♙","♖","♘","♗","♕","♔","♗","♘","♖"];
      return (
        <div className="flex flex-col items-center p-2 bg-[#1c1c1e] rounded-2xl border border-zinc-700 w-full max-w-sm">
          <h3 className="text-white font-bold mb-2">Catur (NPC Mode)</h3>
          <div className="grid grid-cols-8 border-2 border-zinc-600 w-full aspect-square mb-4">
            {pieces.map((p, i) => (
              <div key={i} className={`flex items-center justify-center text-xl sm:text-2xl ${(i + Math.floor(i/8)) % 2 === 0 ? 'bg-zinc-400' : 'bg-zinc-600'}`}>
                {p}
              </div>
            ))}
          </div>
        </div>
      );
    };

    if (type === 'tictactoe') return renderTicTacToe();
    if (type === 'uno') return renderUno();
    if (type === 'ular') return renderUlarTangga();
    if (type === 'catur') return renderChess();
    return <div className="text-white">Game belum tersedia.</div>;
  };


  // --- UI UTAMA ---
  return (
    <div className="min-h-screen bg-[#0f0a15] text-zinc-300 font-sans pb-24">
      
      {/* HEADER */}
      <header className="p-4 flex items-center justify-between sticky top-0 bg-[#0f0a15]/90 backdrop-blur-md z-30">
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
      {showProfileModal && renderProfileModal()}

      <main className="px-4 max-w-md mx-auto mt-2 space-y-6">
        
        {/* TAB HOME */}
        {activeTab === "home" && (
          <>
            {/* 1. KARTU JAM (Gambar 1 & 3 - Tema Abu) */}
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
                
                {/* Jam Besar */}
                <div className="flex flex-col items-center justify-center w-24 h-24 rounded-full border-2 border-zinc-600 bg-zinc-800/50 shadow-inner">
                  <span className="text-white text-2xl font-bold">{currentTime}</span>
                  <span className="text-[9px] text-zinc-400 tracking-widest mt-1">WAKTU</span>
                </div>
              </div>
            </div>

            {/* 2. 3 TOMBOL BARIS (Gambar 2) */}
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => setActiveTab("chat")} className="bg-blue-600 hover:bg-blue-500 transition-colors rounded-xl p-3 flex flex-col items-center justify-center gap-1 shadow-lg shadow-blue-900/20">
                <MessageSquare size={20} className="text-white" />
                <span className="text-white text-xs font-bold">Public Chat</span>
              </button>
              
              <a href="https://wa.me/6283832110509" target="_blank" rel="noopener noreferrer" className="bg-emerald-600 hover:bg-emerald-500 transition-colors rounded-xl p-3 flex flex-col items-center justify-center gap-1 shadow-lg shadow-emerald-900/20">
                <Phone size={20} className="text-white" />
                <span className="text-white text-xs font-bold">Developer</span>
              </a>

              <button onClick={() => { setActiveTab("games"); }} className="bg-yellow-600 hover:bg-yellow-500 transition-colors rounded-xl p-3 flex flex-col items-center justify-center gap-1 shadow-lg shadow-yellow-900/20">
                <Gamepad2 size={20} className="text-white" />
                <span className="text-white text-xs font-bold">Games</span>
              </button>
            </div>

            {/* 3. MUSIC PLAYER */}
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

            {/* 4. VIDEO BANNER */}
            <div className="w-full h-48 bg-black rounded-2xl overflow-hidden relative shadow-lg border border-zinc-800">
              <video autoPlay muted loop playsInline className="w-full h-full object-cover">
                <source src={VIDEO_2} type="video/mp4" />
              </video>
              <div className="absolute bottom-4 left-4 z-10 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-lg">
                <h2 className="text-white font-bold text-sm">Mikasa Project</h2>
              </div>
            </div>

            {/* 5. STATISTIK AKUN (Gambar 5) */}
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

            {/* 6. TOOLS GRID (Gambar 5 bagian bawah) */}
            <div>
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Wrench size={16} className="text-zinc-400"/> Tools</h3>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { icon: Bug, label: "Bug WA", color: "text-red-500" },
                  { icon: Search, label: "OSINT", color: "text-blue-500" },
                  { icon: MessageSquare, label: "Spam", color: "text-emerald-500" },
                  { icon: DownloadCloud, label: "Download", color: "text-pink-500" },
                  { icon: Shield, label: "Cek Band", color: "text-yellow-500" },
                  { icon: FileText, label: "Data GTK", color: "text-purple-500" },
                  { icon: Globe, label: "Web Recon", color: "text-cyan-500" },
                  { icon: Terminal, label: "API", color: "text-zinc-300" },
                ].map((tool, i) => (
                  <button key={i} className="bg-[#1c1c1e] border border-zinc-700 rounded-xl p-3 flex flex-col items-center justify-center hover:bg-zinc-800 transition-colors">
                    <tool.icon size={20} className={`${tool.color} mb-2`} />
                    <span className="text-[10px] text-zinc-300 text-center leading-tight">{tool.label}</span>
                  </button>
                ))}
              </div>
            </div>

          </>
        )}

        {/* TAB CHAT */}
        {activeTab === "chat" && (
          <div className="fixed inset-0 bg-[#0f0a15] z-40 flex flex-col pt-16 pb-20">
            <div className="flex-1 overflow-y-auto px-4 space-y-4">
              {globalMsgs.map((m, i) => (
                <div key={i} className={`flex ${m.from === username ? 'flex-row-reverse' : 'flex-row'} items-start gap-2`}>
                  <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs text-white uppercase flex-shrink-0">{m.from.charAt(0)}</div>
                  <div className={`flex flex-col ${m.from === username ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] text-zinc-400 mb-1">{m.from}</span>
                    <div className={`p-3 rounded-2xl max-w-[80%] text-sm ${m.from === username ? 'bg-zinc-600 text-white rounded-tr-sm' : 'bg-[#1c1c1e] text-zinc-200 rounded-tl-sm border border-zinc-700'}`}>{m.msg}</div>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={sendGlobalMsg} className="p-3 bg-[#1c1c1e] border-t border-zinc-700 flex gap-2 items-center">
              <input type="text" value={msgInput} onChange={e=>setMsgInput(e.target.value)} placeholder="Ketik pesan..." className="flex-1 bg-[#0f0a15] border border-zinc-700 rounded-full px-4 py-2 text-sm text-white focus:outline-none" />
              <button type="submit" className="bg-zinc-600 p-2 rounded-full text-white"><Send size={16} /></button>
            </form>
          </div>
        )}

        {/* TAB GAMES */}
        {activeTab === "games" && !activeGame && (
          <div>
            <button onClick={() => setActiveTab("home")} className="text-zinc-400 text-sm mb-4 flex items-center gap-1"><ChevronLeft size={16}/> Kembali ke Home</button>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "catur", title: "Catur", icon: <Crown size={24} className="text-zinc-300" /> },
                { id: "uno", title: "Uno", icon: <CircleDollarSign size={24} className="text-red-400" /> },
                { id: "tictactoe", title: "Tic Tac Toe", icon: <Grid3X3 size={24} className="text-green-400" /> },
                { id: "ular", title: "Ular Tangga", icon: <Dices size={24} className="text-orange-400" /> },
              ].map((game) => (
                <div key={game.id} onClick={() => setActiveGame({ type: game.id, mode: 'npc', level: 'easy' })} className="bg-[#1c1c1e] border border-zinc-700 rounded-xl p-4 flex flex-col items-center text-center cursor-pointer hover:border-zinc-500">
                  <div className="w-12 h-12 bg-[#0f0a15] rounded-full flex items-center justify-center mb-2">{game.icon}</div>
                  <h3 className="text-white font-bold text-sm">{game.title}</h3>
                  <span className="text-[10px] text-zinc-400 mt-2">Main vs NPC</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "games" && activeGame && (
          <div>
            <button onClick={() => setActiveGame(null)} className="text-zinc-400 text-sm mb-4 flex items-center gap-1"><ChevronLeft size={16}/> Kembali ke Menu Game</button>
            {renderGameEngine()}
          </div>
        )}

        {/* TAB API/DOCS */}
        {activeTab === "api" && (
           <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
              <Code2 size={48} className="mb-4 opacity-50" />
              <p>API Documentation coming soon.</p>
           </div>
        )}

        {/* TAB SETTINGS */}
        {activeTab === "settings" && (
          <div className="space-y-4">
             <button onClick={() => setShowProfileModal(true)} className="w-full bg-[#1c1c1e] border border-zinc-700 p-4 rounded-xl flex items-center gap-4">
                <Settings size={20} className="text-zinc-400" />
                <span className="text-white">Edit Profil</span>
             </button>
             <button onClick={handleLogout} className="w-full bg-red-900/20 border border-red-900/50 p-4 rounded-xl flex items-center gap-4 text-red-400">
                <LogOut size={20} />
                <span>Logout</span>
             </button>
          </div>
        )}

      </main>

      {/* MUSIC LIBRARY MODAL */}
      {showMusicLibrary && (
        <div className="fixed inset-0 bg-[#0f0a15] z-50 flex flex-col p-4">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setShowMusicLibrary(false)} className="p-2 bg-[#1c1c1e] border border-zinc-700 rounded-lg text-zinc-400"><ChevronLeft size={20}/></button>
            <h2 className="text-white font-bold text-xl">Music Library</h2>
          </div>
          <form onSubmit={handleSearchMusic} className="relative mb-6">
            <Search className="absolute left-4 top-3.5 text-zinc-500" size={20} />
            <input type="text" placeholder="Cari lagu / artis..." value={musicSearch} onChange={(e) => setMusicSearch(e.target.value)} className="w-full bg-[#1c1c1e] border border-zinc-700 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none" />
            <button type="submit" className="absolute right-2 top-2 bg-zinc-600 p-2 rounded-lg text-white"><Search size={16}/></button>
          </form>
          <div className="flex-1 overflow-y-auto space-y-3 pb-24">
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

      {/* BOTTOM NAVBAR (Hanya Home, Chat, API, Settings) */}
      <div className="fixed bottom-0 w-full bg-[#1c1c1e] border-t border-zinc-700 p-2 z-30">
        <div className="flex justify-around items-center px-2">
           {[
             { id: 'home', icon: <HomeIcon size={20}/>, label: 'Home' },
             { id: 'chat', icon: <MessageSquare size={20}/>, label: 'Chat' },
             { id: 'api', icon: <Code2 size={20}/>, label: 'API' },
             { id: 'settings', icon: <Settings size={20}/>, label: 'Setting' },
           ].map((item) => (
             <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex flex-col items-center p-2 ${activeTab === item.id ? 'text-zinc-300' : 'text-zinc-600'}`}>
               <div className={`p-2 rounded-full ${activeTab === item.id ? 'bg-zinc-700 text-white' : ''}`}>{item.icon}</div>
               <span className="text-[10px]">{item.label}</span>
             </button>
           ))}
        </div>
      </div>

    </div>
  );
}
