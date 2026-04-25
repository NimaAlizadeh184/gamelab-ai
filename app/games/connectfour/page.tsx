"use client";

import { useState, useCallback } from "react";
import GameHeader from "@/components/GameHeader";

const COLOR  = "#F472B6";
const ROWS   = 6;
const COLS   = 7;

type Cell    = 0 | 1 | 2;
type Board   = Cell[][];
type Mode    = "local" | "ai";
type Phase   = "idle" | "playing" | "won" | "draw";

const P1_COLOR = "#EF4444";  // red
const P2_COLOR = "#F59E0B";  // amber

function emptyBoard(): Board {
  return Array(ROWS).fill(null).map(() => Array(COLS).fill(0) as Cell[]);
}

function drop(board: Board, col: number, player: 1 | 2): Board | null {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === 0) {
      const nb = board.map((row) => [...row]) as Board;
      nb[r][col] = player;
      return nb;
    }
  }
  return null;
}

function findWin(board: Board): { player: 1 | 2; cells: [number, number][] } | null {
  const dirs = [[0,1],[1,0],[1,1],[1,-1]];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const p = board[r][c] as 1 | 2;
      if (!p) continue;
      for (const [dr, dc] of dirs) {
        const cells: [number, number][] = [[r, c]];
        for (let k = 1; k < 4; k++) {
          const nr = r + dr * k, nc = c + dc * k;
          if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS || board[nr][nc] !== p) break;
          cells.push([nr, nc]);
        }
        if (cells.length === 4) return { player: p, cells };
      }
    }
  }
  return null;
}

function isDraw(board: Board) { return board[0].every((c) => c !== 0); }

// ── AI (minimax α-β, depth 6) ───────────────────────────────────────────────
function score4(window: Cell[], player: 1 | 2): number {
  const opp   = player === 1 ? 2 : 1;
  const mine  = window.filter((c) => c === player).length;
  const empty = window.filter((c) => c === 0).length;
  const theirs= window.filter((c) => c === opp).length;
  if (mine === 4) return 100;
  if (theirs === 3 && empty === 1) return -80;
  if (mine === 3 && empty === 1) return 5;
  if (mine === 2 && empty === 2) return 2;
  return 0;
}

function evalBoard(board: Board, player: 1 | 2): number {
  let sc = 0;
  const center = board.map((r) => r[Math.floor(COLS / 2)]);
  sc += center.filter((c) => c === player).length * 3;

  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c <= COLS - 4; c++)
      sc += score4([board[r][c],board[r][c+1],board[r][c+2],board[r][c+3]], player);

  for (let c = 0; c < COLS; c++)
    for (let r = 0; r <= ROWS - 4; r++)
      sc += score4([board[r][c],board[r+1][c],board[r+2][c],board[r+3][c]], player);

  for (let r = 0; r <= ROWS - 4; r++) {
    for (let c = 0; c <= COLS - 4; c++)
      sc += score4([board[r][c],board[r+1][c+1],board[r+2][c+2],board[r+3][c+3]], player);
    for (let c = 3; c < COLS; c++)
      sc += score4([board[r][c],board[r+1][c-1],board[r+2][c-2],board[r+3][c-3]], player);
  }
  return sc;
}

function minimax(board: Board, depth: number, alpha: number, beta: number, maximizing: boolean): number {
  const win = findWin(board);
  if (win) return win.player === 2 ? 10000 + depth : -10000 - depth;
  if (isDraw(board) || depth === 0) return evalBoard(board, 2);

  const valid = Array.from({ length: COLS }, (_, i) => i).filter((c) => board[0][c] === 0);
  if (maximizing) {
    let best = -Infinity;
    for (const c of valid) {
      const nb = drop(board, c, 2)!;
      best = Math.max(best, minimax(nb, depth - 1, alpha, beta, false));
      alpha = Math.max(alpha, best);
      if (alpha >= beta) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const c of valid) {
      const nb = drop(board, c, 1)!;
      best = Math.min(best, minimax(nb, depth - 1, alpha, beta, true));
      beta = Math.min(beta, best);
      if (alpha >= beta) break;
    }
    return best;
  }
}

function getBestCol(board: Board): number {
  let best = -Infinity, bestCol = 3;
  for (let c = 0; c < COLS; c++) {
    if (board[0][c] !== 0) continue;
    const nb = drop(board, c, 2)!;
    const v  = minimax(nb, 5, -Infinity, Infinity, false);
    if (v > best) { best = v; bestCol = c; }
  }
  return bestCol;
}

export default function ConnectFourPage() {
  const [mode,    setMode]    = useState<Mode | null>(null);
  const [board,   setBoard]   = useState<Board>(emptyBoard());
  const [current, setCurrent] = useState<1 | 2>(1);
  const [phase,   setPhase]   = useState<Phase>("idle");
  const [win,     setWin]     = useState<{ player: 1|2; cells: [number,number][] } | null>(null);
  const [hover,   setHover]   = useState<number | null>(null);
  const [thinking,setThinking]= useState(false);

  const reset = useCallback(() => {
    setBoard(emptyBoard()); setCurrent(1);
    setPhase("playing"); setWin(null); setThinking(false);
  }, []);

  const handleDrop = useCallback((col: number) => {
    if (phase !== "playing" || thinking) return;
    if (board[0][col] !== 0) return;

    const nb = drop(board, col, current)!;
    const w  = findWin(nb);
    const d  = !w && isDraw(nb);

    setBoard(nb);
    if (w) { setWin(w); setPhase("won"); return; }
    if (d) { setPhase("draw"); return; }

    if (mode === "ai" && current === 1) {
      setCurrent(2);
      setThinking(true);
      setTimeout(() => {
        const aiCol = getBestCol(nb);
        const ab = drop(nb, aiCol, 2)!;
        const aw = findWin(ab);
        const ad = !aw && isDraw(ab);
        setBoard(ab);
        if (aw) { setWin(aw); setPhase("won"); }
        else if (ad) setPhase("draw");
        else setCurrent(1);
        setThinking(false);
      }, 300);
    } else {
      setCurrent(current === 1 ? 2 : 1);
    }
  }, [board, current, phase, mode, thinking]);

  const winCells = new Set(win?.cells.map(([r, c]) => `${r}-${c}`));
  const currentColor = current === 1 ? P1_COLOR : P2_COLOR;

  if (!mode) {
    return (
      <div className="page">
        <GameHeader title="Connect Four" color={COLOR} />
        <main className="page-content justify-center">
          <div className="game-container" style={{ maxWidth: 320 }}>
            <div className="text-center mb-10">
              <div className="text-5xl mb-5">🔴</div>
              <h2 className="text-xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Connect Four</h2>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Drop discs, connect four to win</p>
            </div>
            <div className="flex flex-col gap-3">
              <button className="btn btn-secondary btn-lg w-full" onClick={() => { setMode("local"); reset(); }}>
                👥 Local — 2 Players
              </button>
              <button className="btn btn-primary btn-lg w-full" style={{ background: COLOR }} onClick={() => { setMode("ai"); reset(); }}>
                🤖 vs AI
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page">
      <GameHeader title="Connect Four" color={COLOR} />
      <main className="page-content">
        <div className="game-container flex flex-col items-center" style={{ maxWidth: 480 }}>

          {/* Status bar */}
          <div className="flex items-center justify-between w-full mb-5">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ background: P1_COLOR }} />
              <span className="text-xs font-medium" style={{ color: current === 1 && phase === "playing" ? "var(--text-primary)" : "var(--text-muted)" }}>
                {mode === "ai" ? "You" : "Player 1"}
              </span>
            </div>

            <div
              className="text-xs font-medium px-3 py-1.5 rounded-lg"
              style={{
                background: phase === "won" ? (win?.player === 1 ? "var(--success-dim)" : "var(--error-dim)") : phase === "draw" ? "var(--accent-dim)" : "var(--bg-card)",
                color: phase === "won" ? (win?.player === 1 ? "var(--success)" : "var(--error)") : phase === "draw" ? "var(--accent)" : "var(--text-muted)",
                border: `1px solid ${phase === "won" ? (win?.player === 1 ? "var(--success-border)" : "var(--error-border)") : "var(--border)"}`,
              }}
            >
              {phase === "playing"
                ? thinking ? "AI thinking…"
                : mode === "ai" ? current === 1 ? "Your turn" : "AI's turn"
                : `Player ${current}'s turn`
              : phase === "won"
                ? mode === "ai" ? win?.player === 1 ? "You win! 🎉" : "AI wins."
                : `Player ${win?.player} wins! 🎉`
              : "It's a draw!"}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium" style={{ color: current === 2 && phase === "playing" ? "var(--text-primary)" : "var(--text-muted)" }}>
                {mode === "ai" ? "AI" : "Player 2"}
              </span>
              <div className="w-4 h-4 rounded-full" style={{ background: P2_COLOR }} />
            </div>
          </div>

          {/* Board */}
          <div
            className="rounded-2xl p-2 relative"
            style={{ background: "#1a2a4a", border: "1px solid #1e3560", boxShadow: "var(--shadow-lg)" }}
          >
            {/* Column hover targets */}
            <div className="absolute inset-x-2 top-0 flex" style={{ height: 32, zIndex: 5 }}>
              {Array.from({ length: COLS }).map((_, c) => (
                <div
                  key={c}
                  className="flex-1 flex items-center justify-center cursor-pointer"
                  onMouseEnter={() => setHover(c)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => handleDrop(c)}
                >
                  {hover === c && phase === "playing" && !thinking && board[0][c] === 0 && (
                    <div className="w-5 h-5 rounded-full" style={{ background: currentColor, opacity: 0.85 }} />
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-1 mt-8">
              {board.map((row, r) => (
                <div key={r} className="flex gap-1">
                  {row.map((cell, c) => {
                    const isWin = winCells.has(`${r}-${c}`);
                    return (
                      <div
                        key={c}
                        className="rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer"
                        style={{ width: 52, height: 52, background: "#122040", boxShadow: "inset 0 2px 6px rgba(0,0,0,0.5)" }}
                        onClick={() => handleDrop(c)}
                        onMouseEnter={() => setHover(c)}
                        onMouseLeave={() => setHover(null)}
                      >
                        {cell !== 0 && (
                          <div
                            className="rounded-full transition-all duration-100"
                            style={{
                              width: isWin ? 44 : 40,
                              height: isWin ? 44 : 40,
                              background: cell === 1 ? P1_COLOR : P2_COLOR,
                              boxShadow: isWin
                                ? `0 0 0 3px ${cell === 1 ? P1_COLOR : P2_COLOR}60, 0 0 16px ${cell === 1 ? P1_COLOR : P2_COLOR}`
                                : `inset 0 -3px 6px rgba(0,0,0,0.25)`,
                              transition: "box-shadow 0.2s",
                            }}
                          />
                        )}
                        {cell === 0 && hover === c && phase === "playing" && !thinking && board[0][c] === 0 && (
                          <div className="rounded-full" style={{ width: 40, height: 40, background: currentColor, opacity: 0.2 }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 mt-6 w-full" style={{ maxWidth: 380 }}>
            <button className="btn btn-secondary flex-1" onClick={reset}>New game</button>
            <button className="btn btn-ghost flex-1" onClick={() => setMode(null)}>Change mode</button>
          </div>
        </div>
      </main>
    </div>
  );
}
