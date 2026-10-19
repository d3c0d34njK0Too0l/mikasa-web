"use client";
import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { Menu, User, Lock, Eye, EyeOff, ArrowRight, MessageSquare, Bell, PlayCircle, Plus, CheckCircle2, Heart, Calendar, Send, X } from "lucide-react";

const API_URL = "https://api-mikasacloud.my.id";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  
  const [activeTab, setActiveTab] = useState("home");
  const [socket, setSocket] = useState(null);
  
  // State Real-time
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [globalMsgs, setGlobalMsgs] = useState([]);
  const [msgInput, setMsgInput] = useState("");
  
  // State Private Chat
  const [chatTarget, setChatTarget] = useState(null); // Username yang lagi dichat
  const [privateMsgs, setPrivateMsgs] = useState([]); // Riwayat chat private
  
  // State Banner Video
  const [videoIndex, setVideoIndex] = useState(0);
  const videos = ["https://j.top4top.io/m_3944kuzbh0.mp4", "https://d.top4top.io/m_3944j368i0.mp4", "https://d.top4top.io/m_3944j368i0.mp4"];

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("https://raw.githubusercontent.com/d3c0d34njK0Too0l/mikasa-web/main/users.json");
      const users = await res.json();
      const validUser = users.find(u => u.username === username && u.password === password);
      
      if (validUser) {
        setIsLoggedIn(true);
      } else {
        setLoginError("Akun tidak ditemukan.");
      }
    } catch (err) {
      setLoginError("Gagal terhubung ke database.");
    }
  };

  // Inisialisasi Socket pas udah login
  useEffect(() => {
    if (isLoggedIn) {
      const newSocket = io(API_URL);
      setSocket(newSocket);
      newSocket.emit('user_online', username);

      newSocket.on('update_online_users', (users) => {
        setOnlineUsers(users.filter(u => u !== username)); // Jangan tampilin diri sendiri di story
      });

      newSocket.on('receive_global_msg', (data) => {
        setGlobalMsgs((prev) => [...prev, data]);
      });

      newSocket.on('receive_private_msg', (data) => {
        // Kalo pesan ini buat gua, atau dari orang yang lagi gua chat
        if (data.from === username || data.to === username) {
          setPrivateMsgs((prev) => [...prev, data]);
        }
      });

      return () => newSocket.close();
    }
  }, [isLoggedIn, username]);

  const sendGlobalMsg = (e) => {
    e.preventDefault();
    if (!msgInput.trim() || !socket) return;
    socket.emit('send_global_msg', { from: username, msg: msgInput });
    setMsgInput("");
  };

  const sendPrivateMsg = (e) => {
    e.preventDefault();
    if (!msgInput.trim() || !socket || !chatTarget) return;
    socket.emit('send_private_msg', { from: username, to: chatTarget, msg: msgInput });
    setMsgInput("");
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0d0914] flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-white mb-6">MIKASA LOGIN</h1>
        <form onSubmit={handleLogin} className="bg-[#16111e] p-6 rounded-2xl w-full max-w-sm border border-[#2a2136]">
           {loginError && <p className="text-red-500 text-xs mb-2">{loginError}</p>}
           <input type="text" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} className="w-full bg-black border border-zinc-800 p-3 rounded mb-3 text-white" />
           <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full bg-black border border-zinc-800 p-3 rounded mb-3 text-white" />
           <button type="submit" className="w-full bg-purple-600 p-3 rounded text-white font-bold">Login</button>
        </form>
      </div>
    );
  }

  // --- DASHBOARD UTAMA ---
  return (
    <div className="min-h-screen bg-[#0f0a15] text-zinc-300 font-sans pb-24 relative">
      
      {/* HEADER */}
      <header className="p-4 flex items-center justify-between sticky top-0 bg-[#0f0a15]/90 backdrop-blur-md z-20">
        <button onClick={() => setActiveTab("home")}><Menu size={24} /></button>
        <h1 className="text-white font-semibold">Mikasa App</h1>
        <User size={20} />
      </header>

      {/* KALAU LAGI BUKA CHAT PRIVATE */}
      {chatTarget ? (
         <div className="p-4 max-w-md mx-auto h-[calc(100vh-140px)] flex flex-col">
            <div className="flex items-center gap-3 mb-4 border-b border-zinc-800 pb-3">
              <button onClick={() => { setChatTarget(null); setPrivateMsgs([]); }}><X size={20} /></button>
              <h2 className="text-white font-bold">{chatTarget}</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 mb-4">
              {privateMsgs.map((m, i) => (
                <div key={i} className={`p-2 rounded-lg max-w-[80%] ${m.from === username ? 'bg-purple-600 ml-auto text-white' : 'bg-zinc-800 text-zinc-300'}`}>
                  {m.msg}
                </div>
              ))}
            </div>

            <form onSubmit={sendPrivateMsg} className="flex gap-2">
               <input type="text" value={msgInput} onChange={e=>setMsgInput(e.target.value)} className="flex-1 bg-zinc-900 border border-zinc-700 p-3 rounded-full text-white" placeholder="Ketik pesan..." />
               <button type="submit" className="bg-purple-600 p-3 rounded-full text-white"><Send size={18} /></button>
            </form>
         </div>
      ) : (
        // --- KONTEN HOME BIASA ---
        <main className="px-4 max-w-md mx-auto space-y-5">
          
          {/* BANNER VIDEO (Sesuai request lo) */}
          <div className="w-full h-44 bg-black rounded-2xl overflow-hidden relative shadow-lg">
            <video key={videoIndex} src={videos[videoIndex]} autoPlay muted playsInline className="w-full h-full object-cover" onEnded={() => videoIndex < videos.length - 1 && setVideoIndex(videoIndex + 1)} loop={videoIndex === videos.length - 1} />
            <div className="absolute bottom-4 left-4 z-10">
              <h2 className="text-white font-bold">Mikasa Project</h2>
            </div>
          </div>

          {/* STATUS STORY (REAL-TIME USER ONLINE) */}
          <div>
            <h3 className="text-xs font-bold text-zinc-400 mb-2">ONLINE USERS ({onlineUsers.length})</h3>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {onlineUsers.length === 0 && <p className="text-xs text-zinc-500">Belum ada yang online.</p>}
              {onlineUsers.map((name, i) => (
                <div key={i} onClick={() => setChatTarget(name)} className="flex flex-col items-center gap-1 cursor-pointer">
                  <div className="w-14 h-14 rounded-full border-2 border-purple-600 p-0.5">
                    <div className="w-full h-full rounded-full bg-zinc-800 flex items-center justify-center text-purple-400 font-bold">
                      {name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <span className="text-[10px] text-zinc-300 truncate w-14 text-center">{name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* GLOBAL CHAT (REAL-TIME) */}
          <div className="bg-[#16111e] border border-[#2a2136] rounded-2xl p-4">
            <h3 className="text-white font-bold text-sm mb-3">Global Chat</h3>
            
            <div className="bg-[#0f0a15] border border-[#2a2136] rounded-xl p-3 h-32 overflow-y-auto mb-3 space-y-2">
              {globalMsgs.map((m, i) => (
                <p key={i} className="text-xs text-zinc-300">
                  <span className="text-purple-400 font-bold">{m.from}:</span> {m.msg}
                </p>
              ))}
            </div>
            
            <form onSubmit={sendGlobalMsg} className="flex gap-2">
               <input type="text" value={msgInput} onChange={e=>setMsgInput(e.target.value)} className="flex-1 bg-zinc-900 border border-zinc-800 p-2 rounded-lg text-white text-sm" placeholder="Tulis pesan global..." />
               <button type="submit" className="bg-purple-600 p-2 rounded-lg text-white"><Send size={16} /></button>
            </form>
          </div>

        </main>
      )}

      {/* NAVBAR BAWAH YANG BISA DIGESER KE KANAN */}
      <div className="fixed bottom-0 w-full bg-[#16111e] border-t border-[#2a2136] p-2 z-30">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide px-2">
           {['Home', 'Tools', 'Download', 'OSINT', 'Spam', 'Bug WA', 'Lainnya'].map((menu, i) => (
             <button key={i} onClick={() => setActiveTab(menu.toLowerCase())} className="flex flex-col items-center min-w-[70px] p-2">
                <div className={`p-2 rounded-full ${activeTab === menu.toLowerCase() ? 'bg-purple-600 text-white' : 'text-zinc-500'}`}>
                  <MessageSquare size={18} />
                </div>
                <span className="text-[10px] mt-1 text-zinc-400">{menu}</span>
             </button>
           ))}
        </div>
      </div>

    </div>
  );
}
