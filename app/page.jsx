"use client";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { 
  Home as HomeIcon, Menu, User, Lock, Eye, EyeOff, ArrowRight, 
  MessageSquare, Bell, Plus, Heart, Calendar, Wrench, 
  DownloadCloud, Search, Bug, Send, X, ChevronLeft, 
  ShieldAlert, Globe, Smartphone, FileText, Play, Pause, Gamepad2, Music, CheckCircle2,
  Dices, Bot, Grid3X3, Crown, CircleDollarSign, Users, Puzzle, Globe2, CreditCard, Mail, QrCode, ScanLine, Database, Link
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
  
  // Login & App State
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [userRole, setUserRole] = useState("FREE");
  const [activeTab, setActiveTab] = useState("home");
  const [selectedTool, setSelectedTool] = useState(null);
  const [activeGame, setActiveGame] = useState(null); 
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  
  // Chat State
  const [globalMsgs, setGlobalMsgs] = useState([]);
  const [msgInput, setMsgInput] = useState("");
  
  // Tool State
  const [target, setTarget] = useState("");
  const [loadingTools, setLoadingTools] = useState(false);
  const [toolsResult, setToolsResult] = useState(null);

  // --- LOGIKA CATUR ---
  const [chessGame, setChessGame] = useState(new Chess());
  function makeRandomMove() {
    const possibleMoves = chessGame.moves();
    if (chessGame.isGameOver() || possibleMoves.length === 0) return;
    const randomIndex = Math.floor(Math.random() * possibleMoves.length);
    chessGame.move(possibleMoves[randomIndex]);
    setChessGame(new Chess(chessGame.fen()));
  }
  function onDrop(sourceSquare, targetSquare) {
    try {
      const move = chessGame.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
      if (move === null) return false;
      setChessGame(new Chess(chessGame.fen()));
      setTimeout(() => makeRandomMove(), 500);
      return true;
    } catch (error) { return false; }
  }

  // --- LOGIKA TICTACTOE ---
  const [tttBoard, setTttBoard] = useState(Array(9).fill(null));
  const handleTttClick = (idx) => {
    if (tttBoard[idx] || calculateTttWinner(tttBoard)) return;
    const newBoard = [...tttBoard];
    newBoard[idx] = 'X';
    setTttBoard(newBoard);
    if (!calculateTttWinner(newBoard)) {
      setTimeout(() => {
        const emptySpots = newBoard.map((val, i) => val === null ? i : null).filter(val => val !== null);
        if (emptySpots.length > 0) {
          const randomSpot = emptySpots[Math.floor(Math.random() * emptySpots.length)];
          newBoard[randomSpot] = 'O';
          setTttBoard([...newBoard]);
        }
      }, 500);
    }
  };
  const calculateTttWinner = (squares) => {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (let i = 0; i < lines.length; i++) {
      const [a,b,c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) return squares[a];
    }
    return null;
  };

  // --- LOGIKA UNO (VERSI SEDERHANA) ---
  const [unoDeck, setUnoDeck] = useState([]);
  const [unoPlayer, setUnoPlayer] = useState([]);
  const [unoNpc, setUnoNpc] = useState([]);
  const [unoDiscard, setUnoDiscard] = useState(null);
  const [unoMsg, setUnoMsg] = useState("");

  const startUno = () => {
    const colors = ['red', 'blue', 'green', 'yellow'];
    const values = ['0','1','2','3','4','5','6','7','8','9'];
    let deck = [];
    colors.forEach(c => values.forEach(v => deck.push({ color: c, value: v })));
    deck = deck.sort(() => Math.random() - 0.5);
    
    setUnoPlayer(deck.slice(0, 5));
    setUnoNpc(deck.slice(5, 10));
    setUnoDiscard(deck[10]);
    setUnoDeck(deck.slice(11));
    setUnoMsg("Giliran kamu! Pilih kartu dengan warna/angka yang sama.");
  };

  const playUno = (cardIndex) => {
    const card = unoPlayer[cardIndex];
    if (card.color === unoDiscard.color || card.value === unoDiscard.value) {
      const newPlayer = unoPlayer.filter((_, i) => i !== cardIndex);
      setUnoPlayer(newPlayer);
      setUnoDiscard(card);
      
      if (newPlayer.length === 0) { setUnoMsg("KAMU MENANG!"); return; }
      setUnoMsg("NPC sedang berfikir...");
      
      setTimeout(() => {
        let played = false;
        for (let i = 0; i < unoNpc.length; i++) {
          if (unoNpc[i].color === card.color || unoNpc[i].value === card.value) {
            setUnoDiscard(unoNpc[i]);
            setUnoNpc(unoNpc.filter((_, idx) => idx !== i));
            setUnoMsg("NPC memainkan kartu!");
            played = true;
            break;
          }
        }
        if (!played) setUnoMsg("NPC menarik kartu. Giliran kamu lagi!");
      }, 1000);
    } else {
      setUnoMsg("Kartu tidak cocok! Harus warna atau angka yang sama.");
    }
  };

  // --- LOGIKA DOMINO SEDERHANA ---
  const [dominoPlayer, setDominoPlayer] = useState([]);
  const [dominoNpc, setDominoNpc] = useState([]);
  const [dominoBoard, setDominoBoard] = useState([]);
  const [dominoMsg, setDominoMsg] = useState("");

  const startDomino = () => {
    let deck = [];
    for (let i = 0; i <= 6; i++) {
      for (let j = i; j <= 6; j++) { deck.push([i, j]); }
    }
    deck = deck.sort(() => Math.random() - 0.5);
    setDominoPlayer(deck.slice(0, 7));
    setDominoNpc(deck.slice(7, 14));
    setDominoBoard([deck[14]]);
    setDominoMsg("Pilih kartu yang ujungnya cocok dengan papan!");
  };

  const playDomino = (idx) => {
    const card = dominoPlayer[idx];
    const leftEnd = dominoBoard[0][0];
    const rightEnd = dominoBoard[dominoBoard.length - 1][1];

    if (card.includes(leftEnd)) {
      setDominoBoard([card, ...dominoBoard]);
      setDominoPlayer(dominoPlayer.filter((_, i) => i !== idx));
    } else if (card.includes(rightEnd)) {
      setDominoBoard([...dominoBoard, card]);
      setDominoPlayer(dominoPlayer.filter((_, i) => i !== idx));
    } else {
      setDominoMsg("Kartu tidak cocok dengan ujung papan!");
      return;
    }
    setDominoMsg("Kartu dipasang! Giliran NPC...");
  };

  // --- LOGIN & SOCKET ---
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("https://raw.githubusercontent.com/d3c0d34njK0Too0l/mikasa-web/main/users.json");
      const users = await res.json();
      const validUser = users.find(u => u.username === username && u.password === password);
      if (validUser) { setUserRole(validUser.role ? validUser.role.toUpperCase() : "FREE"); setShowIntro(true); }
      else { setLoginError("Akun tidak ditemukan."); }
    } catch (err) { setLoginError("Gagal terhubung."); }
  };

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
    setLoadingTools(true); setToolsResult(null);
    try {
      const res = await fetch(`${API_URL}${endpoint}`, { method: "POST", headers: { "Content-Type": "application/json", "x-api-key": API_KEY }, body: JSON.stringify(payload) });
      const data = await res.json(); setToolsResult(data);
    } catch (e) { setToolsResult({ status: false, error: "Gagal terhubung API" }); } 
    finally { setLoadingTools(false); }
  };

  if (showIntro) {
    return (
      <div className="min-h-screen bg-black relative flex items-center justify-center">
        <video autoPlay muted playsInline className="w-full h-full object-cover absolute inset-0" onEnded={() => { setShowIntro(false); setIsLoggedIn(true); }}>
          <source src={INTRO_VIDEO} type="video/mp4" />
        </video>
        <audio autoPlay><source src={INTRO_AUDIO} type="audio/mpeg" /></audio>
        <button onClick={() => { setShowIntro(false); setIsLoggedIn(true); }} className="absolute top-6 right-6 bg-black/60 border border-zinc-600 text-white px-5 py-2 rounded-full text-sm font-bold z-50">Skip ➔</button>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0d0914] flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-white tracking-widest mb-8">MIKASA LOGIN</h1>
        <div className="bg-[#16111e] p-6 rounded-2xl w-full max-w-sm border border-[#2a2136]">
           {loginError && <div className="text-red-500 text-xs mb-2">{loginError}</div>}
           <form onSubmit={handleLogin} className="space-y-4">
             <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-[#0d0914] border border-[#2a2136] p-3 rounded text-white" />
             <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#0d0914] border border-[#2a2136] p-3 rounded text-white" />
             <button type="submit" className="w-full bg-purple-600 p-3 rounded text-white font-bold">Login</button>
           </form>
        </div>
      </div>
    );
  }

  const gamesList = [
    { id: "catur", title: "Catur", icon: <Crown size={24} className="text-yellow-400" /> },
    { id: "tictactoe", title: "Tic Tac Toe", icon: <Grid3X3 size={24} className="text-green-400" /> },
    { id: "uno", title: "Uno Card", icon: <CircleDollarSign size={24} className="text-red-400" /> },
    { id: "domino", title: "Domino", icon: <Grid3X3 size={24} className="text-blue-400" /> },
    { id: "sos", title: "SOS", icon: <Puzzle size={24} className="text-pink-400" /> },
    { id: "ular", title: "Ular Tangga", icon: <Dices size={24} className="text-orange-400" /> },
  ];

  const renderGameMenu = () => {
    if (activeGame === "catur") {
      return (
        <div className="bg-[#16111e] p-4 rounded-2xl">
           <button onClick={() => setActiveGame(null)} className="text-red-400 text-xs font-bold mb-4">← Keluar</button>
           <Chessboard position={chessGame.fen()} onPieceDrop={onDrop} boardWidth={320} />
        </div>
      );
    }
    if (activeGame === "tictactoe") {
      return (
        <div className="bg-[#16111e] p-4 rounded-2xl flex flex-col items-center">
           <button onClick={() => setActiveGame(null)} className="text-red-400 text-xs font-bold mb-4 self-start">← Keluar</button>
           <div className="grid grid-cols-3 gap-2 w-full max-w-[300px]">
             {tttBoard.map((cell, idx) => (
               <div key={idx} onClick={() => handleTttClick(idx)} className="w-full aspect-square bg-[#0f0a15] border border-zinc-700 flex items-center justify-center text-3xl font-bold text-white cursor-pointer hover:bg-zinc-800">
                 {cell}
               </div>
             ))}
           </div>
           {calculateTttWinner(tttBoard) && <p className="text-green-400 font-bold mt-4">Pemenang: {calculateTttWinner(tttBoard)}</p>}
        </div>
      );
    }
    if (activeGame === "uno") {
      return (
        <div className="bg-[#16111e] p-4 rounded-2xl flex flex-col items-center min-h-[400px]">
           <button onClick={() => setActiveGame(null)} className="text-red-400 text-xs font-bold mb-4 self-start">← Keluar</button>
           {unoDeck.length === 0 ? (
             <button onClick={startUno} className="bg-purple-600 text-white px-6 py-3 rounded-lg font-bold mt-20">Mulai UNO</button>
           ) : (
             <div className="w-full">
                <p className="text-center text-xs text-yellow-400 mb-4">{unoMsg}</p>
                <div className="flex justify-center mb-8">
                  <div className={`w-16 h-24 bg-${unoDiscard?.color}-600 rounded-lg border-2 border-white flex items-center justify-center text-2xl font-bold text-white shadow-lg`}>{unoDiscard?.value}</div>
                </div>
                <div className="flex gap-2 flex-wrap justify-center">
                  {unoPlayer.map((card, idx) => (
                    <div key={idx} onClick={() => playUno(idx)} className={`w-14 h-20 bg-${card.color}-600 rounded-lg border-2 border-white flex items-center justify-center text-xl font-bold text-white cursor-pointer hover:-translate-y-2 transition-transform shadow-md`}>{card.value}</div>
                  ))}
                </div>
             </div>
           )}
        </div>
      );
    }
    if (activeGame === "domino") {
      return (
        <div className="bg-[#16111e] p-4 rounded-2xl flex flex-col items-center min-h-[400px]">
           <button onClick={() => setActiveGame(null)} className="text-red-400 text-xs font-bold mb-4 self-start">← Keluar</button>
           {dominoBoard.length === 0 ? (
             <button onClick={startDomino} className="bg-purple-600 text-white px-6 py-3 rounded-lg font-bold mt-20">Mulai Domino</button>
           ) : (
             <div className="w-full">
                <p className="text-center text-xs text-yellow-400 mb-4">{dominoMsg}</p>
                <div className="flex justify-center gap-1 mb-8 flex-wrap">
                  {dominoBoard.map((tile, i) => (
                    <div key={i} className="bg-white text-black p-1 text-lg font-bold rounded border border-black flex flex-col items-center">
                      <span>{tile[0]}</span><span className="border-t border-black w-full text-center">{tile[1]}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 flex-wrap justify-center">
                  {dominoPlayer.map((tile, idx) => (
                    <div key={idx} onClick={() => playDomino(idx)} className="bg-zinc-200 text-black p-1 text-lg font-bold rounded cursor-pointer hover:bg-white flex flex-col items-center border border-zinc-500">
                      <span>{tile[0]}</span><span className="border-t border-zinc-400 w-full text-center">{tile[1]}</span>
                    </div>
                  ))}
                </div>
             </div>
           )}
        </div>
      );
    }
    if (activeGame === "sos" || activeGame === "ular") {
      return (
        <div className="bg-[#16111e] p-6 rounded-2xl flex flex-col items-center text-center">
           <button onClick={() => setActiveGame(null)} className="text-red-400 text-xs font-bold mb-4 self-start">← Keluar</button>
           <Gamepad2 size={48} className="text-purple-500 mb-4"/>
           <h2 className="text-white font-bold text-lg">Papan {activeGame.toUpperCase()}</h2>
           <p className="text-zinc-500 text-sm mt-2">Segera hadir dengan papan lengkap!</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-3">
        {gamesList.map((game) => (
          <div key={game.id} className="bg-[#16111e] border border-[#2a2136] rounded-xl p-4 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-[#0f0a15] rounded-full flex items-center justify-center mb-2">{game.icon}</div>
            <h3 className="text-white font-bold text-sm mb-3">{game.title}</h3>
            <button onClick={() => setActiveGame(game.id)} className="bg-zinc-800 text-white text-[10px] font-bold py-1.5 rounded w-full border border-zinc-700 hover:bg-zinc-700">Buka Game</button>
          </div>
        ))}
      </div>
    );
  };

  // DATA FITUR LENGKAP
  const menuData = {
    tools: [
      { title: "Cek NPSN", desc: "Cari data sekolah", icon: <FileText size={24} className="text-blue-400"/>, endpoint: "/api/ceknpsn", payload: { npsn: target } },
      { title: "Cek IMEI", desc: "Cek spesifikasi HP", icon: <Smartphone size={24} className="text-green-400"/>, endpoint: "/api/cekimei", payload: { imei: target } },
      { title: "Cek FreeFire", desc: "Cek akun FF", icon: <Gamepad2 size={24} className="text-yellow-400"/>, endpoint: "/api/cekff", payload: { uid: target } },
      { title: "Cek Roblox", desc: "Cek akun Roblox", icon: <Gamepad2 size={24} className="text-red-400"/>, endpoint: "/api/cekroblox", payload: { username: target } },
      { title: "Cek Resi", desc: "Lacak paket", icon: <FileText size={24} className="text-orange-400"/>, endpoint: "/api/cekresi", payload: { courier: "jne", awb: target } },
      { title: "Cek Phising", desc: "Cek link phising", icon: <ShieldAlert size={24} className="text-purple-400"/>, endpoint: "/api/cekphising", payload: { url: target } },
      { title: "Web Recon", desc: "Scanning website", icon: <Globe size={24} className="text-cyan-400"/>, endpoint: "/api/webrecon", payload: { domain: target } },
      { title: "Cek Data Guru", desc: "Cari data GTK", icon: <Users size={24} className="text-pink-400"/>, endpoint: "/api/cekdataguru", payload: { keyword: target } },
      { title: "Shortener URL", desc: "Pendekkan link", icon: <Link size={24} className="text-indigo-400"/>, endpoint: "/api/shortenerurl", payload: { url: target } },
      { title: "Cek Kode Pos", desc: "Cari kode pos", icon: <Search size={24} className="text-teal-400"/>, endpoint: "/api/cekkodepos", payload: { kodepos: target } }
    ],
    osint: [
      { title: "OSINT Nomor", desc: "Lacak nomor HP", icon: <Search size={24} className="text-yellow-400"/>, endpoint: "/api/osint-nomor", payload: { nomor: target } },
      { title: "OSINT IP", desc: "Lacak IP Address", icon: <Globe size={24} className="text-blue-400"/>, endpoint: "/api/osint-ip", payload: { ip: target } },
      { title: "OSINT Domain", desc: "Lacak domain", icon: <Globe2 size={24} className="text-purple-400"/>, endpoint: "/api/osint-domain", payload: { domain: target } },
      { title: "NIK Parse", desc: "Bongkar data NIK", icon: <User size={24} className="text-pink-400"/>, endpoint: "/api/nikparse", payload: { nik: target } },
      { title: "Cek E-Wallet", desc: "Cek kepemilikan wallet", icon: <CreditCard size={24} className="text-green-400"/>, endpoint: "/api/cekwallet", payload: { nomor: target } },
      { title: "Cek Band WA", desc: "Cek banned WA", icon: <ShieldAlert size={24} className="text-red-400"/>, endpoint: "/api/cekbandwa", payload: { nomor: target } },
      { title: "Port Scanner", desc: "Scan port domain", icon: <ScanLine size={24} className="text-orange-400"/>, endpoint: "/api/portscan", payload: { domain: target } },
      { title: "IP Tracker", desc: "Lacak IP detail", icon: <Globe size={24} className="text-cyan-400"/>, endpoint: "/api/iptracker", payload: { ip: target } }
    ],
    download: [
      { title: "TikTok DL", desc: "Unduh video TikTok", icon: <DownloadCloud size={24} className="text-pink-400"/>, endpoint: "/api/download/tiktok", payload: { url: target } },
      { title: "TikTok V2", desc: "Alternatif TikTok DL", icon: <DownloadCloud size={24} className="text-pink-500"/>, endpoint: "/api/download/tiktok2", payload: { url: target } },
      { title: "Instagram DL", desc: "Unduh foto/video IG", icon: <DownloadCloud size={24} className="text-purple-400"/>, endpoint: "/api/download/instagram", payload: { url: target } },
      { title: "Facebook DL", desc: "Unduh video FB", icon: <DownloadCloud size={24} className="text-blue-400"/>, endpoint: "/api/download/facebook", payload: { url: target } },
      { title: "Spotify DL", desc: "Unduh lagu Spotify", icon: <Music size={24} className="text-green-400"/>, endpoint: "/api/download/spotify", payload: { query: target } }
    ],
    spam: [
      { title: "Spam OTP", desc: "Kirim OTP massal", icon: <MessageSquare size={24} className="text-blue-400"/>, endpoint: "/api/spamotp", payload: { nomor: target } },
      { title: "Spam Call", desc: "Kirim panggilan", icon: <Smartphone size={24} className="text-green-400"/>, endpoint: "/api/spamcall", payload: { nomor: target } },
      { title: "Spam Pair", desc: "Kirim kode pairing", icon: <FileText size={24} className="text-yellow-400"/>, endpoint: "/api/spampair", payload: { nomor: target } },
      { title: "Spam Report WA", desc: "Laporkan WA target", icon: <ShieldAlert size={24} className="text-red-400"/>, endpoint: "/api/spamrepwa", payload: { nomor: target } },
      { title: "Spam NGL", desc: "Kirim pesan NGL", icon: <MessageSquare size={24} className="text-pink-400"/>, endpoint: "/api/spamngl", payload: { username: target } },
      { title: "Spam Gmail", desc: "Kirim email massal", icon: <Mail size={24} className="text-orange-400"/>, endpoint: "/api/spamgmail", payload: { email: target } }
    ],
    bug: [
      { title: "Verload FC", desc: "Force Close", icon: <Bug size={24} className="text-red-500"/>, endpoint: "/api/bug-wa", payload: { target: target, senderId: username, type: "verload" } },
      { title: "Invisible FC", desc: "Invisible Crash", icon: <Bug size={24} className="text-purple-500"/>, endpoint: "/api/bug-wa", payload: { target: target, senderId: username, type: "invisible" } },
      { title: "Crash Calls", desc: "Bug panggilan", icon: <Bug size={24} className="text-yellow-500"/>, endpoint: "/api/bug-wa", payload: { target: target, senderId: username, type: "crashcalls" } },
      { title: "Button Crash", desc: "Tombol rusak", icon: <Bug size={24} className="text-blue-500"/>, endpoint: "/api/bug-wa", payload: { target: target, senderId: username, type: "button" } },
      { title: "Location Crash", desc: "Bug lokasi", icon: <Bug size={24} className="text-green-500"/>, endpoint: "/api/bug-wa", payload: { target: target, senderId: username, type: "location" } },
      { title: "Native Crash", desc: "Native Bug", icon: <Bug size={24} className="text-pink-500"/>, endpoint: "/api/bug-wa", payload: { target: target, senderId: username, type: "native" } },
      { title: "Ziperrsedot", desc: "Bug Ziper", icon: <Bug size={24} className="text-orange-500"/>, endpoint: "/api/bug-wa", payload: { target: target, senderId: username, type: "ziperrsedot" } }
    ]
  };

  // --- RENDER HALAMAN LAINNYA ---
  const renderHome = () => (
    <main className="px-4 max-w-md mx-auto space-y-5">
      <div className="w-full h-44 bg-black rounded-2xl overflow-hidden relative">
        <video src={videoIndex === 0 ? VIDEO_1 : VIDEO_2} autoPlay muted playsInline className="w-full h-full object-cover" onEnded={() => setVideoIndex(1)} loop={videoIndex === 1} />
      </div>
      <div className="bg-[#16111e] p-4 rounded-2xl flex items-center gap-3">
        <User size={32} className="text-zinc-500" />
        <h3 className="text-white font-bold">{username} <span className="text-[10px] bg-purple-600 px-2 py-0.5 rounded text-white ml-2">{userRole}</span></h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setActiveTab("games")} className="bg-[#1e182b] p-3 rounded-xl flex flex-col items-start border border-purple-900"><Gamepad2 size={20} className="text-purple-400 mb-1"/><span className="text-white font-bold text-sm">Main Game</span></button>
      </div>
      <div className="bg-[#16111e] p-4 rounded-2xl">
        <h3 className="text-white font-bold mb-3">Global Chat</h3>
        <button onClick={() => setActiveTab("chat")} className="w-full bg-[#1c1526] py-2 rounded-xl text-white text-sm">Buka Chat</button>
      </div>
    </main>
  );

  const renderContent = () => {
    if (activeTab === "home") return renderHome();
    if (activeTab === "games") return renderGameMenu();
    if (activeTab === "chat") {
      return (
        <div className="flex flex-col h-[calc(100vh-130px)] p-4">
          <div className="flex-1 overflow-y-auto space-y-3">
            {globalMsgs.map((m, i) => <div key={i} className="text-xs text-white bg-zinc-800 p-2 rounded">{m.from}: {m.msg}</div>)}
          </div>
          <form onSubmit={sendGlobalMsg} className="flex gap-2 mt-4">
            <input type="text" value={msgInput} onChange={e=>setMsgInput(e.target.value)} className="flex-1 bg-zinc-900 p-2 rounded text-white text-sm" placeholder="Pesan..."/>
            <button className="bg-purple-600 px-4 rounded text-white font-bold"><Send size={16}/></button>
          </form>
        </div>
      );
    }

    if (selectedTool) {
      return (
        <main className="px-4 mt-4">
           <button onClick={() => setSelectedTool(null)} className="text-red-400 text-sm mb-4">← Kembali</button>
           <div className="bg-[#16111e] p-5 rounded-2xl">
             <h2 className="text-white font-bold mb-4">{selectedTool.title}</h2>
             <input type="text" placeholder="Target" value={target} onChange={(e) => setTarget(e.target.value)} className="w-full bg-black border border-zinc-700 p-3 text-white rounded mb-4" />
             <button onClick={() => handleToolRequest(selectedTool.endpoint, selectedTool.payload)} className="w-full bg-purple-600 text-white py-3 rounded font-bold">EKSEKUSI</button>
             {loadingTools && <p className="text-center text-xs text-purple-400 mt-4">Loading...</p>}
             {toolsResult && <pre className="mt-4 text-[10px] text-zinc-400 bg-black p-3 rounded overflow-auto max-h-40">{JSON.stringify(toolsResult, null, 2)}</pre>}
           </div>
        </main>
      );
    }

    return (
      <main className="px-4 mt-4 space-y-3">
        {(menuData[activeTab] || []).map((item, idx) => (
          <div key={idx} onClick={() => setSelectedTool(item)} className="bg-[#16111e] p-4 rounded-xl flex items-center gap-3 cursor-pointer">
            {item.icon} <h3 className="text-white font-bold text-sm flex-1">{item.title}</h3>
          </div>
        ))}
      </main>
    );
  };

  return (
    <div className="min-h-screen bg-[#0f0a15] text-zinc-300 pb-24">
      <header className="p-4 flex justify-between bg-black">
        <h1 className="text-white font-bold capitalize">{activeTab}</h1>
        <User size={20}/>
      </header>
      {renderContent()}

      <div className="fixed bottom-0 w-full bg-[#16111e] p-2 flex gap-2 overflow-x-auto z-30">
         <button onClick={() => {setActiveTab("home"); setActiveGame(null);}} className="p-2 text-white"><HomeIcon size={20}/></button>
         <button onClick={() => {setActiveTab("tools"); setActiveGame(null);}} className="p-2 text-white"><Wrench size={20}/></button>
         <button onClick={() => {setActiveTab("download"); setActiveGame(null);}} className="p-2 text-white"><DownloadCloud size={20}/></button>
         <button onClick={() => {setActiveTab("osint"); setActiveGame(null);}} className="p-2 text-white"><Search size={20}/></button>
         <button onClick={() => {setActiveTab("spam"); setActiveGame(null);}} className="p-2 text-white"><MessageSquare size={20}/></button>
         <button onClick={() => {setActiveTab("bug"); setActiveGame(null);}} className="p-2 text-white"><Bug size={20}/></button>
      </div>
    </div>
  );
}
