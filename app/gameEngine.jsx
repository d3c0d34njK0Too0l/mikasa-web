"use client";
import { useState, useEffect, useRef } from "react";
import { X, Trophy, RotateCcw, Undo2 } from "lucide-react";
import { Chess } from "chess.js";

// ==========================================
// CATUR (chess.js + AI minimax alpha-beta)
// Kompatibel chess.js v0.x (game_over) & v1.x (isGameOver)
// ==========================================

// ---------- helper kompatibilitas versi ----------
const isOver = (g) => (g.isGameOver ? g.isGameOver() : g.game_over());
const isMate = (g) => (g.isCheckmate ? g.isCheckmate() : g.in_checkmate());
const isCheck = (g) => (g.isCheck ? g.isCheck() : g.in_check());

// ---------- evaluasi ----------
const VAL = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

// Piece-square tables (sudut pandang putih, baris 0 = rank 8)
const PST = {
  p: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5, 5, 10, 25, 25, 10, 5, 5],
    [0, 0, 0, 20, 20, 0, 0, 0],
    [5, -5, -10, 0, 0, -10, -5, 5],
    [5, 10, 10, -20, -20, 10, 10, 5],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ],
  n: [
    [-50, -40, -30, -30, -30, -30, -40, -50],
    [-40, -20, 0, 0, 0, 0, -20, -40],
    [-30, 0, 10, 15, 15, 10, 0, -30],
    [-30, 5, 15, 20, 20, 15, 5, -30],
    [-30, 0, 15, 20, 20, 15, 0, -30],
    [-30, 5, 10, 15, 15, 10, 5, -30],
    [-40, -20, 0, 5, 5, 0, -20, -40],
    [-50, -40, -30, -30, -30, -30, -40, -50],
  ],
  b: [
    [-20, -10, -10, -10, -10, -10, -10, -20],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-10, 0, 5, 10, 10, 5, 0, -10],
    [-10, 5, 5, 10, 10, 5, 5, -10],
    [-10, 0, 10, 10, 10, 10, 0, -10],
    [-10, 10, 10, 10, 10, 10, 10, -10],
    [-10, 5, 0, 0, 0, 0, 5, -10],
    [-20, -10, -10, -10, -10, -10, -10, -20],
  ],
  r: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [5, 10, 10, 10, 10, 10, 10, 5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [0, 0, 0, 5, 5, 0, 0, 0],
  ],
  q: [
    [-20, -10, -10, -5, -5, -10, -10, -20],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-10, 0, 5, 5, 5, 5, 0, -10],
    [-5, 0, 5, 5, 5, 5, 0, -5],
    [0, 0, 5, 5, 5, 5, 0, -5],
    [-10, 5, 5, 5, 5, 5, 0, -10],
    [-10, 0, 5, 0, 0, 0, 0, -10],
    [-20, -10, -10, -5, -5, -10, -10, -20],
  ],
  k: [
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-20, -30, -30, -40, -40, -30, -30, -20],
    [-10, -20, -20, -20, -20, -20, -20, -10],
    [20, 20, 0, 0, 0, 0, 20, 20],
    [20, 30, 10, 0, 0, 10, 30, 20],
  ],
};

// skor dari sudut pandang PUTIH
function evaluate(g) {
  let score = 0;
  const b = g.board();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const cell = b[r][c];
      if (!cell) continue;
      if (cell.color === "w") score += VAL[cell.type] + PST[cell.type][r][c];
      else score -= VAL[cell.type] + PST[cell.type][7 - r][c];
    }
  }
  return score;
}

function orderMoves(moves) {
  return moves.sort((a, b) => {
    const sa = (a.captured ? VAL[a.captured] * 10 - VAL[a.piece] : 0) + (a.promotion ? 800 : 0);
    const sb = (b.captured ? VAL[b.captured] * 10 - VAL[b.piece] : 0) + (b.promotion ? 800 : 0);
    return sb - sa;
  });
}

const toMove = (m) => ({ from: m.from, to: m.to, promotion: m.promotion || "q" });

// negamax: skor dari sudut pandang pihak yang jalan
function negamax(g, depth, alpha, beta) {
  if (isOver(g)) {
    if (isMate(g)) return -99999 - depth; // yang jalan kena skakmat
    return 0; // seri
  }
  if (depth === 0) return g.turn() === "w" ? evaluate(g) : -evaluate(g);

  const moves = orderMoves(g.moves({ verbose: true }));
  let best = -Infinity;
  for (const m of moves) {
    g.move(toMove(m));
    const score = -negamax(g, depth - 1, -beta, -alpha);
    g.undo();
    if (score > best) best = score;
    if (best > alpha) alpha = best;
    if (alpha >= beta) break;
  }
  return best;
}

function pickBestMove(game, depth, noise = 0) {
  const g = new Chess(game.fen()); // salin biar papan asli aman
  const moves = orderMoves(g.moves({ verbose: true }));
  let bestScore = -Infinity;
  let best = [];
  for (const m of moves) {
    g.move(toMove(m));
    const score = -negamax(g, depth - 1, -Infinity, Infinity) + Math.random() * noise;
    g.undo();
    if (score > bestScore + 0.001) {
      bestScore = score;
      best = [m];
    } else if (Math.abs(score - bestScore) <= 0.001) {
      best.push(m);
    }
  }
  return best[Math.floor(Math.random() * best.length)];
}

function chooseNpcMove(game, level) {
  const moves = game.moves({ verbose: true });
  if (!moves.length) return null;
  if (level === "easy") {
    // 60% asal jalan, 40% lumayan mikir (depth 1)
    if (Math.random() < 0.6) return moves[Math.floor(Math.random() * moves.length)];
    return pickBestMove(game, 1, 30);
  }
  if (level === "medium") return pickBestMove(game, 2, 15);
  return pickBestMove(game, 3, 0); // hard
}

// ---------- tampilan ----------
const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1];
const GLYPH = { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" };
const NO_EMOJI = "\uFE0E"; // paksa teks, bukan emoji

const whiteStyle = { color: "#fff", textShadow: "0 0 2px #000, 0 0 2px #000, 0 1px 2px #000" };
const blackStyle = { color: "#111", textShadow: "0 0 1px rgba(255,255,255,.35)" };

export function GameCatur({ level = "easy", onClose }) {
  const chessRef = useRef(new Chess());
  const [fen, setFen] = useState(chessRef.current.fen());
  const [selected, setSelected] = useState(null);
  const [thinking, setThinking] = useState(false);

  const g = chessRef.current;
  const board = g.board();
  const over = isOver(g);
  const turn = g.turn();
  const history = g.history({ verbose: true });
  const last = history[history.length - 1];

  // langkah legal dari bidak terpilih
  const legal = selected ? g.moves({ square: selected, verbose: true }) : [];
  const legalMap = {};
  legal.forEach((m) => (legalMap[m.to] = m));

  // posisi raja yang lagi skak
  let checkSquare = null;
  if (isCheck(g)) {
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++) {
        const cell = board[r][c];
        if (cell && cell.type === "k" && cell.color === turn) checkSquare = FILES[c] + RANKS[r];
      }
  }

  // bidak yang sudah dimakan
  const eatenByMe = history.filter((m) => m.color === "w" && m.captured).map((m) => m.captured);
  const eatenByNpc = history.filter((m) => m.color === "b" && m.captured).map((m) => m.captured);

  // status
  let status;
  if (over) {
    if (isMate(g)) status = turn === "b" ? "Skakmat! Kamu menang 🎉" : "Skakmat! Kamu kalah 💀";
    else status = "Seri!";
  } else if (thinking || turn === "b") status = "NPC mikir...";
  else if (checkSquare) status = "Skak! Selamatkan rajamu";
  else status = "Giliranmu (Putih)";

  // ---------- giliran NPC ----------
  useEffect(() => {
    const game = chessRef.current;
    if (game.turn() !== "b" || isOver(game)) return;
    setThinking(true);
    const timer = setTimeout(() => {
      const move = chooseNpcMove(game, level);
      if (move) game.move(toMove(move));
      setThinking(false);
      setFen(game.fen());
    }, 450);
    return () => {
      clearTimeout(timer);
      setThinking(false);
    };
  }, [fen, level]);

  // ---------- klik petak ----------
  const handleClick = (r, c) => {
    if (over || turn !== "w" || thinking) return;
    const square = FILES[c] + RANKS[r];
    const piece = g.get(square);

    if (selected) {
      if (square === selected) return setSelected(null);
      if (piece && piece.color === "w") return setSelected(square); // ganti bidak
      if (legalMap[square]) {
        try {
          g.move({ from: selected, to: square, promotion: "q" });
          setFen(g.fen());
        } catch (e) {}
      }
      return setSelected(null);
    }
    if (piece && piece.color === "w") setSelected(square);
  };

  const handleReset = () => {
    chessRef.current = new Chess();
    setSelected(null);
    setFen(chessRef.current.fen());
  };

  const handleUndo = () => {
    if (thinking || !history.length) return;
    g.undo();
    if (g.turn() === "b") g.undo(); // balik ke giliran kamu
    setSelected(null);
    setFen(g.fen());
  };

  const renderEaten = (list, color) => (
    <div className="flex h-5 items-center gap-0.5 text-base leading-none">
      {list.map((t, i) => (
        <span key={i} style={color === "w" ? whiteStyle : blackStyle}>
          {GLYPH[t] + NO_EMOJI}
        </span>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-2">
      <div className="bg-[#1c1c1e] border border-zinc-700 rounded-2xl w-full max-w-sm p-4 relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-zinc-400">
          <X size={20} />
        </button>
        <h2 className="text-white font-bold text-center mb-1">
          Catur <span className="text-zinc-400 font-normal">({level})</span>
        </h2>
        <p className="text-xs text-center text-zinc-400 mb-2 h-4">{status}</p>

        {/* bidak yg dimakan NPC (punya kamu yg hilang) */}
        <div className="min-h-5 mb-1">{renderEaten(eatenByNpc, "w")}</div>

        <div className="grid grid-cols-8 w-full aspect-square mb-1 rounded-md overflow-hidden border-2 border-zinc-600 select-none">
          {board.map((row, r) =>
            row.map((cell, c) => {
              const square = FILES[c] + RANKS[r];
              const dark = (r + c) % 2 === 1;
              const isSel = selected === square;
              const isLast = last && (last.from === square || last.to === square);
              const target = legalMap[square];
              const isCheckSq = checkSquare === square;

              let bg = dark ? "#769656" : "#eeeed2";
              if (isLast) bg = dark ? "#b9ca43" : "#f5f682";
              if (isSel) bg = "#f6d365";
              if (isCheckSq) bg = "#e5484d";

              return (
                <div
                  key={square}
                  onClick={() => handleClick(r, c)}
                  className="relative flex items-center justify-center cursor-pointer"
                  style={{ backgroundColor: bg }}
                >
                  {cell && (
                    <span
                      className="text-[clamp(22px,8.5vw,36px)] leading-none"
                      style={cell.color === "w" ? whiteStyle : blackStyle}
                    >
                      {GLYPH[cell.type] + NO_EMOJI}
                    </span>
                  )}
                  {target && !cell && <div className="absolute w-1/3 h-1/3 rounded-full bg-black/25" />}
                  {target && cell && (
                    <div className="absolute inset-0.5 rounded-full border-4 border-black/30" />
                  )}
                  {c === 0 && (
                    <span className="absolute top-0 left-0.5 text-[8px] font-bold opacity-60 text-black">
                      {RANKS[r]}
                    </span>
                  )}
                  {r === 7 && (
                    <span className="absolute bottom-0 right-0.5 text-[8px] font-bold opacity-60 text-black">
                      {FILES[c]}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* bidak yg kamu makan */}
        <div className="min-h-5 mb-3">{renderEaten(eatenByMe, "b")}</div>

        <div className="flex gap-2">
          <button
            onClick={handleUndo}
            disabled={thinking || !history.length}
            className="flex-1 bg-zinc-700 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <Undo2 size={16} /> Undo
          </button>
          <button
            onClick={handleReset}
            className="flex-1 bg-zinc-600 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2"
          >
            <RotateCcw size={16} /> Reset
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// SHARED
// ==========================================
const rand = (n) => Math.floor(Math.random() * n);
const pick = (arr) => arr[rand(arr.length)];

function Shell({ title, onClose, tall, children }) {
  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-2">
      <div
        className={`bg-[#1c1c1e] border border-zinc-700 rounded-2xl w-full max-w-sm p-4 relative overflow-y-auto ${
          tall ? "h-[92vh]" : "max-h-[92vh]"
        }`}
      >
        <button onClick={onClose} className="absolute top-2 right-2 text-zinc-400 z-10">
          <X size={20} />
        </button>
        <h2 className="text-white font-bold text-center mb-1">{title}</h2>
        {children}
      </div>
    </div>
  );
}

const Btn = ({ children, className = "", ...p }) => (
  <button
    {...p}
    className={`w-full bg-zinc-600 text-white font-bold py-3 rounded-xl disabled:opacity-40 flex items-center justify-center gap-2 ${className}`}
  >
    {children}
  </button>
);

// ==========================================
// 2. UNO (kartu aksi: skip, balik arah, +2, wild, +4)
// ==========================================
const UNO_COLORS = ["merah", "biru", "hijau", "kuning"];
const UNO_BG = {
  merah: "bg-red-600",
  biru: "bg-blue-600",
  hijau: "bg-green-600",
  kuning: "bg-yellow-500",
  wild: "bg-gradient-to-br from-red-600 via-yellow-500 to-blue-600",
};
const UNO_NAMES = ["Kamu", "Budi", "Siti", "Joko"];
const UNO_DOT = { merah: "#dc2626", biru: "#2563eb", hijau: "#16a34a", kuning: "#eab308" };

function unoCard() {
  const r = Math.random();
  const color = pick(UNO_COLORS);
  if (r < 0.06) return { color: "wild", val: "wild" };
  if (r < 0.1) return { color: "wild", val: "+4" };
  if (r < 0.18) return { color, val: "skip" };
  if (r < 0.26) return { color, val: "rev" };
  if (r < 0.34) return { color, val: "+2" };
  return { color, val: rand(10) };
}
const unoLabel = (c) => ({ skip: "⊘", rev: "⇄", wild: "★" }[c.val] ?? String(c.val));
const unoPlayable = (c, top, color) => c.color === "wild" || c.color === color || c.val === top.val;
const unoNext = (p, dir, n = 1) => (((p + dir * n) % 4) + 4) % 4;

function unoInit() {
  let top = unoCard();
  while (typeof top.val !== "number") top = unoCard();
  return {
    hands: [0, 1, 2, 3].map(() => Array.from({ length: 7 }, () => unoCard())),
    top,
    color: top.color,
    turn: 0,
    dir: 1,
    drew: false,
    winner: null,
    msg: "Giliranmu! Cocokkan warna atau angka.",
  };
}

function unoPass(s, p, msg) {
  return { ...s, turn: unoNext(p, s.dir), drew: false, msg };
}

function unoPlay(s, p, idx, chosen) {
  const card = s.hands[p][idx];
  let hands = s.hands.map((h, i) => (i === p ? h.filter((_, k) => k !== idx) : h));
  let dir = s.dir;
  let steps = 1;
  const notes = [];
  const color = card.color === "wild" ? chosen : card.color;

  if (card.val === "rev") {
    dir = -dir;
    notes.push("arah berbalik");
  }
  const victim = unoNext(p, dir);
  if (card.val === "skip") {
    steps = 2;
    notes.push(`${UNO_NAMES[victim]} dilewati`);
  }
  if (card.val === "+2" || card.val === "+4") {
    const n = card.val === "+2" ? 2 : 4;
    const extra = Array.from({ length: n }, () => unoCard());
    hands = hands.map((h, i) => (i === victim ? [...h, ...extra] : h));
    steps = 2;
    notes.push(`${UNO_NAMES[victim]} ambil ${n} kartu`);
  }
  if (card.color === "wild") notes.push(`warna jadi ${color}`);

  const won = hands[p].length === 0;
  if (!won && hands[p].length === 1) notes.push("UNO! 🔥");
  const name = UNO_NAMES[p];
  let msg = `${name} main ${card.color === "wild" ? "" : card.color + " "}${unoLabel(card)}`;
  if (notes.length) msg += " — " + notes.join(", ");
  if (won) msg = p === 0 ? "KAMU MENANG! 🎉" : `${name} MENANG! 💀`;

  return {
    hands,
    top: card,
    color,
    dir,
    drew: false,
    winner: won ? p : null,
    turn: won ? p : unoNext(p, dir, steps),
    msg,
  };
}

function unoNpc(s) {
  const p = s.turn;
  const hand = s.hands[p];
  const bestColor = (h) => {
    const cnt = {};
    h.forEach((c) => {
      if (c.color !== "wild") cnt[c.color] = (cnt[c.color] || 0) + 1;
    });
    return Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a])[0] || pick(UNO_COLORS);
  };
  const ok = hand.map((c, i) => ({ c, i })).filter(({ c }) => unoPlayable(c, s.top, s.color));
  if (ok.length) {
    const plain = ok.filter(({ c }) => c.color !== "wild");
    const { i } = pick(plain.length ? plain : ok);
    return unoPlay(s, p, i, bestColor(hand.filter((_, k) => k !== i)));
  }
  const drawn = unoCard();
  const h2 = [...hand, drawn];
  const s2 = { ...s, hands: s.hands.map((h, k) => (k === p ? h2 : h)) };
  if (unoPlayable(drawn, s.top, s.color)) return unoPlay(s2, p, h2.length - 1, bestColor(hand));
  return unoPass(s2, p, `${UNO_NAMES[p]} ambil kartu & lewat.`);
}

export function GameUno({ onClose }) {
  const [s, setS] = useState(unoInit);
  const [wildIdx, setWildIdx] = useState(null);
  const myTurn = s.turn === 0 && s.winner === null;

  // giliran NPC
  useEffect(() => {
    if (s.turn === 0 || s.winner !== null) return;
    const t = setTimeout(
      () => setS((prev) => (prev.turn === 0 || prev.winner !== null ? prev : unoNpc(prev))),
      1200
    );
    return () => clearTimeout(t);
  }, [s.turn, s.winner]);

  const play = (i, chosen) => {
    setWildIdx(null);
    setS((prev) => unoPlay(prev, 0, i, chosen));
  };

  const onCard = (i) => {
    if (!myTurn) return;
    const c = s.hands[0][i];
    if (!unoPlayable(c, s.top, s.color)) return setS((p) => ({ ...p, msg: "Kartu tidak cocok!" }));
    if (c.color === "wild") return setWildIdx(i);
    play(i);
  };

  const draw = () => {
    if (!myTurn || s.drew) return;
    const card = unoCard();
    setS((prev) => {
      const s2 = { ...prev, hands: prev.hands.map((h, k) => (k === 0 ? [...h, card] : h)), drew: true };
      return unoPlayable(card, prev.top, prev.color)
        ? { ...s2, msg: "Kartu cocok! Mainkan atau lewati." }
        : unoPass(s2, 0, "Tidak ada yang cocok. Giliran lewat.");
    });
  };

  const reset = () => {
    setWildIdx(null);
    setS(unoInit());
  };

  return (
    <Shell title="Uno" onClose={onClose} tall>
      <div className="flex flex-col h-[calc(100%-1.75rem)]">
        <p className="text-xs text-center text-zinc-400 mb-3 min-h-8">{s.msg}</p>

        <div className="flex justify-between w-full mb-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className={`flex flex-col items-center ${s.turn === n ? "opacity-100" : "opacity-60"}`}>
              <div className="flex -space-x-4 h-10">
                {s.hands[n].slice(0, 8).map((_, j) => (
                  <div key={j} className="w-6 h-10 bg-zinc-700 border border-zinc-500 rounded-sm" />
                ))}
              </div>
              <span className={`text-[10px] mt-1 ${s.turn === n ? "text-yellow-400 font-bold" : "text-zinc-400"}`}>
                {UNO_NAMES[n]} ({s.hands[n].length})
              </span>
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center gap-4 mb-2">
          <div
            onClick={draw}
            className={`w-20 h-28 rounded-xl flex items-center justify-center text-white text-lg font-bold border-4 border-white shadow-lg bg-zinc-800 text-center leading-tight ${
              myTurn && !s.drew ? "cursor-pointer" : "opacity-40"
            }`}
          >
            Ambil
          </div>
          <div
            className={`w-20 h-28 rounded-xl flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg ${UNO_BG[s.color]}`}
          >
            {unoLabel(s.top)}
          </div>
        </div>
        <div className="flex justify-center items-center gap-2 text-xs text-zinc-400 mb-4">
          <span className="w-3 h-3 rounded-full" style={{ background: UNO_DOT[s.color] }} />
          warna aktif: {s.color} · arah {s.dir === 1 ? "↻" : "↺"}
        </div>

        {wildIdx !== null && (
          <div className="mb-3">
            <p className="text-xs text-center text-zinc-300 mb-2">Pilih warna:</p>
            <div className="grid grid-cols-4 gap-2">
              {UNO_COLORS.map((c) => (
                <button key={c} onClick={() => play(wildIdx, c)} className={`h-10 rounded-lg ${UNO_BG[c]}`} />
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-wrap content-end justify-center gap-2 pb-3">
          {s.hands[0].map((card, i) => {
            const ok = unoPlayable(card, s.top, s.color);
            return (
              <button
                key={i}
                onClick={() => onCard(i)}
                className={`w-12 h-[4.5rem] rounded-lg flex items-center justify-center text-white text-lg font-bold shadow-md border-2 border-white/50 ${
                  UNO_BG[card.color]
                } ${myTurn && !ok ? "opacity-40" : ""} ${myTurn && ok ? "-translate-y-1" : ""}`}
              >
                {unoLabel(card)}
              </button>
            );
          })}
        </div>

        {s.winner !== null ? (
          <Btn onClick={reset}>
            <RotateCcw size={16} /> Main lagi
          </Btn>
        ) : (
          myTurn &&
          s.drew && (
            <Btn onClick={() => setS((p) => unoPass(p, 0, "Kamu melewati giliran."))}>Lewati</Btn>
          )
        )}
      </div>
    </Shell>
  );
}

// ==========================================
// 3. ULAR TANGGA (papan benar + ular/tangga tergambar + dadu 6 = main lagi)
// ==========================================
const SNAKES = { 16: 6, 47: 26, 49: 11, 56: 53, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 98: 78 };
const LADDERS = { 1: 38, 4: 14, 9: 31, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 80: 100 };
const PLAYER_COLORS = ["bg-red-500", "bg-yellow-500", "bg-green-500", "bg-blue-500"];
const PLAYER_NAMES = ["Kamu", "Budi", "Siti", "Joko"];
const DICE = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

const cellXY = (n) => {
  const r = Math.floor((n - 1) / 10);
  const k = (n - 1) % 10;
  const col = r % 2 === 0 ? k : 9 - k;
  return { x: col * 10 + 5, y: (9 - r) * 10 + 5 };
};

function snakeInit() {
  return { pos: [0, 0, 0, 0], turn: 0, winner: null, msg: "Lempar dadu untuk mulai!", id: 0 };
}

function applyRoll(s, d) {
  const p = s.turn;
  let np = s.pos[p] + d;
  if (np > 100) np = 200 - np; // mantul kalau lewat 100
  let note = `jalan ke ${np}`;
  if (SNAKES[np]) {
    note = `kena ular di ${np}, turun ke ${SNAKES[np]} 🐍`;
    np = SNAKES[np];
  } else if (LADDERS[np]) {
    note = `naik tangga di ${np} ke ${LADDERS[np]} 🪜`;
    np = LADDERS[np];
  }
  const pos = s.pos.map((v, i) => (i === p ? np : v));
  const won = np === 100;
  const extra = d === 6 && !won;
  let msg = `${PLAYER_NAMES[p]} dapat ${d}, ${note}.`;
  if (extra) msg += " Dadu 6, main lagi!";
  if (won) msg = p === 0 ? "KAMU MENANG! 🎉" : `${PLAYER_NAMES[p]} MENANG! 💀`;
  return { pos, winner: won ? p : null, turn: won || extra ? p : (p + 1) % 4, msg, id: s.id + 1 };
}

export function GameUlarTangga({ onClose }) {
  const [s, setS] = useState(snakeInit);
  const [dice, setDice] = useState(0);
  const [rolling, setRolling] = useState(false);
  const ids = useRef([]);

  useEffect(
    () => () =>
      ids.current.forEach((i) => {
        clearTimeout(i);
        clearInterval(i);
      }),
    []
  );

  const roll = (cb) => {
    setRolling(true);
    let n = 0;
    const iv = setInterval(() => {
      setDice(rand(6) + 1);
      if (++n >= 6) {
        clearInterval(iv);
        const d = rand(6) + 1;
        setDice(d);
        setRolling(false);
        cb(d);
      }
    }, 90);
    ids.current.push(iv);
  };

  const rollFor = () => {
    const id = s.id;
    roll((d) => setS((prev) => (prev.id === id ? applyRoll(prev, d) : prev)));
  };

  // giliran NPC
  useEffect(() => {
    if (s.turn === 0 || s.winner !== null) return;
    const t = setTimeout(rollFor, 800);
    ids.current.push(t);
    return () => clearTimeout(t);
  }, [s.id]);

  const reset = () => {
    setDice(0);
    setS((p) => ({ ...snakeInit(), id: p.id + 1000 }));
  };

  const cells = [];
  for (let v = 0; v < 10; v++) {
    const r = 9 - v;
    for (let c = 0; c < 10; c++) cells.push({ num: r * 10 + (r % 2 === 0 ? c : 9 - c) + 1, dark: (r + c) % 2 === 0 });
  }

  return (
    <Shell title="Ular Tangga" onClose={onClose} tall>
      <p className="text-xs text-center text-zinc-400 mb-3 min-h-8">{s.msg}</p>

      <div className="relative grid grid-cols-10 w-full aspect-square border-2 border-zinc-700 bg-zinc-800 mb-3">
        {cells.map(({ num, dark }) => (
          <div
            key={num}
            className={`relative flex items-start justify-start p-px text-[7px] text-zinc-500 border border-zinc-700/50 ${
              dark ? "bg-zinc-800" : "bg-zinc-900"
            }`}
          >
            {num}
            <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-0.5 p-0.5">
              {s.pos.map((pp, idx) =>
                pp === num ? (
                  <div key={idx} className={`w-2.5 h-2.5 rounded-full border border-black ${PLAYER_COLORS[idx]}`} />
                ) : null
              )}
            </div>
          </div>
        ))}

        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
          {Object.entries(LADDERS).map(([a, b]) => {
            const p1 = cellXY(+a);
            const p2 = cellXY(+b);
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const len = Math.hypot(dx, dy) || 1;
            const nx = (-dy / len) * 1.3;
            const ny = (dx / len) * 1.3;
            return (
              <g key={"l" + a} stroke="#4ade80" strokeWidth="0.6" strokeLinecap="round" opacity="0.85">
                <line x1={p1.x + nx} y1={p1.y + ny} x2={p2.x + nx} y2={p2.y + ny} />
                <line x1={p1.x - nx} y1={p1.y - ny} x2={p2.x - nx} y2={p2.y - ny} />
                {[0.2, 0.4, 0.6, 0.8].map((t) => (
                  <line
                    key={t}
                    x1={p1.x + nx + dx * t}
                    y1={p1.y + ny + dy * t}
                    x2={p1.x - nx + dx * t}
                    y2={p1.y - ny + dy * t}
                  />
                ))}
              </g>
            );
          })}
          {Object.entries(SNAKES).map(([a, b]) => {
            const h = cellXY(+a);
            const t = cellXY(+b);
            const mx = (h.x + t.x) / 2 + (h.y > t.y ? 6 : -6);
            const my = (h.y + t.y) / 2;
            return (
              <g key={"s" + a}>
                <path
                  d={`M${h.x} ${h.y} Q${mx} ${my} ${t.x} ${t.y}`}
                  fill="none"
                  stroke="#f87171"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  opacity="0.8"
                />
                <circle cx={h.x} cy={h.y} r="2" fill="#ef4444" />
              </g>
            );
          })}
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        {PLAYER_NAMES.map((name, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 text-xs ${
              s.turn === i && s.winner === null ? "text-yellow-400 font-bold" : "text-zinc-300"
            }`}
          >
            <div className={`w-3 h-3 rounded-full ${PLAYER_COLORS[i]}`} />
            {name} ({s.pos[i] === 0 ? "start" : s.pos[i]})
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-3">
        <span className="text-zinc-400 text-sm">Dadu:</span>
        <span className={`text-4xl text-white ${rolling ? "opacity-70" : ""}`}>{dice === 0 ? "🎲" : DICE[dice - 1]}</span>
      </div>

      {s.winner !== null ? (
        <Btn onClick={reset}>
          <RotateCcw size={16} /> Main lagi
        </Btn>
      ) : (
        <Btn disabled={s.turn !== 0 || rolling} onClick={rollFor}>
          {s.turn === 0 ? "Lempar Dadu" : `Giliran ${PLAYER_NAMES[s.turn]}...`}
        </Btn>
      )}
    </Shell>
  );
}

// ==========================================
// 4. WHO'S THE SPY (versi "undercover": kamu tidak tahu kamu spy atau bukan)
// ==========================================
const SPY_PAIRS = [
  { civ: "Apel", spy: "Mangga", ch: ["merah", "renyah", "bulat", "dingin"], sh: ["kuning", "tropis", "berserat", "lonjong"] },
  { civ: "Kucing", spy: "Anjing", ch: ["mengeong", "licin", "tidur", "ikan"], sh: ["menggonggong", "setia", "tulang", "dilatih"] },
  { civ: "Mobil", spy: "Motor", ch: ["pintu", "empat roda", "atap", "AC"], sh: ["helm", "dua roda", "knalpot", "gas"] },
  { civ: "Pesawat", spy: "Helikopter", ch: ["bandara", "sayap", "tiket", "landasan"], sh: ["baling-baling", "helipad", "vertikal", "berisik"] },
  { civ: "Buku", spy: "Majalah", ch: ["novel", "tebal", "perpustakaan", "bab"], sh: ["sampul", "bulanan", "iklan", "glossy"] },
  { civ: "Kopi", spy: "Teh", ch: ["pahit", "kafein", "espresso", "biji"], sh: ["daun", "kantong", "hangat", "melati"] },
  { civ: "Sepatu", spy: "Sandal", ch: ["tali", "kaos kaki", "tertutup", "olahraga"], sh: ["jepit", "santai", "terbuka", "masjid"] },
  { civ: "Pizza", spy: "Burger", ch: ["Italia", "keju", "oven", "irisan"], sh: ["roti", "patty", "drive-thru", "saus"] },
];
const SPY_NAMES = ["Kamu", "Budi", "Siti", "Joko", "Rina", "Dewi"];

function spyInit() {
  const pair = pick(SPY_PAIRS);
  const spyIdx = rand(6);
  const taken = new Set();
  const players = SPY_NAMES.map((name, i) => {
    const isSpy = i === spyIdx;
    const list = isSpy ? pair.sh : pair.ch;
    let hint = null;
    if (i !== 0) {
      const opts = list.filter((h) => !taken.has(h));
      hint = pick(opts.length ? opts : list);
      taken.add(hint);
    }
    return { name, isSpy, word: isSpy ? pair.spy : pair.civ, list, hint };
  });
  return { players, phase: "reveal", result: null };
}

function spyVotes(players, myVote) {
  const votes = new Array(6).fill(0);
  const cast = [myVote];
  votes[myVote]++;
  for (let i = 1; i < 6; i++) {
    let best = -1;
    let bs = -1;
    for (let j = 0; j < 6; j++) {
      if (j === i) continue;
      const fits = players[i].list.includes(players[j].hint);
      const score = (fits ? 0 : 1) + Math.random() * 0.9;
      if (score > bs) {
        bs = score;
        best = j;
      }
    }
    votes[best]++;
    cast[i] = best;
  }
  const max = Math.max(...votes);
  const top = votes.map((v, i) => (v === max ? i : -1)).filter((i) => i >= 0);
  return { votes, cast, out: pick(top) };
}

export function GameSpy({ onClose }) {
  const [g, setG] = useState(spyInit);
  const me = g.players[0];

  const chooseHint = (h) =>
    setG((p) => ({ ...p, phase: "vote", players: p.players.map((pl, i) => (i === 0 ? { ...pl, hint: h } : pl)) }));
  const vote = (j) => setG((p) => ({ ...p, phase: "result", result: spyVotes(p.players, j) }));

  const spyIdx = g.players.findIndex((p) => p.isSpy);
  const r = g.result;
  const spyOut = r ? r.out === spyIdx : false;
  const iWin = r ? (me.isSpy ? !spyOut : spyOut) : false;

  return (
    <Shell title="Who's The Spy?" onClose={onClose}>
      {g.phase === "reveal" && (
        <div className="text-center space-y-4 mt-3">
          <p className="text-zinc-400 text-sm">
            Ada 1 spy yang kata rahasianya mirip tapi beda. Kamu tidak tahu kamu spy atau bukan.
          </p>
          <div className="bg-[#0f0a15] border border-zinc-700 rounded-xl p-4">
            <p className="text-xs text-zinc-500 mb-2">Kata rahasiamu:</p>
            <p className="text-3xl font-bold text-white">{me.word}</p>
          </div>
          <Btn onClick={() => setG((p) => ({ ...p, phase: "hint" }))}>Lanjut kasih petunjuk</Btn>
        </div>
      )}

      {g.phase === "hint" && (
        <div className="space-y-3 mt-3">
          <p className="text-center text-sm text-zinc-400">
            Katamu: <span className="text-white font-bold">{me.word}</span>. Pilih satu petunjuk, jangan terlalu jelas!
          </p>
          <div className="grid grid-cols-2 gap-2">
            {me.list.map((h) => (
              <button
                key={h}
                onClick={() => chooseHint(h)}
                className="bg-[#0f0a15] border border-zinc-700 text-white p-3 rounded-xl"
              >
                {h}
              </button>
            ))}
          </div>
        </div>
      )}

      {g.phase === "vote" && (
        <div className="space-y-2 mt-3">
          <p className="text-center text-sm text-zinc-400 mb-1">Siapa yang petunjuknya mencurigakan?</p>
          <div className="bg-[#0f0a15] border border-zinc-700 rounded-xl p-2 text-xs text-zinc-300 text-center mb-2">
            Kamu: <span className="text-white font-bold">{me.hint}</span>
          </div>
          {g.players.slice(1).map((pl, k) => (
            <button
              key={pl.name}
              onClick={() => vote(k + 1)}
              className="w-full flex justify-between items-center bg-[#0f0a15] border border-zinc-700 text-white px-4 py-3 rounded-xl"
            >
              <span>{pl.name}</span>
              <span className="text-zinc-400 text-sm">"{pl.hint}"</span>
            </button>
          ))}
        </div>
      )}

      {g.phase === "result" && r && (
        <div className="space-y-3 mt-3">
          <div className="text-center">
            <Trophy size={40} className={`mx-auto mb-1 ${iWin ? "text-yellow-500" : "text-zinc-600"}`} />
            <p className="text-white font-bold">{iWin ? "Kamu menang! 🎉" : "Kamu kalah 💀"}</p>
            <p className="text-xs text-zinc-400 mt-1">
              {g.players[r.out].name} tersingkir
              {spyOut ? " — dia memang SPY." : ` — ternyata warga. Spy-nya ${g.players[spyIdx].name}.`}
            </p>
            {me.isSpy && <p className="text-xs text-zinc-400">Kamu adalah spy.</p>}
          </div>
          <div className="bg-[#0f0a15] border border-zinc-700 rounded-xl divide-y divide-zinc-800">
            {g.players.map((pl, i) => (
              <div key={pl.name} className="flex items-center justify-between px-3 py-2 text-xs">
                <span className={`font-bold ${i === r.out ? "text-red-400" : "text-white"}`}>
                  {pl.name} {pl.isSpy ? "🕵️" : ""}
                </span>
                <span className="text-zinc-400">
                  {pl.word} · "{pl.hint}" · {r.votes[i]} suara
                </span>
              </div>
            ))}
          </div>
          <Btn onClick={() => setG(spyInit())}>
            <RotateCcw size={16} /> Main lagi
          </Btn>
        </div>
      )}
    </Shell>
  );
}

// ==========================================
// 5. TIC TAC TOE (Bo10, level easy/medium/hard, mulai bergantian)
// ==========================================
const TTT_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function tttCheck(b) {
  for (const l of TTT_LINES) if (b[l[0]] && b[l[0]] === b[l[1]] && b[l[0]] === b[l[2]]) return { w: b[l[0]], line: l };
  return b.includes(null) ? null : { w: "Draw", line: [] };
}

function tttMinimax(b, isO, depth) {
  const r = tttCheck(b);
  if (r) return r.w === "O" ? 10 - depth : r.w === "X" ? depth - 10 : 0;
  let best = isO ? -Infinity : Infinity;
  for (let i = 0; i < 9; i++) {
    if (b[i]) continue;
    b[i] = isO ? "O" : "X";
    const sc = tttMinimax(b, !isO, depth + 1);
    b[i] = null;
    best = isO ? Math.max(best, sc) : Math.min(best, sc);
  }
  return best;
}

function tttMove(b, level) {
  const empty = b.map((v, i) => (v ? null : i)).filter((v) => v !== null);
  if (level === "easy") return pick(empty);
  if (level !== "hard") {
    const find = (mark) =>
      empty.find((i) => {
        const t = [...b];
        t[i] = mark;
        return tttCheck(t)?.w === mark;
      });
    const w = find("O");
    if (w !== undefined) return w;
    const bl = find("X");
    if (bl !== undefined) return bl;
    if (b[4] === null && Math.random() < 0.7) return 4;
    return pick(empty);
  }
  if (empty.length === 9) return pick([0, 2, 4, 6, 8]);
  let bestS = -Infinity;
  let bests = [];
  empty.forEach((i) => {
    const t = [...b];
    t[i] = "O";
    const sc = tttMinimax(t, false, 1);
    if (sc > bestS) {
      bestS = sc;
      bests = [i];
    } else if (sc === bestS) bests.push(i);
  });
  return pick(bests);
}

const tttInit = () => ({
  board: Array(9).fill(null),
  turn: "X",
  round: 1,
  scores: { x: 0, o: 0, d: 0 },
  result: null,
  line: [],
  final: false,
});

function tttPlace(s, i, mark) {
  const board = [...s.board];
  board[i] = mark;
  const r = tttCheck(board);
  if (!r) return { ...s, board, turn: mark === "X" ? "O" : "X" };
  const scores = { ...s.scores };
  if (r.w === "X") scores.x++;
  else if (r.w === "O") scores.o++;
  else scores.d++;
  return { ...s, board, scores, result: r.w, line: r.line };
}

export function GameTicTacToe({ level = "medium", onClose }) {
  const [s, setS] = useState(tttInit);

  // giliran NPC
  useEffect(() => {
    if (s.turn !== "O" || s.result || s.final) return;
    const t = setTimeout(
      () =>
        setS((p) => (p.turn !== "O" || p.result || p.final ? p : tttPlace(p, tttMove(p.board, level), "O"))),
      500
    );
    return () => clearTimeout(t);
  }, [s.turn, s.result, s.final, s.round]);

  // lanjut ronde berikutnya
  useEffect(() => {
    if (!s.result || s.final) return;
    const t = setTimeout(
      () =>
        setS((p) =>
          p.round >= 10
            ? { ...p, final: true }
            : {
                ...p,
                board: Array(9).fill(null),
                round: p.round + 1,
                turn: (p.round + 1) % 2 === 1 ? "X" : "O", // ronde ganjil kamu mulai
                result: null,
                line: [],
              }
        ),
      1500
    );
    return () => clearTimeout(t);
  }, [s.result, s.final, s.round]);

  const click = (i) => {
    if (s.board[i] || s.result || s.turn !== "X" || s.final) return;
    setS((p) => (p.board[i] || p.result || p.turn !== "X" ? p : tttPlace(p, i, "X")));
  };

  let msg;
  if (s.result === "X") msg = "Kamu menang ronde ini!";
  else if (s.result === "O") msg = "NPC menang ronde ini!";
  else if (s.result === "Draw") msg = "Seri!";
  else msg = s.turn === "X" ? "Giliranmu (X)" : "NPC mikir...";

  const { x, o, d } = s.scores;
  const verdict = x > o ? "Kamu menang! 🎉" : x < o ? "NPC menang 💀" : "Seri keseluruhan!";

  return (
    <Shell title={`Tic Tac Toe (Bo10) · ${level}`} onClose={onClose}>
      <div className="flex justify-between text-sm text-zinc-300 mb-2 px-2 mt-2">
        <span>Kamu: {x}</span>
        <span>
          Ronde {s.round}/10 · seri {d}
        </span>
        <span>NPC: {o}</span>
      </div>
      <p className="text-xs text-center text-zinc-400 mb-3 h-4">{s.final ? "Game selesai" : msg}</p>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {s.board.map((cell, i) => (
          <button
            key={i}
            onClick={() => click(i)}
            className={`w-full aspect-square border rounded-xl text-4xl font-bold flex items-center justify-center ${
              s.line.includes(i) ? "bg-green-900/40 border-green-500" : "bg-[#0f0a15] border-zinc-700"
            }`}
          >
            <span className={cell === "X" ? "text-zinc-300" : "text-red-500"}>{cell}</span>
          </button>
        ))}
      </div>

      {s.final && (
        <div className="text-center space-y-3">
          <Trophy size={40} className="mx-auto text-yellow-500" />
          <p className="text-white font-bold">
            {verdict} ({x} - {o}, seri {d})
          </p>
          <Btn onClick={() => setS(tttInit())}>
            <RotateCcw size={16} /> Main lagi
          </Btn>
        </div>
      )}
    </Shell>
  );
}
