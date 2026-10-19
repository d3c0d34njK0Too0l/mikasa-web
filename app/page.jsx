"use client";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { 
  Home as HomeIcon, Menu, User, Lock, Eye, EyeOff, ArrowRight, 
  MessageSquare, Bell, Plus, Heart, Calendar, Wrench, 
  DownloadCloud, Search, Bug, Send, X, ChevronLeft, 
  ShieldAlert, Globe, Smartphone, FileText, Play, Pause, Gamepad2, Music, 
  Dices, Bot, Grid3X3, Crown, CircleDollarSign, Users, Puzzle, Globe2, CreditCard, Link, ScanLine, Mail
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
  const [activeGame, setActiveGame] = useState(null); 
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

  // --- LOGIKA CATUR (AI MINIMAX) ---
  const [chessGame, setChessGame] = useState(new Chess());
  
  function makeAiMove() {
    const game = new Chess(chessGame.fen());
    const possibleMoves = game.moves();
    if (game.isGameOver() || possibleMoves.length === 0) return;
    
    let bestMove = null;
    let bestValue = -9999;
    
    for (let i = 0; i < possibleMoves.length; i++) {
      game.move(possibleMoves[i]);
      let boardValue = -evaluateBoard(game.board());
      if (boardValue > bestValue) {
        bestValue = boardValue;
        bestMove = possibleMoves[i];
      }
      game.undo();
    }
    
    if (bestMove) {
      game.move(bestMove);
      setChessGame(new Chess(game.fen()));
    }
  }

  const pieceValues = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };
  function evaluateBoard(board) {
    let totalEvaluation = 0;
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        totalEvaluation = totalEvaluation + getPieceValue(board[i][j]);
      }
    }
    return totalEvaluation;
  }
  function getPieceValue(piece) {
    if (piece === null) return 0;
    const absoluteValue = pieceValues[piece.type] || 0;
    return piece.color === 'w' ? absoluteValue : -absoluteValue;
  }

  function onDrop(sourceSquare, targetSquare) {
    try {
      const move = chessGame.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
      if (move === null) return false;
      setChessGame(new Chess(chessGame.fen()));
      setTimeout(() => makeAiMove(), 500);
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

  // --- LOGIKA UNO ---
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
    setUnoMsg("Pilih kartu dengan warna/angka yang sama!");
  };

  const playUno = (cardIndex) => {
    const card = unoPlayer[cardIndex];
    if (card.color === unoDiscard.color || card.value === unoDiscard.value) {
      const newPlayer = unoPlayer.filter((_, i) => i !== cardIndex);
      setUnoPlayer(newPlayer);
      setUnoDiscard(card);
      
      if (newPlayer.length === 0) { setUnoMsg("KAMU MENANG!"); return; }
      setUnoMsg("NPC berfikir...");
      
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
        if (!played) setUnoMsg("NPC menarik kartu. Giliran kamu!");
      }, 1000);
    } else {
      setUnoMsg("Kartu tidak cocok!");
    }
  };

  // --- LOGIKA DOMINO ---
  const [dominoPlayer, setDominoPlayer] = useState([]);
  const [dominoBoard, setDominoBoard] = useState([]);
  const [dominoMsg, setDominoMsg] = useState("");

  const startDomino = () => {
    let deck = [];
    for (let i = 0; i <= 6; i++) {
      for (let j = i; j <= 6; j++) { deck.push([i, j]); }
    }
    deck = deck.sort(() => Math.random() - 0.5);
    setDominoPlayer(deck.slice(0, 7));
    setDominoBoard([deck[14]]);
    setDominoMsg("Pasang kartu yang ujungnya cocok!");
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
    }
  };

  // --- LOGIKA SOS (5x5) ---
  const [sosBoard, setSosBoard] = useState(Array(25).fill(null));
  const [sosTurn, setSosTurn] = useState("S");
  const [sosMsg, setSosMsg] = useState("Kamu main 'S', NPC main 'O'. Bikin pola SOS!");

  const handleSosClick = (idx) => {
    if (sosBoard[idx] || sosTurn !== "S") return;
    const newBoard = [...sosBoard];
    newBoard[idx] = "S";
    setSosBoard(newBoard);
    setSosTurn("O");
    
    setTimeout(() => {
      const emptySpots = newBoard.map((val, i) => val === null ? i : null).filter(val => val !== null);
      if (emptySpots.length > 0) {
        const randomSpot = emptySpots[Math.floor(Math.random() * emptySpots.length)];
        newBoard[randomSpot] = "O";
        setSosBoard([...newBoard]);
        setSosTurn("S");
      }
    }, 800);
  };

  // --- LOGIKA ULAR TANGGA (5x5) ---
  const [ularPos, setUlarPos] = useState(0);
  const [ularNpcPos, setUlarNpcPos] = useState(0);
  const [ularMsg, setUlarMsg] = useState("Lempar dadu buat mulai!");
  const [ularDice, setUlarDice] = useState(1);

  const rollDice = () => {
    if (ularPos >= 25 || ularNpcPos >= 25) return;
    const dice = Math.floor(Math.random() * 6) + 1;
    setUlarDice(dice);
    let newPos = ularPos + dice;
    if (newPos > 25) newPos = 25;
    setUlarPos(newPos);
    setUlarMsg(`Kamu dapet ${dice}, maju ke kotak ${newPos}`);

    setTimeout(() => {
      const npcDice = Math.floor(Math.random() * 6) + 1;
      let newNpcPos = ularNpcPos + npcDice;
      if (newNpcPos > 25) newNpcPos = 25;
      setUlarNpcPos(newNpcPos);
      setUlarMsg(`Kamu kotak ${newPos}, NPC dapet ${npcDice} maju ke kotak ${newNpcPos}`);
      if (newPos === 25) setUlarMsg("KAMU MENANG!");
      else if (newNpcPos === 25) setUlarMsg("NPC MENANG!");
    }, 1000);
  };

  // --- LOGIN & SOCKET ---
  const handleLogin = async (e) => {
    e.preventDefault(); setLoginError("");
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
    if (activeGame === "sos") {
      return (
        <div className="bg-[#16111e] p-4 rounded-2xl flex flex-col items-center">
           <button onClick={() => setActiveGame(null)} className="text-red-400 text-xs font-bold mb-4 self-start">← Keluar</button>
           <p className="text-center text-xs text-yellow-400 mb-4">{sosMsg}</p>
           <div className="grid grid-cols-5 gap-2 w-full max-w-[300px]">
             {sosBoard.map((cell, idx) => (
               <div key={idx} onClick={() => handleSosClick(idx)} className="w-full aspect-square bg-[#0f0a15] border border-zinc-700 flex items-center justify-center text-xl font-bold text-white cursor-pointer hover:bg-zinc-800">
                 {cell}
               </div>
             ))}
           </div>
        </div>
      );
    }
    if (activeGame === "ular") {
      return (
        <div className="bg-[#16111e] p-4 rounded-2xl flex flex-col items-center">
           <button onClick={() => setActiveGame(null)} className="text-red-400 text-xs font-bold mb-4 self-start">← Keluar</button>
           <p className="text-center text-xs text-yellow-400 mb-4">{ularMsg}</p>
           <div className="flex gap-4 mb-4 text-white font-bold">
             <div className="bg-blue-600 p-2 rounded">Kamu: Kotak {ularPos}</div>
             <div className="bg-red-600 p-2 rounded">NPC: Kotak {ularNpcPos}</div>
           </div>
           <div className="grid grid-cols-5 gap-1 w-full max-w-[300px] mb-6">
             {[...Array(25)].map((_, i) => (
               <div key={i} className={`aspect-square flex items-center justify-center text-xs font-bold ${i+1 === ularPos ? 'bg-blue-500 text-white' : i+1 === ularNpcPos ? 'bg-red-500 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
                 {i+1}
               </div>
             ))}
           </div>
           <button onClick={rollDice} className="bg-purple-600 text-white px-6 py-3 rounded-lg font-bold">Lempar Dadu ({ularDice})</button>
        </div>
      );
    }
  };

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
