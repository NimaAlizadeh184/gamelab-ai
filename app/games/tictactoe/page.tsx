"use client";

import { useState, useCallback } from "react";
import GameHeader from "@/components/GameHeader";

const COLOR = "#3B82F6";

type Player = "X" | "O";
type Cell = Player | null;
type Board = Cell[];
type Mode = "local" | "ai";

const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function checkWinner(board: Board): { winner: Player; line: number[] } | null {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c])
      return { winner: board[a] as Player, line };
  }
  return null;
}

function minimax(board: Board, isMax: boolean): number {
  const r = checkWinner(board);
  if (r?.winner === "O") return 10;
  if (r?.winner === "X") return -10;
  if (board.every(Boolean)) return 0;
  let best = isMax ? -Infinity : Infinity;
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = isMax ? "O" : "X";
      const v = minimax(board, !isMax);
      board[i] = null;
      best = isMax ? Math.max(best, v) : Math.min(best, v);
    }
  }
  return best;
}

function getBestMove(board: Board): number {
  let bestVal = -Infinity, bestMove = -1;
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = "O";
      const v = minimax(board, false);
      board[i] = null;
      if (v > bestVal) { bestVal = v; bestMove = i; }
    }
  }
  return bestMove;
}

export default function TicTacToePage() {
  const [mode, setMode] = useState<Mode | null>(null);
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [current, setCurrent] = useState<Player>("X");
  const [thinking, setThinking] = useState(false);

  const result = checkWinner(board);
  const isDraw = !result && board.every(Boolean);
  const isOver = !!result || isDraw;
  const winLine = result?.line ?? [];

  const reset = useCallback(() => {
    setBoard(Array(9).fill(null));
    setCurrent("X");
    setThinking(false);
  }, []);

  const handleCell = useCallback((i: number) => {
    if (board[i] || isOver || thinking) return;
    const nb = [...board];
    nb[i] = current;
    setBoard(nb);
    const nr = checkWinner(nb);
    if (nr || nb.every(Boolean)) return;
    if (mode === "ai" && current === "X") {
      setThinking(true);
      setTimeout(() => {
        const ab = [...nb];
        const m = getBestMove(ab);
        if (m !== -1) ab[m] = "O";
        setBoard(ab);
        setCurrent("X");
        setThinking(false);
      }, 320);
    } else {
      setCurrent(current === "X" ? "O" : "X");
    }
  }, [board, current, isOver, mode, thinking]);

  const xColor = COLOR;
  const oColor = "var(--text-primary)";

  if (!mode) {
    return (
      <div className="page">
        <GameHeader title="Tic-Tac-Toe" color={COLOR} />
        <main className="page-content justify-center">
          <div className="game-container" style={{ maxWidth: 320 }}>
            <div className="text-center mb-10">
              <div className="text-5xl mb-5">⭕</div>
              <h2 className="text-xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Choose a mode</h2>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Play locally or face the AI</p>
            </div>
            <div className="flex flex-col gap-3">
              <button className="btn btn-secondary btn-lg w-full" onClick={() => { setMode("local"); reset(); }}>
                👥 Local — 2 Players
              </button>
              <button className="btn btn-primary btn-lg w-full" onClick={() => { setMode("ai"); reset(); }}
                style={{ background: COLOR }}>
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
      <GameHeader title="Tic-Tac-Toe" color={COLOR} />
      <main className="page-content">
        <div className="game-container" style={{ maxWidth: 340 }}>

          <div className="flex items-center justify-between mb-6">
            <span
              className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{ background: `${COLOR}18`, color: COLOR, border: `1px solid ${COLOR}35` }}
            >
              {mode === "ai" ? "vs AI" : "2 Players"}
            </span>
            <button className="btn btn-ghost btn-sm" onClick={() => setMode(null)}>
              Change mode
            </button>
          </div>

          {/* Board */}
          <div className="card p-3 mb-5" style={{ boxShadow: "var(--shadow-md)" }}>
            <div className="grid grid-cols-3 gap-2">
              {board.map((cell, i) => {
                const isWin = winLine.includes(i);
                return (
                  <button
                    key={i}
                    onClick={() => handleCell(i)}
                    disabled={!!cell || isOver || thinking}
                    className="aspect-square rounded-xl text-3xl font-bold flex items-center justify-center transition-all duration-150"
                    style={{
                      background: isWin ? `${COLOR}18` : "var(--bg-secondary)",
                      border: `1px solid ${isWin ? COLOR + "50" : "var(--border-subtle)"}`,
                      color: cell === "X" ? xColor : oColor,
                      cursor: cell || isOver || thinking ? "default" : "pointer",
                    }}
                    onMouseEnter={(e) => { if (!cell && !isOver && !thinking) e.currentTarget.style.background = "var(--bg-card-hover)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = isWin ? `${COLOR}18` : "var(--bg-secondary)"; }}
                  >
                    {cell}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status */}
          <div
            className="rounded-xl px-4 py-3 mb-4 text-center text-sm"
            style={{
              background: isOver
                ? isDraw ? "var(--warning-dim)" : result?.winner === "X" && mode === "ai" ? "var(--success-dim)" : result?.winner === "O" && mode === "ai" ? "var(--error-dim)" : "var(--success-dim)"
                : "var(--bg-card)",
              border: `1px solid ${isOver
                ? isDraw ? "var(--warning-dim)" : result?.winner === "X" && mode === "ai" ? "var(--success-border)" : result?.winner === "O" && mode === "ai" ? "var(--error-border)" : "var(--success-border)"
                : "var(--border)"}`,
              color: isOver
                ? isDraw ? "var(--warning)" : result?.winner === "X" && mode === "ai" ? "var(--success)" : result?.winner === "O" && mode === "ai" ? "var(--error)" : "var(--success)"
                : "var(--text-secondary)",
            }}
          >
            {isOver
              ? isDraw ? "It's a draw!"
                : mode === "ai" ? result?.winner === "X" ? "You win! 🎉" : "AI wins."
                : `Player ${result?.winner} wins! 🎉`
              : thinking ? "AI is thinking…"
              : mode === "ai" ? current === "X" ? "Your turn (X)" : "AI's turn (O)"
              : `Player ${current}'s turn`}
          </div>

          <button className="btn btn-secondary w-full" onClick={reset}>New game</button>
        </div>
      </main>
    </div>
  );
}
