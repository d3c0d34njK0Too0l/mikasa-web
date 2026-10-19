"use client";
import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("spam");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  const [target, setTarget] = useState("");
  const [senderId, setSenderId] = useState("");
  const [bugType, setBugType] = useState("verload");

  const API_URL = "https://lil-willow-compensation-their.trycloudflare.com";
  const API_KEY = "rahasia_banget_123";

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

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 font-sans pb-20">
      <header className="bg-[#111] border-b border-green-900/50 p-4 sticky top-0 z-10 flex items-center justify-between shadow-[0_0_20px_rgba(0,255,0,0.1)]">
        <h1 className="text-xl font-bold text-green-500 tracking-widest">
          MIKASA<span className="text-white">BOT</span>
        </h1>
        <div className="text-xs text-green-700 bg-green-950/30 px-2 py-1 rounded border border-green-900">
          v1.0.0
        </div>
      </header>

      <main className="p-4 max-w-md mx-auto">
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
          {["spam", "bug", "osint", "tools"].map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setResult(null); }}
              className={`px-4 py-2 rounded-md text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === tab
                  ? "bg-green-600 text-black shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                  : "bg-zinc-900 text-zinc-400 border border-zinc-800"
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="bg-[#111] border border-zinc-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50"></div>

          {activeTab === "spam" && (
            <div className="space-y-4">
              <h2 className="text-green-400 font-mono text-sm mb-2">// SPAM TARGET</h2>
              <input
                type="text"
                placeholder="Nomor Target (628xxx)"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="w-full bg-black border border-zinc-700 rounded p-3 text-white focus:outline-none focus:border-green-500"
              />
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => handleRequest("/api/spamotp", { nomor: target })} className="bg-zinc-900 border border-green-900 hover:bg-green-900/20 text-green-500 py-3 rounded font-bold text-sm">Spam OTP</button>
                <button onClick={() => handleRequest("/api/spamcall", { nomor: target })} className="bg-zinc-900 border border-green-900 hover:bg-green-900/20 text-green-500 py-3 rounded font-bold text-sm">Spam Call</button>
                <button onClick={() => handleRequest("/api/spampair", { nomor: target })} className="bg-zinc-900 border border-green-900 hover:bg-green-900/20 text-green-500 py-3 rounded font-bold text-sm">Spam Pair</button>
                <button onClick={() => handleRequest("/api/spamrepwa", { nomor: target })} className="bg-zinc-900 border border-green-900 hover:bg-green-900/20 text-green-500 py-3 rounded font-bold text-sm">Spam Report</button>
              </div>
            </div>
          )}

          {activeTab === "bug" && (
            <div className="space-y-4">
              <h2 className="text-red-400 font-mono text-sm mb-2">// BUG WHATSAPP</h2>
              <input type="text" placeholder="Nomor Target (628xxx)" value={target} onChange={(e) => setTarget(e.target.value)} className="w-full bg-black border border-zinc-700 rounded p-3 text-white" />
              <input type="text" placeholder="Sender ID (User ID Telegram lo)" value={senderId} onChange={(e) => setSenderId(e.target.value)} className="w-full bg-black border border-zinc-700 rounded p-3 text-white" />
              <select value={bugType} onChange={(e) => setBugType(e.target.value)} className="w-full bg-black border border-zinc-700 rounded p-3 text-white">
                <option value="verload">Verload FC</option>
                <option value="forceclose">Force Close</option>
                <option value="crashcalls">Crash Calls</option>
                <option value="location">Location Crash</option>
                <option value="button">Button Crash</option>
                <option value="native">Native Crash</option>
                <option value="invisible">Invisible FC</option>
                <option value="ziperrsedot">Ziperrsedot</option>
              </select>
              <button onClick={() => handleRequest("/api/bug-wa", { target, senderId, type: bugType })} className="w-full bg-red-900/40 border border-red-700 hover:bg-red-800 text-red-400 py-3 rounded font-bold text-sm">Kirim Bug 🚀</button>
            </div>
          )}

          {activeTab === "osint" && (
            <div className="space-y-4">
              <h2 className="text-blue-400 font-mono text-sm mb-2">// OSINT TRACKER</h2>
              <input type="text" placeholder="Nomor / IP / Username" value={target} onChange={(e) => setTarget(e.target.value)} className="w-full bg-black border border-zinc-700 rounded p-3 text-white" />
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => handleRequest("/api/osint-nomor", { nomor: target })} className="bg-zinc-900 border border-blue-900 hover:bg-blue-900/20 text-blue-400 py-2 rounded text-xs font-bold">Cek Nomor</button>
                <button onClick={() => handleRequest("/api/osint-ip", { ip: target })} className="bg-zinc-900 border border-blue-900 hover:bg-blue-900/20 text-blue-400 py-2 rounded text-xs font-bold">Cek IP</button>
                <button onClick={() => handleRequest("/api/cekwallet", { nomor: target })} className="bg-zinc-900 border border-blue-900 hover:bg-blue-900/20 text-blue-400 py-2 rounded text-xs font-bold">Cek E-Wallet</button>
                <button onClick={() => handleRequest("/api/cekbandwa", { nomor: target })} className="bg-zinc-900 border border-blue-900 hover:bg-blue-900/20 text-blue-400 py-2 rounded text-xs font-bold">Cek Band WA</button>
              </div>
            </div>
          )}

          {activeTab === "tools" && (
            <div className="space-y-4">
              <h2 className="text-yellow-400 font-mono text-sm mb-2">// UTILITY TOOLS</h2>
              <input type="text" placeholder="Input (URL / NPSN / IMEI)" value={target} onChange={(e) => setTarget(e.target.value)} className="w-full bg-black border border-zinc-700 rounded p-3 text-white" />
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => handleRequest("/api/ceknpsn", { npsn: target })} className="bg-zinc-900 border border-yellow-900 hover:bg-yellow-900/20 text-yellow-400 py-2 rounded text-xs font-bold">Cek NPSN</button>
                <button onClick={() => handleRequest("/api/cekimei", { imei: target })} className="bg-zinc-900 border border-yellow-900 hover:bg-yellow-900/20 text-yellow-400 py-2 rounded text-xs font-bold">Cek IMEI</button>
                <button onClick={() => handleRequest("/api/cekphising", { url: target })} className="bg-zinc-900 border border-yellow-900 hover:bg-yellow-900/20 text-yellow-400 py-2 rounded text-xs font-bold">Cek Phising</button>
                <button onClick={() => handleRequest("/api/shortenerurl", { url: target })} className="bg-zinc-900 border border-yellow-900 hover:bg-yellow-900/20 text-yellow-400 py-2 rounded text-xs font-bold">Shortener URL</button>
              </div>
            </div>
          )}
        </div>

        {loading && <div className="mt-6 text-center text-green-500 animate-pulse font-mono text-sm">[ Executing Command... ]</div>}

        {result && (
          <div className="mt-6 bg-black border border-zinc-800 rounded-lg p-4 overflow-hidden shadow-inner">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${result.status ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-xs text-zinc-500 font-mono">RESPONSE:</span>
            </div>
            <pre className="text-xs text-zinc-400 font-mono whitespace-pre-wrap break-all max-h-60 overflow-y-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </main>
    </div>
  );
}
