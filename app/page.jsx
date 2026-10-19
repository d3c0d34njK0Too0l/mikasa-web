"use client";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("spam");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  const [target, setTarget] = useState("");
  const [senderId, setSenderId] = useState("");
  const [bugType, setBugType] = useState("verload");
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // GANTI DENGAN LINK API PERMANEN LO
  const API_URL = "https://api-mikasacloud.my.id";
  const API_KEY = "rahasia_banget_123";

  // Fungsi Handle Login (Simulasi dulu)
  const handleLogin = (e) => {
    e.preventDefault();
    if (username === "admin" && password === "admin") {
      setIsLoggedIn(true);
    } else {
      alert("Username/Password salah! (Gunakan admin/admin buat tes)");
    }
  };

  const handleRequest = async (endpoint, payload) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setResult({ status: false, error: e.message });
    } finally {
      setLoading(false);
    }
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // --- HALAMAN LOGIN ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
        <div className="bg-zinc-800 p-8 rounded-2xl shadow-2xl w-full max-w-sm border border-zinc-700">
          <h1 className="text-2xl font-bold text-center text-white mb-6 tracking-widest">MIKASA<span className="text-blue-500">BOT</span></h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs text-zinc-400 font-semibold mb-1 block">USERNAME</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-zinc-900 border border-zinc-600 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500" placeholder="Masukkan username" />
            </div>
            <div>
              <label className="text-xs text-zinc-400 font-semibold mb-1 block">PASSWORD</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-zinc-900 border border-zinc-600 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500" placeholder="Masukkan password" />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)]">LOGIN</button>
          </form>
          <p className="text-center text-xs text-zinc-500 mt-4">Belum punya akun? Hubungi Admin.</p>
        </div>
      </div>
    );
  }

  // --- HALAMAN UTAMA (DASHBOARD) ---
  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-300 font-sans pb-24 relative overflow-hidden">
      
      {/* Audio Tersembunyi */}
      <audio ref={audioRef} src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" loop />

      {/* HEADER */}
      <header className="bg-zinc-800/80 backdrop-blur-md border-b border-zinc-700 p-4 sticky top-0 z-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsSidebarOpen(true)} className="text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <h1 className="text-xl font-bold text-white tracking-widest">Hello, {username}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-zinc-700 p-2 rounded-full text-zinc-300"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg></button>
        </div>
      </header>

      {/* SIDEBAR OVERLAY */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-30" onClick={() => setIsSidebarOpen(false)}>
          <div className="w-64 bg-zinc-800 h-full p-4 shadow-2xl border-r border-zinc-700" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white mb-6 border-b border-zinc-700 pb-2">MENU</h2>
            <ul className="space-y-4">
              <li><button onClick={() => { setActiveTab("spam"); setIsSidebarOpen(false); }} className="text-zinc-400 hover:text-white w-full text-left font-semibold">Spam Tools</button></li>
              <li><button onClick={() => { setActiveTab("bug"); setIsSidebarOpen(false); }} className="text-zinc-400 hover:text-white w-full text-left font-semibold">WhatsApp Bug</button></li>
              <li><button onClick={() => { setActiveTab("osint"); setIsSidebarOpen(false); }} className="text-zinc-400 hover:text-white w-full text-left font-semibold">OSINT Tracker</button></li>
              <li><button onClick={() => { setActiveTab("tools"); setIsSidebarOpen(false); }} className="text-zinc-400 hover:text-white w-full text-left font-semibold">Utility Tools</button></li>
              <li className="pt-4 border-t border-zinc-700 mt-4"><button onClick={() => setIsLoggedIn(false)} className="text-red-500 w-full text-left font-semibold">Logout</button></li>
            </ul>
          </div>
        </div>
      )}

      <main className="p-4 max-w-md mx-auto">
        
        {/* BANNER KARTU (VIDEO/GAMBAR BERGERAK) */}
        <div className="w-full h-40 bg-zinc-800 rounded-2xl overflow-hidden mb-6 relative border border-zinc-700 shadow-lg">
          <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-80" src="https://cdn.pixabay.com/video/2023/03/31/156622-813779343_large.mp4" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent"></div>
          <div className="absolute bottom-4 left-4 z-10">
            <h2 className="text-white font-bold text-lg">Villain Crash</h2>
            <p className="text-xs text-blue-400 font-semibold">Premium Access</p>
          </div>
        </div>

        {/* CARD KONTEN UTAMA */}
        <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-2xl p-5 shadow-xl">
          
          {activeTab === "spam" && (
            <div className="space-y-4">
              <h2 className="text-blue-400 font-bold text-sm tracking-widest mb-2">SPAM TARGET</h2>
              <input type="text" placeholder="Nomor Target (628xxx)" value={target} onChange={(e) => setTarget(e.target.value)} className="w-full bg-zinc-900 border border-zinc-600 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500" />
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => handleRequest("/api/spamotp", { nomor: target })} className="bg-zinc-800 border border-blue-900 hover:bg-blue-900/40 text-blue-400 py-3 rounded-lg font-bold text-sm transition-all">Spam OTP</button>
                <button onClick={() => handleRequest("/api/spamcall", { nomor: target })} className="bg-zinc-800 border border-blue-900 hover:bg-blue-900/40 text-blue-400 py-3 rounded-lg font-bold text-sm transition-all">Spam Call</button>
              </div>
            </div>
          )}

          {activeTab === "bug" && (
            <div className="space-y-4">
              <h2 className="text-red-400 font-bold text-sm tracking-widest mb-2">WHATSAPP BUG</h2>
              <input type="text" placeholder="Nomor Target (628xxx)" value={target} onChange={(e) => setTarget(e.target.value)} className="w-full bg-zinc-900 border border-zinc-600 rounded-lg p-3 text-white" />
              <input type="text" placeholder="Sender ID" value={senderId} onChange={(e) => setSenderId(e.target.value)} className="w-full bg-zinc-900 border border-zinc-600 rounded-lg p-3 text-white" />
              <select value={bugType} onChange={(e) => setBugType(e.target.value)} className="w-full bg-zinc-900 border border-zinc-600 rounded-lg p-3 text-white">
                <option value="verload">Verload FC</option>
                <option value="forceclose">Force Close</option>
                <option value="crashcalls">Crash Calls</option>
                <option value="invisible">Invisible FC</option>
              </select>
              <button onClick={() => handleRequest("/api/bug-wa", { target, senderId, type: bugType })} className="w-full bg-red-900/30 border border-red-700 hover:bg-red-800 text-red-400 py-3 rounded-lg font-bold text-sm transition-all shadow-[0_0_15px_rgba(220,38,38,0.2)]">SEND BUG</button>
            </div>
          )}

          {activeTab === "osint" && (
            <div className="space-y-4">
              <h2 className="text-purple-400 font-bold text-sm tracking-widest mb-2">OSINT TRACKER</h2>
              <input type="text" placeholder="Nomor / IP / Username" value={target} onChange={(e) => setTarget(e.target.value)} className="w-full bg-zinc-900 border border-zinc-600 rounded-lg p-3 text-white" />
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => handleRequest("/api/osint-nomor", { nomor: target })} className="bg-zinc-800 border border-purple-900 hover:bg-purple-900/40 text-purple-400 py-2 rounded-lg text-xs font-bold">Cek Nomor</button>
                <button onClick={() => handleRequest("/api/osint-ip", { ip: target })} className="bg-zinc-800 border border-purple-900 hover:bg-purple-900/40 text-purple-400 py-2 rounded-lg text-xs font-bold">Cek IP</button>
              </div>
            </div>
          )}

        </div>

        {/* HASIL RESPONSE */}
        {loading && <div className="mt-4 text-center text-blue-500 animate-pulse font-mono text-xs">[ Memproses... ]</div>}
        
        {result && (
          <div className="mt-4 bg-black border border-zinc-700 rounded-lg p-4 shadow-inner max-h-48 overflow-y-auto">
            <span className="text-[10px] text-zinc-500 font-mono block mb-1">RESPONSE:</span>
            <pre className="text-xs text-zinc-300 font-mono whitespace-pre-wrap break-all">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

      </main>

      {/* BOTTOM NAVIGATION & MUSIC PLAYER */}
      <div className="fixed bottom-0 left-0 w-full z-20">
        
        {/* Music Player Bar */}
        <div className="bg-zinc-800 border-t border-zinc-700 p-2 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-900 rounded flex items-center justify-center text-xs text-blue-300">🎵</div>
            <div>
              <p className="text-xs text-white font-semibold">SoundHelix Beat</p>
              <p className="text-[10px] text-zinc-500">Lofi Music</p>
            </div>
          </div>
          <button onClick={toggleMusic} className="text-white bg-blue-600 p-2 rounded-full shadow-lg">
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
            )}
          </button>
        </div>

        {/* Navbar Menu Bawah */}
        <div className="bg-zinc-900 border-t border-zinc-800 flex justify-around p-3">
          <button onClick={() => setActiveTab("spam")} className={`flex flex-col items-center ${activeTab === 'spam' ? 'text-blue-500' : 'text-zinc-500'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            <span className="text-[10px] mt-1">Home</span>
          </button>
          <button onClick={() => setActiveTab("bug")} className={`flex flex-col items-center ${activeTab === 'bug' ? 'text-blue-500' : 'text-zinc-500'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            <span className="text-[10px] mt-1">Bug WA</span>
          </button>
          <button onClick={() => setActiveTab("osint")} className={`flex flex-col items-center ${activeTab === 'osint' ? 'text-blue-500' : 'text-zinc-500'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <span className="text-[10px] mt-1">OSINT</span>
          </button>
          <button onClick={() => setActiveTab("tools")} className={`flex flex-col items-center ${activeTab === 'tools' ? 'text-blue-500' : 'text-zinc-500'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <span className="text-[10px] mt-1">Tools</span>
          </button>
        </div>
      </div>

    </div>
  );
}
