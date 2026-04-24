"use client";

import { useState, useCallback } from "react";
import GameHeader from "@/components/GameHeader";

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
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a] as Player, line };
    }
  }
  return null;
}

function minimax(board: Board, isMaximizing: boolean): number {
  const result = checkWinner(board);
  if (result?.winner === "O") return 10;
  if (result?.winner === "X") return -10;
  if (board.every(Boolean)) return 0;

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = "O";
        best = Math.max(best, minimax(board, false));
        board[i] = null;
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = "X";
        best = Math.min(best, minimax(board, true));
        board[i] = null;
      }
    }
    return best;
  }
}

function getBestMove(board: Board): number {
  let bestVal = -Infinity;
  let bestMove = -1;
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = "O";
      const moveVal = minimax(board, false);
      board[i] = null;
      if (moveVal > bestVal) {
        bestVal = moveVal;
        bestMove = i;
      }
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

  const reset = useCallback(() => {
    setBoard(Array(9).fill(null));
    setCurrent("X");
    setThinking(false);
  }, []);

  const handleCell = useCallback(
    (index: number) => {
      if (board[index] || isOver || thinking) return;

      const newBoard = [...board];
      newBoard[index] = current;
      setBoard(newBoard);

      const nextResult = checkWinner(newBoard);
      const nextDraw = !nextResult && newBoard.every(Boolean);
      if (nextResult || nextDraw) return;

      if (mode === "ai" && current === "X") {
        setThinking(true);
        setTimeout(() => {
          const aiBoard = [...newBoard];
          const move = getBestMove(aiBoard);
          if (move !== -1) aiBoard[move] = "O";
          setBoard(aiBoard);
          setCurrent("X");
          setThinking(false);
        }, 300);
      } else {
        setCurrent(current === "X" ? "O" : "X");
      }
    },
    [board, current, isOver, mode, thinking]
  );

  const winLine = result?.line ?? [];

  if (!mode) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-primary)" }}>
        <GameHeader title="Tic-Tac-Toe" />
        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-xs">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">⭕</div>
              <h2 className="text-xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                Choose a mode
              </h2>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Play locally or face the AI
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => { setMode("local"); reset(); }}
                className="w-full py-3 rounded-xl text-sm font-medium transition-all duration-150"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              >
                👥 Local — 2 Players
              </button>
              <button
                onClick={() => { setMode("ai"); reset(); }}
                className="w-full py-3 rounded-xl text-sm font-medium transition-all duration-150"
                style={{ background: "var(--accent)", color: "#fff", border: "none" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
              >
                🤖 vs AI
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-primary)" }}>
      <GameHeader title="Tic-Tac-Toe" />
      <main className="flex-1 flex flex-col items-center px-6 py-10">
        <div className="w-full max-w-xs">

          {/* Mode badge + change */}
          <div className="flex items-center justify-between mb-8">
            <span
              className="text-xs px-2.5 py-1 rounded-full"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
            >
              {mode === "ai" ? "vs AI" : "2 Players"}
            </span>
            <button
              onClick={() => setMode(null)}
              className="text-xs transition-colors"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              Change mode
            </button>
          </div>

          {/* Board */}
          <div
            className="rounded-2xl p-3 mb-5"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <div className="grid grid-cols-3 gap-2">
              {board.map((cell, i) => {
                const isWinCell = winLine.includes(i);
                return (
                  <button
                    key={i}
                    onClick={() => handleCell(i)}
                    disabled={!!cell || isOver || thinking}
                    className="aspect-square rounded-xl text-3xl font-bold flex items-center justify-center transition-all duration-150"
                    style={{
                      background: isWinCell ? "var(--accent-dim)" : "var(--bg-secondary)",
                      border: isWinCell ? "1px solid var(--accent)" : "1px solid var(--border-subtle)",
                      color: cell === "X" ? "var(--accent)" : "var(--text-primary)",
                      cursor: cell || isOver || thinking ? "default" : "pointer",
                    }}
                    onMouseEnter={(e) => {
                      if (!cell && !isOver && !thinking)
                        e.currentTarget.style.background = "var(--bg-card-hover)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isWinCell ? "var(--accent-dim)" : "var(--bg-secondary)";
                    }}
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
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            {isOver ? (
              <span style={{ color: "var(--accent)" }}>
                {isDraw
                  ? "It's a draw!"
                  : mode === "ai"
                  ? result?.winner === "X" ? "You win! 🎉" : "AI wins!"
                  : `Player ${result?.winner} wins! 🎉`}
              </span>
            ) : thinking ? (
              <span style={{ color: "var(--text-muted)" }}>AI is thinking…</span>
            ) : (
              <span style={{ color: "var(--text-secondary)" }}>
                {mode === "ai"
                  ? current === "X" ? "Your turn (X)" : "AI's turn (O)"
                  : `Player ${current}'s turn`}
              </span>
            )}
          </div>

          <button
            onClick={reset}
            className="w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
          >
            New game
          </button>
        </div>
      </main>
    </div>
  );
}
