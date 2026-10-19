"use client";
import { useState, useEffect, useRef } from "react";
import { X, User, Bot, Trophy, RotateCcw, Users, RefreshCw } from "lucide-react";
// IMPORT CHESS LIBRARY
import { Chess } from "chess.js";

// ==========================================
// 1. CATUR ENGINE (Pake library chess.js)
// ==========================================
export function GameCatur({ level, onClose }) {
  const chessRef = useRef(new Chess());
  const [fen, setFen] = useState(chessRef.current.fen());
  const [selected, setSelected] = useState(null);
  const [turn, setTurn] = useState("w");
  const [msg, setMsg] = useState("Giliranmu (Putih)");

  const piecesEmoji = {
    "r":"♜","n":"♞","b":"♝","q":"♛","k":"♚","p":"♟",
    "R":"♖","N":"♘","B":"♗","Q":"♕","K":"♔","P":"♙"
  };

  // Ambil papan dari FEN
  const board = chessRef.current.board();

  const handleClick = (r, c) => {
    if (turn === "b") return; 
    
    const files = ['a','b','c','d','e','f','g','h'];
    const ranks = [8,7,6,5,4,3,2,1];
    const square = files[c] + ranks[r];
    const piece = chessRef.current.get(square);

    if (selected) {
      try {
        const move = chessRef.current.move({ from: selected, to: square, promotion: 'q' });
        if (move) {
          setFen(chessRef.current.fen());
          setSelected(null);
          if (chessRef.current.game_over()) {
             setMsg("Game Over! " + (chessRef.current.in_checkmate() ? "Skakmat!" : "Seri!"));
             return;
          }
          setTurn("b");
          setMsg("NPC mikir...");
        } else {
          setSelected(null);
        }
      } catch (e) {
        if (piece && piece.color === 'w') setSelected(square);
        else setSelected(null);
      }
    } else {
      if (piece && piece.color === 'w') setSelected(square);
    }
  };

  // NPC Logic
  useEffect(() => {
    if (turn === "b" && !chessRef.current.game_over()) {
      setTimeout(() => {
        const moves = chessRef.current.moves({ verbose: true });
        if (moves.length > 0) {
          let move;
          if (level === 'easy') {
            move = moves[Math.floor(Math.random() * moves.length)];
          } else if (level === 'medium') {
            const eats = moves.filter(m => m.captured);
            move = eats.length > 0 ? eats[0] : moves[Math.floor(Math.random() * moves.length)];
          } else {
            const eats = moves.filter(m => m.captured).sort((a,b)=>b.captured.localeCompare(a.captured));
            move = eats.length > 0 ? eats[0] : moves[Math.floor(Math.random() * moves.length)];
          }
          
          chessRef.current.move(move);
          setFen(chessRef.current.fen());
          if (chessRef.current.game_over()) {
             setMsg("Game Over! " + (chessRef.current.in_checkmate() ? "Skakmat!" : "Seri!"));
          } else {
             setTurn("w");
             setMsg("Giliranmu (Putih)");
          }
        }
      }, 1000);
    }
  }, [turn, level]);

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-2">
      <div className="bg-[#1c1c1e] border border-zinc-700 rounded-2xl w-full max-w-sm p-4 relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-zinc-400"><X size={20}/></button>
        <h2 className="text-white font-bold text-center mb-2">Catur (Level: {level})</h2>
        <p className="text-xs text-center text-zinc-400 mb-2">{msg}</p>
        
        <div className="grid grid-cols-8 border-2 border-zinc-600 w-full aspect-square mb-4">
          {board.map((row, r) => row.map((cell, c) => {
            const files = ['a','b','c','d','e','f','g','h'];
            const ranks = [8,7,6,5,4,3,2,1];
            const square = files[c] + ranks[r];
            const isSelected = selected === square;
            
            let isValidMove = false;
            if (selected) {
               try {
                  const moves = chessRef.current.moves({ square: selected, verbose: true });
                  if (moves.some(m => m.to === square)) isValidMove = true;
               } catch(e){}
            }

            return (
              <div key={`${r}-${c}`} onClick={() => handleClick(r,c)} className={`relative flex items-center justify-center text-2xl sm:text-3xl cursor-pointer ${(r+c)%2 === 0 ? 'bg-zinc-300' : 'bg-zinc-500'} ${isSelected ? 'border-4 border-blue-500' : ''}`}>
                {cell && <span className={cell.color === 'w' ? 'text-white drop-shadow-md' : 'text-black'}>{piecesEmoji[cell.color === 'w' ? cell.type.toUpperCase() : cell.type]}</span>}
                {isValidMove && <div className="absolute w-3 h-3 bg-green-500/50 rounded-full"></div>}
              </div>
            );
          }))}
        </div>
        <button onClick={() => { chessRef.current = new Chess(); setFen(chessRef.current.fen()); setTurn('w'); setMsg("Giliranmu (Putih)"); }} className="w-full bg-zinc-600 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2"><RotateCcw size={16}/> Reset</button>
      </div>
    </div>
  );
}

// ==========================================
// 2. UNO ENGINE (Turn-Based, Colorful)
// ==========================================
export function GameUno({ onClose }) {
  const colors = ["merah", "biru", "hijau", "kuning"];
  const colorBg = { merah: "bg-red-600", biru: "bg-blue-600", hijau: "bg-green-600", kuning: "bg-yellow-500" };
  
  const playersName = ["Kamu", "Budi", "Siti", "Joko"];
  const [hands, setHands] = useState([
    [genCard(), genCard(), genCard(), genCard(), genCard()], 
    [genCard(), genCard(), genCard(), genCard(), genCard()], 
    [genCard(), genCard(), genCard(), genCard(), genCard()], 
    [genCard(), genCard(), genCard(), genCard(), genCard()], 
  ]);
  const [deckTarget, setDeckTarget] = useState(genCard());
  const [turn, setTurn] = useState(0); 
  const [msg, setMsg] = useState("Pilih kartu yang warnanya/angkanya sama!");
  const [hasDrawn, setHasDrawn] = useState(false);

  function genCard() {
    return { color: colors[Math.floor(Math.random() * 4)], num: Math.floor(Math.random() * 9) + 1 };
  }

  const playCard = (index) => {
    if (turn !== 0) return;
    const card = hands[0][index];
    const isMatch = card.color === deckTarget.color || card.num === deckTarget.num;

    if (isMatch) {
      const newHands = [...hands];
      newHands[0].splice(index, 1);
      setHands(newHands);
      setDeckTarget(card);
      setHasDrawn(false);
      
      if (newHands[0].length === 0) {
        setMsg("KAMU MENANG! 🎉");
        return;
      }
      nextTurn();
    } else {
      setMsg("Kartu tidak cocok!");
    }
  };

  const drawCard = () => {
    if (turn !== 0 || hasDrawn) return;
    const newCard = genCard();
    const newHands = [...hands];
    newHands[0].push(newCard);
    setHands(newHands);
    setHasDrawn(true);
    
    if (newCard.color === deckTarget.color || newCard.num === deckTarget.num) {
      setMsg("Kartu cocok! Silakan buang.");
    } else {
      setMsg("Kartu tidak cocok. Lanjut ke NPC.");
      setTimeout(() => nextTurn(), 1000);
    }
  };

  const nextTurn = () => {
    setTurn((prev) => (prev + 1) % 4);
  };

  useEffect(() => {
    if (turn !== 0 && !msg.includes("MENANG")) {
      const timer = setTimeout(() => {
        const currentHand = hands[turn];
        const matchIdx = currentHand.findIndex(c => c.color === deckTarget.color || c.num === deckTarget.num);

        if (matchIdx !== -1) {
          const newHands = [...hands];
          const playedCard = newHands[turn][matchIdx];
          newHands[turn].splice(matchIdx, 1);
          setHands(newHands);
          setDeckTarget(playedCard);
          setMsg(`${playersName[turn]} membuang kartu ${playedCard.color} ${playedCard.num}`);
          
          if (newHands[turn].length === 0) {
             setMsg(`${playersName[turn]} MENANG! 💀`);
             return;
          }
        } else {
          const newHands = [...hands];
          newHands[turn].push(genCard());
          setHands(newHands);
          setMsg(`${playersName[turn]} menarik kartu.`);
        }
        
        setTimeout(() => nextTurn(), 1500);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [turn, hands, deckTarget]);

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-2">
      <div className="bg-[#1c1c1e] border border-zinc-700 rounded-2xl w-full max-w-sm p-4 relative h-[90vh] overflow-y-auto flex flex-col">
        <button onClick={onClose} className="absolute top-2 right-2 text-zinc-400 z-10"><X size={20}/></button>
        <h2 className="text-white font-bold text-center mb-1 shrink-0">Uno</h2>
        <p className="text-xs text-center text-zinc-400 mb-2 shrink-0">{msg}</p>

        <div className="flex justify-between w-full mb-4 shrink-0">
          {[1, 2, 3].map((npcIdx) => (
             <div key={npcIdx} className="flex flex-col items-center">
               <div className="flex -space-x-4">
                 {hands[npcIdx].map((_, j) => (
                    <div key={j} className="w-6 h-10 bg-zinc-700 border border-zinc-500 rounded-sm"></div>
                 ))}
               </div>
               <span className="text-[10px] text-zinc-400 mt-1">{playersName[npcIdx]} ({hands[npcIdx].length})</span>
             </div>
          ))}
        </div>

        <div className="flex justify-center items-center gap-4 mb-6 shrink-0">
          <div onClick={drawCard} className={`w-20 h-28 rounded-xl flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-lg bg-zinc-800 ${turn === 0 && !hasDrawn ? 'cursor-pointer hover:scale-105' : 'opacity-50'}`}>
            🂠
          </div>
          <div className={`w-20 h-28 rounded-xl flex flex-col items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg ${colorBg[deckTarget.color]}`}>
            {deckTarget.num}
          </div>
        </div>

        <div className="flex-1 flex justify-center items-end gap-2 overflow-x-auto pb-4">
          {hands[0].map((card, i) => (
            <button key={i} onClick={() => playCard(i)} className={`w-14 h-20 rounded-lg flex items-center justify-center text-white text-xl font-bold shadow-md transition-transform hover:-translate-y-2 border-2 border-white/50 ${colorBg[card.color]}`}>
              {card.num}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. ULAR TANGGA (Sama kayak sebelumnya)
// ==========================================
export function GameUlarTangga({ onClose }) {
  const [positions, setPositions] = useState([1, 1, 1, 1]);
  const [turn, setTurn] = useState(0);
  const [dice, setDice] = useState(0);
  const [msg, setMsg] = useState("Lempar dadu untuk jalan!");

  const playerColors = ["bg-red-500", "bg-yellow-500", "bg-green-500", "bg-blue-500"];
  const playerNames = ["Kamu", "Budi (NPC)", "Siti (NPC)", "Joko (NPC)"];
  const snakes = { 16: 6, 47: 26, 49: 11, 56: 53, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 98: 78 };
  const ladders = { 1: 38, 4: 14, 9: 31, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 80: 100 };

  const rollDice = () => {
    if (turn !== 0) return;
    const d = Math.floor(Math.random() * 6) + 1;
    setDice(d);
    let newPos = positions[0] + d;
    if (newPos > 100) newPos = 100 - (newPos - 100);
    if (snakes[newPos]) { setMsg(`Kena ular! Turun ke ${snakes[newPos]}`); newPos = snakes[newPos]; }
    else if (ladders[newPos]) { setMsg(`Naik tangga! Ke ${ladders[newPos]}`); newPos = ladders[newPos]; }
    else { setMsg(`Jalan ${d} langkah.`); }
    const newPositions = [...positions];
    newPositions[0] = newPos;
    setPositions(newPositions);
    if (newPos === 100) { setMsg("KAMU MENANG! 🎉"); return; }
    setTurn(1);
  };

  useEffect(() => {
    if (turn !== 0 && !msg.includes("MENANG")) {
      setTimeout(() => {
        const d = Math.floor(Math.random() * 6) + 1;
        let newPos = positions[turn] + d;
        if (newPos > 100) newPos = 100 - (newPos - 100);
        if (snakes[newPos]) newPos = snakes[newPos];
        else if (ladders[newPos]) newPos = ladders[newPos];
        const newPositions = [...positions];
        newPositions[turn] = newPos;
        setPositions(newPositions);
        setMsg(`${playerNames[turn]} jalan ${d} langkah.`);
        if (newPos === 100) setMsg(`${playerNames[turn]} MENANG! 💀`);
        else setTurn((turn + 1) % 4);
      }, 1500);
    }
  }, [turn]);

  const renderBoard = () => {
    let cells = [];
    for (let row = 9; row >= 0; row--) {
      let rowCells = [];
      for (let col = 0; col < 10; col++) {
        let num = row * 10 + (row % 2 === 0 ? col + 1 : 10 - col);
        rowCells.push(num);
      }
      if (row % 2 !== 0) rowCells.reverse();
      cells.push(...rowCells);
    }
    return (
      <div className="grid grid-cols-10 w-full aspect-square border-2 border-zinc-700 bg-zinc-800 mb-4">
        {cells.map((num, i) => {
          const playersHere = positions.map((pos, idx) => pos === num ? idx : -1).filter(idx => idx !== -1);
          return (
            <div key={i} className={`relative flex items-center justify-center border border-zinc-700 text-[8px] text-zinc-400 ${num % 2 === 0 ? 'bg-zinc-800' : 'bg-zinc-800/50'}`}>
              {num}
              <div className="absolute flex flex-wrap justify-center gap-0.5">
                 {playersHere.map(pIdx => (
                    <div key={pIdx} className={`w-2 h-2 rounded-full border border-black ${playerColors[pIdx]}`}></div>
                 ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-2">
      <div className="bg-[#1c1c1e] border border-zinc-700 rounded-2xl w-full max-w-sm p-4 relative h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-2 right-2 text-zinc-400"><X size={20}/></button>
        <h2 className="text-white font-bold text-center mb-1">Ular Tangga</h2>
        <p className="text-xs text-center text-zinc-400 mb-4">{msg}</p>
        {renderBoard()}
        <div className="grid grid-cols-2 gap-2 mb-4">
           {playerNames.map((name, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-zinc-300">
                 <div className={`w-3 h-3 rounded-full ${playerColors[i]}`}></div> {name} (Posisi: {positions[i]})
              </div>
           ))}
        </div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-zinc-400 text-sm">Dadu:</span>
          <span className="text-3xl text-white">{dice === 0 ? "🎲" : ['⚀','⚁','⚂','⚃','⚄','⚅'][dice-1]}</span>
        </div>
        <button disabled={turn !== 0} onClick={rollDice} className="w-full bg-zinc-600 text-white font-bold py-3 rounded-xl disabled:opacity-50">Lempar Dadu (Player)</button>
      </div>
    </div>
  );
}

// ==========================================
// 4. WHO'S THE SPY (Sama kayak sebelumnya)
// ==========================================
export function GameSpy({ onClose }) {
  const words = [
    { civ: "Apel", spy: "Mangga" }, { civ: "Kucing", spy: "Anjing" },
    { civ: "Mobil", spy: "Motor" }, { civ: "Pesawat", spy: "Helikopter" },
    { civ: "Buku", spy: "Majalah" },
  ];
  const npcNames = ["Budi", "Siti", "Joko", "Rina", "Dewi"];
  const [gameState, setGameState] = useState("playing");
  const [selectedWord, setSelectedWord] = useState(null);
  const [isPlayerSpy, setIsPlayerSpy] = useState(false);
  const [votedFor, setVotedFor] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const w = words[Math.floor(Math.random() * words.length)];
    setSelectedWord(w);
    const spyIndex = Math.floor(Math.random() * 6);
    if (spyIndex === 0) setIsPlayerSpy(true);
    setMsg("Semua orang udah liat kata. Klik 'Lanjut Vote'");
  }, []);

  const handleVote = (target) => {
    setVotedFor(target);
    setGameState("result");
    if (isPlayerSpy) setMsg(`Kamu SPY! Kata yang benar: ${selectedWord.civ}. Kata kamu: ${selectedWord.spy}.`);
    else {
      if (target === "spy") setMsg(`Benar! ${npcNames[Math.floor(Math.random()*5)]} adalah Spy! Kamu Menang! 🎉`);
      else setMsg(`Salah! Kamu nge-vote warga sipil. Spy nya adalah ${npcNames[Math.floor(Math.random()*5)]}! 💀`);
    }
  };

  if (!selectedWord) return null;
  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-2">
      <div className="bg-[#1c1c1e] border border-zinc-700 rounded-2xl w-full max-w-sm p-4 relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-zinc-400"><X size={20}/></button>
        <h2 className="text-white font-bold text-center mb-4">Who's The Spy?</h2>
        {gameState === "playing" && (
          <div className="text-center space-y-4">
             <p className="text-zinc-400 text-sm">Kamu adalah {isPlayerSpy ? "SPY 🕵️" : "WARGA SIPIL 👨‍🌾"}</p>
             <div className="bg-[#0f0a15] border border-zinc-700 rounded-xl p-4">
                <p className="text-xs text-zinc-500 mb-2">Kata Rahasia Kamu:</p>
                <p className="text-2xl font-bold text-white">{isPlayerSpy ? selectedWord.spy : selectedWord.civ}</p>
             </div>
             <button onClick={() => setGameState("voting")} className="w-full bg-zinc-600 text-white font-bold py-3 rounded-xl">Lanjut Vote</button>
          </div>
        )}
        {gameState === "voting" && (
          <div className="space-y-3">
             <p className="text-center text-sm text-zinc-400 mb-2">Siapa yang menurutmu SPY?</p>
             {isPlayerSpy ? (
                <button onClick={() => handleVote("spy")} className="w-full bg-red-900/30 border border-red-700 text-red-400 p-3 rounded-xl">Vote Diri Sendiri (Karena Kamu Spy)</button>
             ) : (
                npcNames.map((name, i) => (
                  <button key={i} onClick={() => handleVote(name)} className="w-full bg-[#0f0a15] border border-zinc-700 text-white p-3 rounded-xl hover:bg-zinc-800">{name}</button>
                ))
             )}
          </div>
        )}
        {gameState === "result" && (
          <div className="text-center space-y-4">
             <Trophy size={48} className="mx-auto text-yellow-500 mb-2" />
             <p className="text-white font-bold">{msg}</p>
             <button onClick={onClose} className="w-full bg-zinc-600 text-white font-bold py-3 rounded-xl">Selesai</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 5. TIC TAC TOE (Bo10)
// ==========================================
export function GameTicTacToe({ level, onClose }) {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [turn, setTurn] = useState("X");
  const [playerScore, setPlayerScore] = useState(0);
  const [npcScore, setNpcScore] = useState(0);
  const [round, setRound] = useState(1);
  const [msg, setMsg] = useState("");

  const checkWin = (b) => {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (let l of lines) if (b[l[0]] && b[l[0]] === b[l[1]] && b[l[0]] === b[l[2]]) return b[l[0]];
    return b.includes(null) ? null : 'Draw';
  };

  const handleClick = (i) => {
    if (board[i] || checkWin(board) || turn === "O") return;
    const nb = [...board]; nb[i] = "X"; setBoard(nb);
    const w = checkWin(nb);
    if (w) handleEnd(w); else setTurn("O");
  };

  useEffect(() => {
    if (turn === "O" && !checkWin(board)) {
      setTimeout(() => {
        const empty = board.map((v, i) => v === null ? i : null).filter(v => v !== null);
        if (!empty.length) return;
        let move = empty[Math.floor(Math.random() * empty.length)];
        const nb = [...board]; nb[move] = "O"; setBoard(nb);
        const w = checkWin(nb);
        if (w) handleEnd(w); else setTurn("X");
      }, 500);
    }
  }, [turn, board]);

  const handleEnd = (winner) => {
    if (winner === "X") { setPlayerScore(p => p + 1); setMsg("Kamu Menang Ronde Ini!"); }
    else if (winner === "O") { setNpcScore(n => n + 1); setMsg("NPC Menang Ronde Ini!"); }
    else { setMsg("Seri!"); }
    setTimeout(() => {
      if (round >= 10) setMsg(`GAME OVER! Skor: ${playerScore} - ${npcScore}`);
      else { setRound(r => r + 1); setBoard(Array(9).fill(null)); setTurn("X"); setMsg(`Ronde ${round + 1}`); }
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-2">
      <div className="bg-[#1c1c1e] border border-zinc-700 rounded-2xl w-full max-w-sm p-4 relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-zinc-400"><X size={20}/></button>
        <h2 className="text-white font-bold text-center mb-2">Tic Tac Toe (Bo10)</h2>
        <div className="flex justify-between text-sm text-zinc-300 mb-4 px-4">
           <span>Kamu: {playerScore}</span><span>Ronde: {round}/10</span><span>NPC: {npcScore}</span>
        </div>
        <p className="text-xs text-center text-zinc-400 mb-4">{msg || `Giliran: ${turn}`}</p>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {board.map((cell, i) => (
            <button key={i} onClick={() => handleClick(i)} className="w-full aspect-square bg-[#0f0a15] border border-zinc-700 rounded-xl text-4xl font-bold flex items-center justify-center">
              <span className={cell === 'X' ? 'text-zinc-400' : 'text-red-500'}>{cell}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
