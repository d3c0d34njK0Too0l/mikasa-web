"use client";
import { useState, useEffect, useRef } from "react";
import { Award, RotateCcw, Undo2, X, User } from "lucide-react";
import { Chess } from "chess.js";

const isOver = (g) => (g.isGameOver ? g.isGameOver() : g.game_over());
const isMate = (g) => (g.isCheckmate ? g.isCheckmate() : g.in_checkmate());
const isCheck = (g) => (g.isCheck ? g.isCheck() : g.in_check());
const VAL = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

const PST = {
  p: [[0,0,0,0,0,0,0,0],[50,50,50,50,50,50,50,50],[10,10,20,30,30,20,10,10],[5,5,10,25,25,10,5,5],[0,0,0,20,20,0,0,0],[5,-5,-10,0,0,-10,-5,5],[5,10,10,-20,-20,10,10,5],[0,0,0,0,0,0,0,0]],
  n: [[-50,-40,-30,-30,-30,-30,-40,-50],[-40,-20,0,0,0,0,-20,-40],[-30,0,10,15,15,10,0,-30],[-30,5,15,20,20,15,5,-30],[-30,0,15,20,20,15,0,-30],[-30,5,10,15,15,10,5,-30],[-40,-20,0,5,5,0,-20,-40],[-50,-40,-30,-30,-30,-30,-40,-50]],
  b: [[-20,-10,-10,-10,-10,-10,-10,-20],[-10,0,0,0,0,0,0,-10],[-10,0,5,10,10,5,0,-10],[-10,5,5,10,10,5,5,-10],[-10,0,10,10,10,10,0,-10],[-10,10,10,10,10,10,10,-10],[-10,5,0,0,0,0,5,-10],[-20,-10,-10,-10,-10,-10,-10,-20]],
  r: [[0,0,0,0,0,0,0,0],[5,10,10,10,10,10,10,5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[0,0,0,5,5,0,0,0]],
  q: [[-20,-10,-10,-5,-5,-10,-10,-20],[-10,0,0,0,0,0,0,-10],[-10,0,5,5,5,5,0,-10],[-5,0,5,5,5,5,0,-5],[0,0,5,5,5,5,0,-5],[-10,5,5,5,5,5,0,-10],[-10,0,5,0,0,0,0,-10],[-20,-10,-10,-5,-5,-10,-10,-20]],
  k: [[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-20,-30,-30,-40,-40,-30,-30,-20],[-10,-20,-20,-20,-20,-20,-20,-10],[20,20,0,0,0,0,20,20],[20,30,10,0,0,10,30,20]],
};

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

function negamax(g, depth, alpha, beta) {
  if (isOver(g)) {
    if (isMate(g)) return -99999 - depth;
    return 0;
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
  const g = new Chess(game.fen());
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

export function chooseNpcMove(game, level) {
  const moves = game.moves({ verbose: true });
  if (!moves.length) return null;
  if (level === "easy") {
    if (Math.random() < 0.6) return moves[Math.floor(Math.random() * moves.length)];
    return pickBestMove(game, 1, 30);
  }
  if (level === "medium") return pickBestMove(game, 2, 15);
  return pickBestMove(game, 3, 0);
}

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1];
const GLYPH = { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" };
const NO_EMOJI = "\uFE0E";

const whiteStyle = { color: "#fff", textShadow: "0 0 2px #000, 0 0 2px #000, 0 1px 2px #000" };
const blackStyle = { color: "#111", textShadow: "0 0 1px rgba(255,255,255,.35)" };

export function GameCatur({ level = "easy", onClose, mode = "npc", myColor = "w", serverFen = null, serverLast = null, onMove = null, opponentName = "NPC", onWin = null }) {
  const chessRef = useRef(new Chess(serverFen || undefined));
  const [fen, setFen] = useState(serverFen || chessRef.current.fen());
  const [selected, setSelected] = useState(null);
  const [thinking, setThinking] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  useEffect(() => {
    if (serverFen && serverFen !== chessRef.current.fen()) {
      const g = new Chess();
      if (g.load(serverFen)) {
        chessRef.current = g;
        setFen(serverFen);
        setSelected(null);
      }
    }
  }, [serverFen]);

  const g = chessRef.current;
  const board = g.board();
  const over = isOver(g);
  const turn = g.turn();
  const history = g.history({ verbose: true });
  const last = serverLast || history[history.length - 1];

  const myTurn = mode === "pvp" ? turn === myColor : turn === "w";
  const legal = selected ? g.moves({ square: selected, verbose: true }) : [];
  const legalMap = {};
  legal.forEach((m) => (legalMap[m.to] = m));

  let checkSquare = null;
  if (isCheck(g)) {
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++) {
        const cell = board[r][c];
        if (cell && cell.type === "k" && cell.color === turn) checkSquare = FILES[c] + RANKS[r];
      }
  }

  const eatenByMe = history.filter((m) => m.color === (mode === "pvp" ? myColor : "w") && m.captured).map((m) => m.captured);
  const eatenByNpc = history.filter((m) => m.color === (mode === "pvp" ? (myColor === "w" ? "b" : "w") : "b") && m.captured).map((m) => m.captured);

  let status;
  if (over) {
    if (isMate(g)) {
      if (mode === "pvp") status = turn === myColor ? "Checkmate! You lose." : "Checkmate! You win.";
      else status = turn === "b" ? "Checkmate! You win." : "Checkmate! You lose.";
      
      if ((mode === "npc" && turn === "b") || (mode === "pvp" && turn !== myColor)) {
        if (!hasWon) { setHasWon(true); if (onWin) onWin(); }
      }
    } else status = "Draw!";
  } else if (mode === "npc" && (thinking || turn === "b")) status = "NPC is thinking...";
  else if (!myTurn && mode === "pvp") status = `Waiting for ${opponentName}...`;
  else if (checkSquare) status = "Check! Save your king.";
  else status = mode === "pvp" ? `Your turn (${myColor === "w" ? "White" : "Black"})` : "Your turn (White)";

  useEffect(() => {
    if (mode !== "npc" || over) return;
    const game = chessRef.current;
    if (game.turn() !== "b") return;
    setThinking(true);
    const timer = setTimeout(() => {
      const move = chooseNpcMove(game, level);
      if (move) game.move(toMove(move));
      setThinking(false);
      setFen(game.fen());
      if (onMove) onMove({ from: move.from, to: move.to, promotion: move.promotion || "q", fen: game.fen() });
    }, 450);
    return () => { clearTimeout(timer); setThinking(false); };
  }, [fen, level, mode, over]);

  const handleClick = (r, c) => {
    if (over || !myTurn || thinking) return;
    const square = FILES[c] + RANKS[r];
    const piece = g.get(square);

    if (selected) {
      if (square === selected) return setSelected(null);
      if (piece && piece.color === turn) return setSelected(square);
      if (legalMap[square]) {
        try {
          const moveObj = { from: selected, to: square, promotion: "q" };
          const result = g.move(moveObj);
          setFen(g.fen());
          if (onMove && result) onMove({ from: selected, to: square, promotion: "q", fen: g.fen() });
        } catch (e) {}
      }
      return setSelected(null);
    }
    if (piece && piece.color === turn) setSelected(square);
  };

  const handleReset = () => {
    chessRef.current = new Chess();
    setSelected(null);
    setHasWon(false);
    setFen(chessRef.current.fen());
    if (onMove) onMove({ reset: true });
  };

  const handleUndo = () => {
    if (mode === "pvp" || thinking || !history.length) return;
    g.undo();
    if (g.turn() === "b") g.undo();
    setSelected(null);
    setFen(g.fen());
  };

  const renderEaten = (list, color) => (
    <div className="flex h-5 items-center gap-0.5 text-base leading-none">
      {list.map((t, i) => (<span key={i} style={color === "w" ? whiteStyle : blackStyle}>{GLYPH[t] + NO_EMOJI}</span>))}
    </div>
  );

  return (
    <div className="w-full">
      <p className="text-xs text-center text-zinc-400 mb-2 h-4">{status}</p>
      <div className="min-h-5 mb-1">{renderEaten(eatenByNpc, mode === "pvp" ? (myColor === "w" ? "b" : "w") : "w")}</div>
      
      <div className="w-full aspect-square mb-1 rounded-md overflow-hidden border-2 border-zinc-600 select-none grid grid-cols-8">
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
              <div key={square} onClick={() => handleClick(r, c)} className="relative flex items-center justify-center cursor-pointer aspect-square" style={{ backgroundColor: bg }}>
                {cell && <span className="text-[clamp(22px,8.5vw,36px)] leading-none" style={cell.color === "w" ? whiteStyle : blackStyle}>{GLYPH[cell.type] + NO_EMOJI}</span>}
                {target && !cell && <div className="absolute w-1/3 h-1/3 rounded-full bg-black/25" />}
                {target && cell && <div className="absolute inset-0.5 rounded-full border-4 border-black/30" />}
                {c === 0 && <span className="absolute top-0 left-0.5 text-[8px] font-bold opacity-60 text-black">{RANKS[r]}</span>}
                {r === 7 && <span className="absolute bottom-0 right-0.5 text-[8px] font-bold opacity-60 text-black">{FILES[c]}</span>}
              </div>
            );
          })
        )}
      </div>

      <div className="min-h-5 mb-3">{renderEaten(eatenByMe, mode === "pvp" ? myColor : "b")}</div>
      <div className="flex gap-2">
        {mode === "npc" && (
          <button onClick={handleUndo} disabled={thinking || !history.length} className="flex-1 bg-zinc-700 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-40">
            <Undo2 size={16} /> Undo
          </button>
        )}
        <button onClick={handleReset} className="flex-1 bg-zinc-600 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2">
          <RotateCcw size={16} /> Reset
        </button>
      </div>
    </div>
  );
}

const rand = (n) => Math.floor(Math.random() * n);
const pick = (arr) => arr[rand(arr.length)];

const NPC_NAMES = ["Alex", "John", "Sarah", "David", "Emma", "Michael", "Sophia", "James", "Olivia", "Daniel", "Isabella", "William", "Mia", "Lucas", "Charlotte"];
const getNpcName = () => pick(NPC_NAMES);

const Btn = ({ children, className = "", ...p }) => (
  <button {...p} className={`w-full bg-zinc-600 text-white font-bold py-3 rounded-xl disabled:opacity-40 flex items-center justify-center gap-2 ${className}`}>
    {children}
  </button>
);

const UNO_COLORS = ["Red", "Blue", "Green", "Yellow"];
const UNO_BG = { Red: "bg-red-600", Blue: "bg-blue-600", Green: "bg-green-600", Yellow: "bg-yellow-500", Wild: "bg-gradient-to-br from-red-600 via-yellow-500 to-blue-600" };
const UNO_DOT = { Red: "#dc2626", Blue: "#2563eb", Green: "#16a34a", Yellow: "#eab308" };

function unoCard() {
  const r = Math.random();
  const color = pick(UNO_COLORS);
  if (r < 0.06) return { color: "Wild", val: "Wild" };
  if (r < 0.1) return { color: "Wild", val: "+4" };
  if (r < 0.18) return { color, val: "Skip" };
  if (r < 0.26) return { color, val: "Reverse" };
  if (r < 0.34) return { color, val: "+2" };
  return { color, val: rand(10) };
}
const unoLabel = (c) => ({ Skip: "SKIP", Reverse: "REV", Wild: "WILD" }[c.val] ?? String(c.val));
const unoPlayable = (c, top, color) => c.color === "Wild" || c.color === color || c.val === top.val;
const unoNext = (p, dir, n = 1) => (((p + dir * n) % 4) + 4) % 4;

export function unoInit() {
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
    msg: "Your turn! Match the color or number.",
    npcNames: [getNpcName(), getNpcName(), getNpcName()]
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
  const color = card.color === "Wild" ? chosen : card.color;
  if (card.val === "Reverse") { dir = -dir; notes.push("direction reversed"); }
  const victim = unoNext(p, dir);
  if (card.val === "Skip") { steps = 2; notes.push(`skipped`); }
  if (card.val === "+2" || card.val === "+4") {
    const n = card.val === "+2" ? 2 : 4;
    const extra = Array.from({ length: n }, () => unoCard());
    hands = hands.map((h, i) => (i === victim ? [...h, ...extra] : h));
    steps = 2;
    notes.push(`draw ${n} cards`);
  }
  if (card.color === "Wild") notes.push(`color changed to ${color}`);
  const won = hands[p].length === 0;
  if (!won && hands[p].length === 1) notes.push("UNO!");
  
  let msg = `Played ${card.color === "Wild" ? "" : card.color + " "}${unoLabel(card)}`;
  if (notes.length) msg += " - " + notes.join(", ");
  if (won) msg = p === 0 ? "YOU WIN!" : `WINNER!`;
  
  return { hands, top: card, color, dir, drew: false, winner: won ? p : null, turn: won ? p : unoNext(p, dir, steps), msg };
}

export function GameUno({ onClose, mode = "npc", mySeat = 0, serverState = null, onMove = null, opponentName = "NPC", onWin = null }) {
  const [s, setS] = useState(() => serverState || unoInit());
  const [wildIdx, setWildIdx] = useState(null);
  const [hasWon, setHasWon] = useState(false);

  useEffect(() => {
    if (serverState) setS(serverState);
  }, [serverState]);

  useEffect(() => {
    if (s.winner === 0 && !hasWon) { setHasWon(true); if (onWin) onWin(); }
  }, [s.winner, hasWon, onWin]);

  const myTurn = s.turn === mySeat && s.winner === null;

  useEffect(() => {
    if (mode !== "npc" || s.winner !== null) return;
    if (s.turn === 0) return;
    const t = setTimeout(() => {
      setS((prev) => {
        if (prev.turn === 0 || prev.winner !== null) return prev;
        const p = prev.turn;
        const hand = prev.hands[p];
        const ok = hand.map((c, i) => ({ c, i })).filter(({ c }) => unoPlayable(c, prev.top, prev.color));
        if (ok.length) {
          const plain = ok.filter(({ c }) => c.color !== "Wild");
          const { i, c } = pick(plain.length ? plain : ok);
          const chosen = c.color === "Wild" ? pick(UNO_COLORS) : null;
          return unoPlay(prev, p, i, chosen);
        }
        const drawn = unoCard();
        const h2 = [...hand, drawn];
        const s2 = { ...prev, hands: prev.hands.map((h, k) => (k === p ? h2 : h)) };
        if (unoPlayable(drawn, prev.top, prev.color)) {
          return unoPlay(s2, p, h2.length - 1, drawn.color === "Wild" ? pick(UNO_COLORS) : null);
        }
        return unoPass(s2, p, `drew a card & passed.`);
      });
    }, 1200);
    return () => clearTimeout(t);
  }, [s.turn, s.winner, mode]);

  const play = (i, chosen) => {
    setWildIdx(null);
    const next = unoPlay(s, mySeat, i, chosen);
    setS(next);
    if (onMove) onMove(next);
  };

  const onCard = (i) => {
    if (!myTurn) return;
    const c = s.hands[mySeat][i];
    if (!unoPlayable(c, s.top, s.color)) return setS((p) => ({ ...p, msg: "Invalid card!" }));
    if (c.color === "Wild") return setWildIdx(i);
    play(i);
  };

  const draw = () => {
    if (!myTurn || s.drew) return;
    const card = unoCard();
    const s2 = { ...s, hands: s.hands.map((h, k) => (k === mySeat ? [...h, card] : h)), drew: true };
    const next = unoPlayable(card, s.top, s.color) ? { ...s2, msg: "Card matches! Play it or pass." } : unoPass(s2, mySeat, "No match. Turn passed.");
    setS(next);
    if (onMove) onMove(next);
  };

  const reset = () => {
    setWildIdx(null);
    setHasWon(false);
    const next = unoInit();
    setS(next);
    if (onMove) onMove(next);
  };

  const displaySeats = mode === "pvp" ? [0, 1] : [1, 2, 3];

  return (
    <div className="w-full flex flex-col h-full">
      <p className="text-xs text-center text-zinc-400 mb-3 min-h-8">{s.msg}</p>
      <div className="flex justify-between w-full mb-4">
        {displaySeats.map((n) => (
          <div key={n} className={`flex flex-col items-center ${s.turn === n ? "opacity-100" : "opacity-60"}`}>
            <div className="w-10 h-10 rounded-full border-2 border-zinc-700 bg-zinc-800 flex items-center justify-center mb-2 overflow-hidden">
              {mode === "pvp" ? <User size={20} className="text-zinc-400" /> : <User size={20} className="text-zinc-500" />}
            </div>
            <div className="flex -space-x-4 h-10">
              {s.hands[n].slice(0, 8).map((_, j) => (<div key={j} className="w-6 h-10 bg-zinc-700 border border-zinc-500 rounded-sm" />))}
            </div>
            <span className={`text-[10px] mt-1 ${s.turn === n ? "text-yellow-400 font-bold" : "text-zinc-400"}`}>
              {mode === "pvp" ? `Opponent (${s.hands[n].length})` : `${s.npcNames ? s.npcNames[n-1] : "NPC"} (${s.hands[n].length})`}
            </span>
          </div>
        ))}
      </div>
      <div className="flex justify-center items-center gap-4 mb-2">
        <div onClick={draw} className={`w-20 h-28 rounded-xl flex items-center justify-center text-white text-lg font-bold border-4 border-white shadow-lg bg-zinc-800 text-center leading-tight ${myTurn && !s.drew ? "cursor-pointer" : "opacity-40"}`}>Draw</div>
        <div className={`w-20 h-28 rounded-xl flex items-center justify-center text-white text-lg font-bold border-4 border-white shadow-lg ${UNO_BG[s.color]} text-center leading-tight`}>{unoLabel(s.top)}</div>
      </div>
      <div className="flex justify-center items-center gap-2 text-xs text-zinc-400 mb-4">
        <span className="w-3 h-3 rounded-full" style={{ background: UNO_DOT[s.color] }} />
        Active color: {s.color} · Direction {s.dir === 1 ? "Clockwise" : "Counter-Clockwise"}
      </div>
      {wildIdx !== null && (
        <div className="mb-3">
          <p className="text-xs text-center text-zinc-300 mb-2">Choose color:</p>
          <div className="grid grid-cols-4 gap-2">
            {UNO_COLORS.map((c) => (<button key={c} onClick={() => play(wildIdx, c)} className={`h-10 rounded-lg ${UNO_BG[c]}`} />))}
          </div>
        </div>
      )}
      <div className="flex-1 flex flex-wrap content-end justify-center gap-2 pb-3">
        {s.hands[mySeat].map((card, i) => {
          const ok = unoPlayable(card, s.top, s.color);
          return (
            <button key={i} onClick={() => onCard(i)} className={`w-12 h-[4.5rem] rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-md border-2 border-white/50 ${UNO_BG[card.color]} ${myTurn && !ok ? "opacity-40" : ""} ${myTurn && ok ? "-translate-y-1" : ""}`}>
              {unoLabel(card)}
            </button>
          );
        })}
      </div>
      {s.winner !== null ? (
        <Btn onClick={reset}><RotateCcw size={16} /> Play Again</Btn>
      ) : myTurn && s.drew && (
        <Btn onClick={() => { const next = unoPass(s, mySeat, "You passed."); setS(next); if(onMove) onMove(next); }}>Pass</Btn>
      )}
    </div>
  );
}

const SNAKES = { 16: 6, 47: 26, 49: 11, 56: 53, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 98: 78 };
const LADDERS = { 1: 38, 4: 14, 9: 31, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 80: 100 };
const PLAYER_COLORS = ["bg-red-500", "bg-yellow-500", "bg-green-500", "bg-blue-500"];
const DICE = ["1", "2", "3", "4", "5", "6"];

const cellXY = (n) => {
  const r = Math.floor((n - 1) / 10);
  const k = (n - 1) % 10;
  const col = r % 2 === 0 ? k : 9 - k;
  return { x: col * 10 + 5, y: (9 - r) * 10 + 5 };
};

export function ularInit() {
  return { pos: [0, 0, 0, 0], turn: 0, winner: null, msg: "Roll the dice to start!", id: 0, npcNames: [getNpcName(), getNpcName(), getNpcName()] };
}

function applyRoll(s, d) {
  const p = s.turn;
  let np = s.pos[p] + d;
  if (np > 100) np = 200 - np;
  let note = `moved to ${np}`;
  if (SNAKES[np]) { note = `hit a snake at ${np}, down to ${SNAKES[np]}`; np = SNAKES[np]; }
  else if (LADDERS[np]) { note = `climbed a ladder at ${np} to ${LADDERS[np]}`; np = LADDERS[np]; }
  const pos = s.pos.map((v, i) => (i === p ? np : v));
  const won = np === 100;
  const extra = d === 6 && !won;
  let msg = `Rolled ${d}, ${note}.`;
  if (extra) msg += " Rolled 6, go again!";
  if (won) msg = p === 0 ? "YOU WIN!" : `WINNER!`;
  return { pos, winner: won ? p : null, turn: won || extra ? p : (p + 1) % 4, msg, id: s.id + 1 };
}

export function GameUlarTangga({ onClose, mode = "npc", mySeat = 0, serverState = null, onMove = null, onWin = null }) {
  const [s, setS] = useState(() => serverState || ularInit());
  const [dice, setDice] = useState(0);
  const [rolling, setRolling] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  useEffect(() => {
    if (serverState) setS(serverState);
  }, [serverState]);

  useEffect(() => {
    if (s.winner === 0 && !hasWon) { setHasWon(true); if (onWin) onWin(); }
  }, [s.winner, hasWon, onWin]);

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
    return iv;
  };

  const rollFor = () => {
    if (mode === "npc" && s.turn !== 0) return;
    if (mode === "pvp" && s.turn !== mySeat) return;
    const id = s.id;
    roll((d) => {
      setS((prev) => {
        if (prev.id !== id) return prev;
        const next = applyRoll(prev, d);
        if (onMove) onMove(next);
        return next;
      });
    });
  };

  useEffect(() => {
    if (mode !== "npc" || s.turn === 0 || s.winner !== null) return;
    const t = setTimeout(rollFor, 800);
    return () => clearTimeout(t);
  }, [s.id, mode]);

  const reset = () => {
    setDice(0);
    setHasWon(false);
    const next = { ...ularInit(), id: s.id + 1000 };
    setS(next);
    if (onMove) onMove(next);
  };

  const cells = [];
  for (let v = 0; v < 10; v++) {
    const r = 9 - v;
    for (let c = 0; c < 10; c++) cells.push({ num: r * 10 + (r % 2 === 0 ? c : 9 - c) + 1, dark: (r + c) % 2 === 0 });
  }

  return (
    <div className="w-full flex flex-col h-full">
      <p className="text-xs text-center text-zinc-400 mb-3 min-h-8">{s.msg}</p>
      <div className="relative grid grid-cols-10 w-full aspect-square border-2 border-zinc-700 bg-zinc-800 mb-3">
        {cells.map(({ num, dark }) => (
          <div key={num} className={`relative flex items-start justify-start p-px text-[7px] text-zinc-500 border border-zinc-700/50 ${dark ? "bg-zinc-800" : "bg-zinc-900"}`}>
            {num}
            <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-0.5 p-0.5">
              {s.pos.map((pp, idx) => pp === num ? (<div key={idx} className={`w-2.5 h-2.5 rounded-full border border-black ${PLAYER_COLORS[idx]}`} />) : null)}
            </div>
          </div>
        ))}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
          {Object.entries(LADDERS).map(([a, b]) => {
            const p1 = cellXY(+a); const p2 = cellXY(+b);
            const dx = p2.x - p1.x; const dy = p2.y - p1.y;
            const len = Math.hypot(dx, dy) || 1;
            const nx = (-dy / len) * 1.3; const ny = (dx / len) * 1.3;
            return (
              <g key={"l" + a} stroke="#4ade80" strokeWidth="0.6" strokeLinecap="round" opacity="0.85">
                <line x1={p1.x + nx} y1={p1.y + ny} x2={p2.x + nx} y2={p2.y + ny} />
                <line x1={p1.x - nx} y1={p1.y - ny} x2={p2.x - nx} y2={p2.y - ny} />
                {[0.2, 0.4, 0.6, 0.8].map((t) => (<line key={t} x1={p1.x + nx + dx * t} y1={p1.y + ny + dy * t} x2={p1.x - nx + dx * t} y2={p1.y - ny + dy * t} />))}
              </g>
            );
          })}
          {Object.entries(SNAKES).map(([a, b]) => {
            const h = cellXY(+a); const t = cellXY(+b);
            const mx = (h.x + t.x) / 2 + (h.y > t.y ? 6 : -6); const my = (h.y + t.y) / 2;
            return (
              <g key={"s" + a}>
                <path d={`M${h.x} ${h.y} Q${mx} ${my} ${t.x} ${t.y}`} fill="none" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
                <circle cx={h.x} cy={h.y} r="2" fill="#ef4444" />
              </g>
            );
          })}
        </svg>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`flex items-center gap-2 text-xs ${s.turn === i && s.winner === null ? "text-yellow-400 font-bold" : "text-zinc-300"}`}>
            <div className={`w-3 h-3 rounded-full ${PLAYER_COLORS[i]}`} />
            {i === 0 ? "You" : (s.npcNames ? s.npcNames[i-1] : `Player ${i+1}`)} ({s.pos[i] === 0 ? "start" : s.pos[i]})
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-zinc-400 text-sm">Dice:</span>
        <span className={`text-2xl font-bold text-white ${rolling ? "opacity-70" : ""}`}>{dice === 0 ? "-" : DICE[dice - 1]}</span>
      </div>
      {s.winner !== null ? (
        <Btn onClick={reset}><RotateCcw size={16} /> Play Again</Btn>
      ) : (
        <Btn disabled={(mode === "npc" ? s.turn !== 0 : s.turn !== mySeat) || rolling} onClick={rollFor}>
          {(mode === "npc" ? s.turn === 0 : s.turn === mySeat) ? "Roll Dice" : "Waiting..."}
        </Btn>
      )}
    </div>
  );
}

const SPY_PAIRS = [
  { civ: "Apple", spy: "Mango", ch: ["red", "crunchy", "round", "cold"], sh: ["yellow", "tropical", "fiber", "oval"] },
  { civ: "Cat", spy: "Dog", ch: ["meow", "sleek", "sleep", "fish"], sh: ["bark", "loyal", "bone", "trained"] },
  { civ: "Car", spy: "Motorcycle", ch: ["door", "four wheels", "roof", "AC"], sh: ["helmet", "two wheels", "exhaust", "gas"] },
  { civ: "Airplane", spy: "Helicopter", ch: ["airport", "wings", "ticket", "runway"], sh: ["rotor", "helipad", "vertical", "noisy"] },
  { civ: "Book", spy: "Magazine", ch: ["novel", "thick", "library", "chapter"], sh: ["cover", "monthly", "ads", "glossy"] },
  { civ: "Coffee", spy: "Tea", ch: ["bitter", "caffeine", "espresso", "beans"], sh: ["leaves", "bag", "warm", "jasmine"] },
  { civ: "Shoes", spy: "Sandals", ch: ["laces", "socks", "closed", "sports"], sh: ["flip", "casual", "open", "mosque"] },
  { civ: "Pizza", spy: "Burger", ch: ["Italy", "cheese", "oven", "slice"], sh: ["bread", "patty", "drive-thru", "sauce"] },
];

function spyInit() {
  const pair = pick(SPY_PAIRS);
  const spyIdx = rand(6);
  const taken = new Set();
  const npcNames = [getNpcName(), getNpcName(), getNpcName(), getNpcName(), getNpcName()];
  const players = ["You", ...npcNames].map((name, i) => {
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
  votes[myVote]++;
  for (let i = 1; i < 6; i++) {
    let best = -1; let bs = -1;
    for (let j = 0; j < 6; j++) {
      if (j === i) continue;
      const fits = players[i].list.includes(players[j].hint);
      const score = (fits ? 0 : 1) + Math.random() * 0.9;
      if (score > bs) { bs = score; best = j; }
    }
    votes[best]++;
  }
  const max = Math.max(...votes);
  const top = votes.map((v, i) => (v === max ? i : -1)).filter((i) => i >= 0);
  return { votes, out: pick(top) };
}

export function GameSpy({ onClose, mode = "npc", serverState = null, onMove = null, onWin = null }) {
  const [g, setG] = useState(() => serverState || spyInit());
  const [hasWon, setHasWon] = useState(false);

  useEffect(() => {
    if (serverState) setG(serverState);
  }, [serverState]);

  const me = g.players[0];
  const chooseHint = (h) => {
    const next = { ...g, phase: "vote", players: g.players.map((pl, i) => (i === 0 ? { ...pl, hint: h } : pl)) };
    setG(next);
    if (onMove) onMove(next);
  };
  const vote = (j) => {
    const next = { ...g, phase: "result", result: spyVotes(g.players, j) };
    setG(next);
    if (onMove) onMove(next);
  };

  const spyIdx = g.players.findIndex((p) => p.isSpy);
  const r = g.result;
  const spyOut = r ? r.out === spyIdx : false;
  const iWin = r ? (me.isSpy ? !spyOut : spyOut) : false;

  useEffect(() => {
    if (iWin && !hasWon) { setHasWon(true); if (onWin) onWin(); }
  }, [iWin, hasWon, onWin]);

  return (
    <div className="w-full">
      {g.phase === "reveal" && (
        <div className="text-center space-y-4 mt-3">
          <p className="text-zinc-400 text-sm">There is 1 spy whose secret word is similar but different.</p>
          <div className="bg-[#0f0a15] border border-zinc-700 rounded-xl p-4">
            <p className="text-xs text-zinc-500 mb-2">Your secret word:</p>
            <p className="text-3xl font-bold text-white">{me.word}</p>
          </div>
          <Btn onClick={() => { const n = { ...g, phase: "hint" }; setG(n); if (onMove) onMove(n); }}>Continue to give hint</Btn>
        </div>
      )}
      {g.phase === "hint" && (
        <div className="space-y-3 mt-3">
          <p className="text-center text-sm text-zinc-400">Choose one hint, don't be too obvious!</p>
          <div className="grid grid-cols-2 gap-2">
            {me.list.map((h) => (<button key={h} onClick={() => chooseHint(h)} className="bg-[#0f0a15] border border-zinc-700 text-white p-3 rounded-xl">{h}</button>))}
          </div>
        </div>
      )}
      {g.phase === "vote" && (
        <div className="space-y-2 mt-3">
          <p className="text-center text-sm text-zinc-400 mb-1">Who is suspicious?</p>
          <div className="bg-[#0f0a15] border border-zinc-700 rounded-xl p-2 text-xs text-zinc-300 text-center mb-2">You: <span className="text-white font-bold">{me.hint}</span></div>
          {g.players.slice(1).map((pl, k) => (
            <button key={pl.name} onClick={() => vote(k + 1)} className="w-full flex justify-between items-center bg-[#0f0a15] border border-zinc-700 text-white px-4 py-3 rounded-xl">
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
            <p className="text-white font-bold">{iWin ? "You win!" : "You lose."}</p>
            <p className="text-xs text-zinc-400 mt-1">{g.players[r.out].name} eliminated {spyOut ? "- SPY." : `- civilian. Spy was ${g.players[spyIdx].name}.`}</p>
          </div>
          <div className="bg-[#0f0a15] border border-zinc-700 rounded-xl divide-y divide-zinc-800">
            {g.players.map((pl, i) => (
              <div key={pl.name} className="flex items-center justify-between px-3 py-2 text-xs">
                <span className={`font-bold ${i === r.out ? "text-red-400" : "text-white"}`}>{pl.name} {pl.isSpy ? "(Spy)" : ""}</span>
                <span className="text-zinc-400">{pl.word} · {r.votes[i]} votes</span>
              </div>
            ))}
          </div>
          <Btn onClick={() => { const n = spyInit(); setG(n); setHasWon(false); if (onMove) onMove(n); }}><RotateCcw size={16} /> Play Again</Btn>
        </div>
      )}
    </div>
  );
}

const TTT_LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

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

export function tttMove(b, level) {
  const empty = b.map((v, i) => (v ? null : i)).filter((v) => v !== null);
  if (level === "easy") return pick(empty);
  if (level !== "hard") {
    const find = (mark) => empty.find((i) => { const t = [...b]; t[i] = mark; return tttCheck(t)?.w === mark; });
    const w = find("O"); if (w !== undefined) return w;
    const bl = find("X"); if (bl !== undefined) return bl;
    if (b[4] === null && Math.random() < 0.7) return 4;
    return pick(empty);
  }
  if (empty.length === 9) return pick([0, 2, 4, 6, 8]);
  let bestS = -Infinity; let bests = [];
  empty.forEach((i) => {
    const t = [...b]; t[i] = "O";
    const sc = tttMinimax(t, false, 1);
    if (sc > bestS) { bestS = sc; bests = [i]; } else if (sc === bestS) bests.push(i);
  });
  return pick(bests);
}

export function tttInit() {
  return { board: Array(9).fill(null), turn: "X", round: 1, scores: { x: 0, o: 0, d: 0 }, result: null, line: [], final: false, npcName: getNpcName() };
}

export function tttPlace(s, i, mark) {
  const board = [...s.board];
  board[i] = mark;
  const r = tttCheck(board);
  if (!r) return { ...s, board, turn: mark === "X" ? "O" : "X" };
  const scores = { ...s.scores };
  if (r.w === "X") scores.x++; else if (r.w === "O") scores.o++; else scores.d++;
  return { ...s, board, scores, result: r.w, line: r.line };
}

export function GameTicTacToe({ level = "medium", onClose, mode = "npc", myMark = "X", serverState = null, onMove = null, opponentName = "NPC", onWin = null }) {
  const [s, setS] = useState(() => serverState || tttInit());
  const [hasWon, setHasWon] = useState(false);

  useEffect(() => {
    if (serverState) setS(serverState);
  }, [serverState]);

  useEffect(() => {
    if (s.final && !hasWon) {
      const { x, o } = s.scores;
      if ((myMark === "X" && x > o) || (myMark === "O" && o > x)) {
        setHasWon(true);
        if (onWin) onWin();
      }
    }
  }, [s.final, s.scores, myMark, hasWon, onWin]);

  useEffect(() => {
    if (mode !== "npc" || s.turn !== "O" || s.result || s.final) return;
    const t = setTimeout(() => {
      setS((p) => {
        if (p.turn !== "O" || p.result || p.final) return p;
        const next = tttPlace(p, tttMove(p.board, level), "O");
        if (onMove) onMove(next);
        return next;
      });
    }, 500);
    return () => clearTimeout(t);
  }, [s.turn, s.result, s.final, s.round, mode]);

  useEffect(() => {
    if (!s.result || s.final) return;
    const t = setTimeout(() => {
      setS((p) => {
        if (p.round >= 10) return { ...p, final: true };
        const next = { ...p, board: Array(9).fill(null), round: p.round + 1, turn: (p.round + 1) % 2 === 1 ? "X" : "O", result: null, line: [] };
        if (onMove) onMove(next);
        return next;
      });
    }, 1500);
    return () => clearTimeout(t);
  }, [s.result, s.final, s.round]);

  const click = (i) => {
    if (s.board[i] || s.result || s.turn !== myMark || s.final) return;
    const next = tttPlace(s, i, myMark);
    setS(next);
    if (onMove) onMove(next);
  };

  let msg;
  if (s.result === myMark) msg = "You win this round!";
  else if (s.result && s.result !== "Draw") msg = "Opponent wins this round!";
  else if (s.result === "Draw") msg = "Draw!";
  else msg = s.turn === myMark ? "Your turn" : `Waiting for ${opponentName}...`;

  const { x, o, d } = s.scores;
  const verdict = myMark === "X" ? (x > o ? "You win!" : x < o ? "You lose." : "Draw!") : (o > x ? "You win!" : o < x ? "You lose." : "Draw!");

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm text-zinc-300 mb-2 px-2 mt-2">
        <span>You: {myMark === "X" ? x : o}</span>
        <span>Round {s.round}/10 · draws {d}</span>
        <span>{opponentName}: {myMark === "X" ? o : x}</span>
      </div>
      <p className="text-xs text-center text-zinc-400 mb-3 h-4">{s.final ? "Game over" : msg}</p>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {s.board.map((cell, i) => (
          <button key={i} onClick={() => click(i)} className={`w-full aspect-square border rounded-xl text-4xl font-bold flex items-center justify-center ${s.line.includes(i) ? "bg-green-900/40 border-green-500" : "bg-[#0f0a15] border-zinc-700"}`}>
            <span className={cell === "X" ? "text-zinc-300" : "text-red-500"}>{cell}</span>
          </button>
        ))}
      </div>
      {s.final && (
        <div className="text-center space-y-3">
          <Trophy size={40} className="mx-auto text-yellow-500" />
          <p className="text-white font-bold">{verdict} ({x} - {o}, draws {d})</p>
          <Btn onClick={() => { const n = tttInit(); setS(n); setHasWon(false); if (onMove) onMove(n); }}><RotateCcw size={16} /> Play Again</Btn>
        </div>
      )}
    </div>
  );
}
