"use client";

import { useState, useCallback } from "react";
import BackButton from "@/components/BackButton";

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
      <main className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: "var(--bg-primary)" }}>
        <div className="w-full max-w-sm">
          <div className="mb-10">
            <BackButton />
          </div>
          <div className="text-4xl mb-4 text-center">⭕</div>
          <h1 className="text-2xl font-semibold text-center mb-2" style={{ color: "var(--text-primary)" }}>
            Tic-Tac-Toe
          </h1>
          <p className="text-center text-sm mb-10" style={{ color: "var(--text-secondary)" }}>
            Choose a game mode to start
          </p>
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
              style={{ background: "var(--accent)", color: "#fff", border: "1px solid var(--accent)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
            >
              🤖 vs AI
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center px-6 py-10" style={{ background: "var(--bg-primary)" }}>
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-10">
          <BackButton />
          <button
            onClick={() => setMode(null)}
            className="text-xs px-3 py-1.5 rounded-lg transition-colors"
            style={{ color: "var(--text-muted)", background: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            Change mode
          </button>
        </div>

        <h1 className="text-xl font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
          Tic-Tac-Toe
        </h1>
        <p className="text-xs mb-8" style={{ color: "var(--text-muted)" }}>
          {mode === "ai" ? "You are X — AI plays O" : "Player X vs Player O"}
        </p>

        <div
          className="rounded-2xl p-4 mb-6"
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
                  className="aspect-square rounded-xl text-3xl font-bold transition-all duration-150 flex items-center justify-center"
                  style={{
                    background: isWinCell ? "var(--accent-dim)" : "var(--bg-secondary)",
                    border: isWinCell ? "1px solid var(--accent)" : "1px solid var(--border-subtle)",
                    color: cell === "X" ? "var(--accent)" : "var(--text-primary)",
                    cursor: cell || isOver || thinking ? "default" : "pointer",
                  }}
                  onMouseEnter={(e) => {
                    if (!cell && !isOver && !thinking) {
                      e.currentTarget.style.background = "var(--bg-card-hover)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isWinCell) e.currentTarget.style.background = "var(--bg-secondary)";
                    else e.currentTarget.style.background = "var(--accent-dim)";
                  }}
                >
                  {cell}
                </button>
              );
            })}
          </div>
        </div>

        <div
          className="rounded-xl px-4 py-3 mb-6 text-center text-sm"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          {isOver ? (
            <span style={{ color: "var(--accent)" }}>
              {isDraw
                ? "It's a draw!"
                : mode === "ai"
                ? result?.winner === "X"
                  ? "You win! 🎉"
                  : "AI wins!"
                : `Player ${result?.winner} wins! 🎉`}
            </span>
          ) : thinking ? (
            <span style={{ color: "var(--text-muted)" }}>AI is thinking…</span>
          ) : (
            <span style={{ color: "var(--text-secondary)" }}>
              {mode === "ai"
                ? current === "X"
                  ? "Your turn (X)"
                  : "AI's turn (O)"
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
  );
}
