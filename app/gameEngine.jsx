"use client";
import { useState, useEffect } from "react";
import { X, User, Bot, Trophy, RotateCcw, Users } from "lucide-react";

// ==========================================
// 1. CATUR ENGINE (Real Movement Logic)
// ==========================================
export function GameCatur({ level, onClose }) {
  // Representasi papan pake array 8x8. Huruf besar = Putih (Player), kecil = Hitam (NPC)
  const initialBoard = [
    ["r","n","b","q","k","b","n","r"],
    ["p","p","p","p","p","p","p","p"],
    ["","","","","","","",""],
    ["","","","","","","",""],
    ["","","","","","","",""],
    ["","","","","","","",""],
    ["P","P","P","P","P","P","P","P"],
    ["R","N","B","Q","K","B","N","R"]
  ];
  const [board, setBoard] = useState(initialBoard);
  const [selected, setSelected] = useState(null); // {r, c}
  const [turn, setTurn] = useState("w"); // w = white, b = black
  const [msg, setMsg] = useState("Giliranmu (Putih)");

  const piecesEmoji = {
    "r":"♜","n":"♞","b":"♝","q":"♛","k":"♚","p":"♟",
    "R":"♖","N":"♘","B":"♗","Q":"♕","K":"♔","P":"♙"
  };

  // Logic simple validasi gerak
  const isValidMove = (fr, fc, tr, tc, piece) => {
    if (tr < 0 || tr > 7 || tc < 0 || tc > 7) return false;
    const target = board[tr][tc];
    if (target !== "" && target === target.toUpperCase() === (piece === piece.toUpperCase())) return false; // Gak bisa makan kawan sendiri

    const dr = Math.abs(tr - fr);
    const dc = Math.abs(tc - fc);
    const isWhite = piece === piece.toUpperCase();

    if (piece.toLowerCase() === "p") {
      const dir = isWhite ? -1 : 1;
      if (fc === tc && tr === fr + dir && target === "") return true; // Maju 1
      if (fc === tc && tr === fr + (dir*2) && target === "" && (fr === 6 || fr === 1)) return true; // Maju 2
      if (dc === 1 && tr === fr + dir && target !== "") return true; // Makan
    }
    if (piece.toLowerCase() === "r" && (fr === tr || fc === tc)) return true; // Benteng
    if (piece.toLowerCase() === "n" && ((dr === 2 && dc === 1) || (dr === 1 && dc === 2))) return true; // Kuda
    if (piece.toLowerCase() === "b" && dr === dc) return true; // Uskup
    if (piece.toLowerCase() === "q" && (dr === dc || fr === tr || fc === tc)) return true; // Ratu
    if (piece.toLowerCase() === "k" && dr <= 1 && dc <= 1) return true; // Raja

    return false;
  };

  const handleClick = (r, c) => {
    if (turn === "b") return; // Kalo NPC jalan, tahan player
    const piece = board[r][c];

    if (selected) {
      if (selected.r === r && selected.c === c) { setSelected(null); return; } // Batal pilih
      
      if (isValidMove(selected.r, selected.c, r, c, board[selected.r][selected.c])) {
        // Jalan
        const newBoard = board.map(row => [...row]);
        newBoard[r][c] = newBoard[selected.r][selected.c];
        newBoard[selected.r][selected.c] = "";
        setBoard(newBoard);
        setSelected(null);
        setTurn("b");
        setMsg("NPC mikir...");
      } else {
        setSelected(null); // Pilih ulang
      }
    } else {
      if (piece && piece === piece.toUpperCase()) setSelected({r, c});
    }
  };

  // NPC Logic
  useEffect(() => {
    if (turn === "b") {
      setTimeout(() => {
        let validMoves = [];
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            if (board[r][c] && board[r][c] === board[r][c].toLowerCase()) {
              for (let tr = 0; tr < 8; tr++) {
                for (let tc = 0; tc < 8; tc++) {
                  if (isValidMove(r, c, tr, tc, board[r][c])) {
                    validMoves.push({ fr: r, fc: c, tr, tc, score: board[tr][tc] !== "" ? 10 : 0 });
                  }
                }
              }
            }
          }
        }

        if (validMoves.length > 0) {
          let move;
          if (level === 'easy') move = validMoves[Math.floor(Math.random() * validMoves.length)];
          else if (level === 'medium') {
            // Pilih yg bisa makan, kalo gak random
            const eats = validMoves.filter(m => m.score > 0);
            move = eats.length > 0 ? eats[0] : validMoves[Math.floor(Math.random() * validMoves.length)];
          } else {
            // Hard: Prioritaskan makan
            const eats = validMoves.filter(m => m.score > 0).sort((a,b)=>b.score-a.score);
            move = eats.length > 0 ? eats[0] : validMoves[Math.floor(Math.random() * validMoves.length)];
          }

          const newBoard = board.map(row => [...row]);
          newBoard[move.tr][move.tc] = newBoard[move.fr][move.fc];
          newBoard[move.fr][move.fc] = "";
          setBoard(newBoard);
        }
        setTurn("w");
        setMsg("Giliranmu (Putih)");
      }, 1000);
    }
  }, [turn, board, level]);

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-2">
      <div className="bg-[#1c1c1e] border border-zinc-700 rounded-2xl w-full max-w-sm p-4 relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-zinc-400"><X size={20}/></button>
        <h2 className="text-white font-bold text-center mb-2">Catur (Level: {level})</h2>
        <p className="text-xs text-center text-zinc-400 mb-2">{msg}</p>
        
        <div className="grid grid-cols-8 border-2 border-zinc-600 w-full aspect-square mb-4">
          {board.map((row, r) => row.map((cell, c) => (
            <div key={`${r}-${c}`} onClick={() => handleClick(r,c)} className={`flex items-center justify-center text-2xl sm:text-3xl cursor-pointer ${(r+c)%2 === 0 ? 'bg-zinc-300' : 'bg-zinc-500'} ${selected?.r === r && selected?.c === c ? 'border-2 border-blue-500' : ''}`}>
              {piecesEmoji[cell] || ""}
            </div>
          )))}
        </div>
        <button onClick={() => { setBoard(initialBoard); setTurn('w'); }} className="w-full bg-zinc-600 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2"><RotateCcw size={16}/> Reset</button>
      </div>
    </div>
  );
}

// ==========================================
// 2. UNO ENGINE (Warna + NPC)
// ==========================================
export function GameUno({ onClose }) {
  const colors = ["merah", "biru", "hijau", "kuning"];
  const colorBg = { merah: "bg-red-600", biru: "bg-blue-600", hijau: "bg-green-600", kuning: "bg-yellow-500" };
  const npcNames = ["Budi", "Siti", "Joko"];

  const generateCard = () => ({
    color: colors[Math.floor(Math.random() * 4)],
    num: Math.floor(Math.random() * 9) + 1
  });

  const [deck, setDeck] = useState({ target: generateCard() });
  const [playerHand, setPlayerHand] = useState([generateCard(), generateCard(), generateCard(), generateCard(), generateCard()]);
  const [npcs, setNpcs] = useState(npcNames.map(n => ({ name: n, count: 5 }))); // Simplifikasi: NPC cuma punya jumlah kartu
  const [msg, setMsg] = useState("Pilih kartu yang warnanya/angkanya sama!");

  const playCard = (index) => {
    const card = playerHand[index];
    const isMatch = card.color === deck.target.color || card.num === deck.target.num;

    if (isMatch) {
      setDeck({ target: card });
      const newHand = [...playerHand]; newHand.splice(index, 1);
      setPlayerHand(newHand);
      setMsg("NPC beraksi...");

      setTimeout(() => {
        // NPC Logic (Simpel)
        const newNpcs = [...npcs];
        let npcPlayed = false;
        for (let i = 0; i < newNpcs.length; i++) {
            if (Math.random() > 0.3 && newNpcs[i].count > 0) {
                newNpcs[i].count--;
                npcPlayed = true;
                setMsg(`${newNpcs[i].name} membuang kartu!`);
                break;
            }
        }
        if (!npcPlayed) setMsg("NPC ambil kartu...");
        setNpcs(newNpcs);
        
        if (newHand.length === 0) setMsg("KAMU MENANG! 🎉");
      }, 1500);

    } else {
      setMsg("Kartu tidak cocok!");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-2">
      <div className="bg-[#1c1c1e] border border-zinc-700 rounded-2xl w-full max-w-sm p-4 relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-zinc-400"><X size={20}/></button>
        <h2 className="text-white font-bold text-center mb-2">Uno</h2>
        <p className="text-xs text-center text-zinc-400 mb-4">{msg}</p>

        {/* NPC Hand */}
        <div className="flex justify-center gap-4 mb-6">
          {npcs.map((npc, i) => (
             <div key={i} className="flex flex-col items-center">
               <div className="flex -space-x-3">
                 {Array.from({length: Math.max(0, npc.count)}).map((_, j) => (
                    <div key={j} className="w-6 h-10 bg-zinc-700 border border-zinc-500 rounded-sm"></div>
                 ))}
               </div>
               <span className="text-[10px] text-zinc-400 mt-1">{npc.name} ({npc.count})</span>
             </div>
          ))}
        </div>

        {/* Deck Target */}
        <div className="flex justify-center mb-6">
          <div className={`w-24 h-32 rounded-xl flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-lg ${colorBg[deck.target.color]}`}>
            {deck.target.num}
          </div>
        </div>

        {/* Player Hand */}
        <div className="flex justify-center gap-2 mb-4 overflow-x-auto pb-2">
          {playerHand.map((card, i) => (
            <button key={i} onClick={() => playCard(i)} className={`w-16 h-24 rounded-lg flex items-center justify-center text-white text-2xl font-bold shadow-md transition-transform hover:-translate-y-2 border-2 border-white/50 ${colorBg[card.color]}`}>
              {card.num}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. ULAR TANGGA (4 Pemain, Board Asli)
// ==========================================
export function GameUlarTangga({ onClose }) {
  // Board 10x10 (100 kotak)
  const totalCells = 100;
  const [positions, setPositions] = useState([1, 1, 1, 1]); // [Player, NPC1, NPC2, NPC3]
  const [turn, setTurn] = useState(0); // 0 = Player
  const [dice, setDice] = useState(0);
  const [msg, setMsg] = useState("Lempar dadu untuk jalan!");

  const playerColors = ["bg-red-500", "bg-yellow-500", "bg-green-500", "bg-blue-500"];
  const playerNames = ["Kamu", "Budi (NPC)", "Siti (NPC)", "Joko (NPC)"];

  // Ular & Tangga Map (posisi 1-100)
  const snakes = { 16: 6, 47: 26, 49: 11, 56: 53, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 98: 78 };
  const ladders = { 1: 38, 4: 14, 9: 31, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 80: 100 };

  const rollDice = () => {
    if (turn !== 0) return;
    const d = Math.floor(Math.random() * 6) + 1;
    setDice(d);
    let newPos = positions[0] + d;
    
    if (newPos > 100) newPos = 100 - (newPos - 100); // Mundur kalo lewat
    if (snakes[newPos]) { setMsg(`Kena ular! Turun ke ${snakes[newPos]}`); newPos = snakes[newPos]; }
    else if (ladders[newPos]) { setMsg(`Naik tangga! Ke ${ladders[newPos]}`); newPos = ladders[newPos]; }
    else { setMsg(`Jalan ${d} langkah.`); }

    const newPositions = [...positions];
    newPositions[0] = newPos;
    setPositions(newPositions);

    if (newPos === 100) { setMsg("KAMU MENANG! 🎉"); return; }
    
    setTurn(1); // Giliran NPC 1
  };

  // NPC Auto-Roll
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

  // Generate Grid 10x10
  const renderBoard = () => {
    let cells = [];
    for (let row = 9; row >= 0; row--) {
      let rowCells = [];
      for (let col = 0; col < 10; col++) {
        let num = row * 10 + (row % 2 === 0 ? col + 1 : 10 - col);
        rowCells.push(num);
      }
      if (row % 2 !== 0) rowCells.reverse(); // Zigzag
      cells.push(...rowCells);
    }

    return (
      <div className="grid grid-cols-10 w-full aspect-square border-2 border-zinc-700 bg-zinc-800 mb-4">
        {cells.map((num, i) => {
          // Siapa aja yang di kotak ini
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
// 4. WHO'S THE SPY (6 Pemain, Vote)
// ==========================================
export function GameSpy({ onClose }) {
  const words = [
    { civ: "Apel", spy: "Mangga" },
    { civ: "Kucing", spy: "Anjing" },
    { civ: "Mobil", spy: "Motor" },
    { civ: "Pesawat", spy: "Helikopter" },
    { civ: "Buku", spy: "Majalah" },
  ];
  const npcNames = ["Budi", "Siti", "Joko", "Rina", "Dewi"];

  const [gameState, setGameState] = useState("playing"); // playing | voting | result
  const [selectedWord, setSelectedWord] = useState(null);
  const [isPlayerSpy, setIsPlayerSpy] = useState(false);
  const [votedFor, setVotedFor] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    // Setup Game
    const w = words[Math.floor(Math.random() * words.length)];
    setSelectedWord(w);
    const spyIndex = Math.floor(Math.random() * 6); // 0-5
    if (spyIndex === 0) setIsPlayerSpy(true);
    setMsg("Semua orang udah liat kata. Klik 'Lanjut Vote'");
  }, []);

  const handleVote = (target) => {
    setVotedFor(target);
    setGameState("result");
    if (isPlayerSpy) {
      setMsg(`Kamu SPY! Kata yang benar: ${selectedWord.civ}. Kata kamu: ${selectedWord.spy}.`);
    } else {
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
// 5. TIC TAC TOE (10 Rounds)
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
        let move;
        if (level === "hard") {
          // Simple AI untuk hard
           move = empty[Math.floor(Math.random() * empty.length)];
        } else {
           move = empty[Math.floor(Math.random() * empty.length)];
        }
        const nb = [...board]; nb[move] = "O"; setBoard(nb);
        const w = checkWin(nb);
        if (w) handleEnd(w); else setTurn("X");
      }, 500);
    }
  }, [turn, board]);

  const handleEnd = (winner) => {
    if (winner === "X") {
      setPlayerScore(p => p + 1);
      setMsg("Kamu Menang Ronde Ini!");
    } else if (winner === "O") {
      setNpcScore(n => n + 1);
      setMsg("NPC Menang Ronde Ini!");
    } else {
      setMsg("Seri!");
    }

    setTimeout(() => {
      if (round >= 10) {
         setMsg(`GAME OVER! Skor: ${playerScore} - ${npcScore}`);
      } else {
         setRound(r => r + 1);
         setBoard(Array(9).fill(null));
         setTurn("X");
         setMsg(`Ronde ${round + 1}`);
      }
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-2">
      <div className="bg-[#1c1c1e] border border-zinc-700 rounded-2xl w-full max-w-sm p-4 relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-zinc-400"><X size={20}/></button>
        <h2 className="text-white font-bold text-center mb-2">Tic Tac Toe (Bo10)</h2>
        
        <div className="flex justify-between text-sm text-zinc-300 mb-4 px-4">
           <span>Kamu: {playerScore}</span>
           <span>Ronde: {round}/10</span>
           <span>NPC: {npcScore}</span>
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
