"use client";

import { useState, useCallback, useEffect } from "react";
import GameHeader from "@/components/GameHeader";

const COLOR = "#F97316";

type Difficulty = "easy" | "medium" | "hard";

const CONFIGS: Record<Difficulty, { rows: number; cols: number; mines: number }> = {
  easy:   { rows: 9,  cols: 9,  mines: 10 },
  medium: { rows: 12, cols: 12, mines: 25 },
  hard:   { rows: 16, cols: 16, mines: 40 },
};

interface Cell {
  mine: boolean;
  revealed: boolean;
  flagged: boolean;
  adj: number;
}

type Board = Cell[][];
type Phase = "idle" | "playing" | "won" | "lost";

function buildBoard(rows: number, cols: number): Board {
  return Array(rows).fill(null).map(() =>
    Array(cols).fill(null).map(() => ({ mine: false, revealed: false, flagged: false, adj: 0 }))
  );
}

function placeMines(board: Board, rows: number, cols: number, mines: number, safeR: number, safeC: number): Board {
  const b = board.map((r) => r.map((c) => ({ ...c })));
  let placed = 0;
  while (placed < mines) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (!b[r][c].mine && !(Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1)) {
      b[r][c].mine = true;
      placed++;
    }
  }
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      if (b[r][c].mine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && b[nr][nc].mine) count++;
        }
      b[r][c].adj = count;
    }
  return b;
}

function reveal(board: Board, rows: number, cols: number, r: number, c: number): Board {
  const b = board.map((row) => row.map((cell) => ({ ...cell })));
  const queue: [number, number][] = [[r, c]];
  while (queue.length) {
    const [cr, cc] = queue.shift()!;
    if (cr < 0 || cr >= rows || cc < 0 || cc >= cols) continue;
    const cell = b[cr][cc];
    if (cell.revealed || cell.flagged || cell.mine) continue;
    cell.revealed = true;
    if (cell.adj === 0)
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++)
          if (dr !== 0 || dc !== 0) queue.push([cr + dr, cc + dc]);
  }
  return b;
}

const ADJ_COLORS = ["", "#3B82F6","#22C55E","#EF4444","#7C3AED","#B91C1C","#0891B2","#1F2937","#6B7280"];

export default function MinesweeperPage() {
  const [diff, setDiff] = useState<Difficulty>("easy");
  const [board, setBoard] = useState<Board>(() => buildBoard(CONFIGS.easy.rows, CONFIGS.easy.cols));
  const [phase, setPhase] = useState<Phase>("idle");
  const [minesLeft, setMinesLeft] = useState(CONFIGS.easy.mines);
  const [seconds, setSeconds] = useState(0);
  const [started, setStarted] = useState(false);
  const [firstClick, setFirstClick] = useState(true);

  const { rows, cols, mines } = CONFIGS[diff];

  useEffect(() => {
    if (phase !== "playing") return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const startNew = useCallback((d: Difficulty) => {
    setDiff(d);
    setBoard(buildBoard(CONFIGS[d].rows, CONFIGS[d].cols));
    setPhase("idle");
    setMinesLeft(CONFIGS[d].mines);
    setSeconds(0);
    setFirstClick(true);
    setStarted(true);
  }, []);

  const handleReveal = useCallback((r: number, c: number) => {
    if (phase === "won" || phase === "lost") return;
    if (board[r][c].revealed || board[r][c].flagged) return;

    let b = board;
    let ph: Phase = phase;

    if (firstClick) {
      b = placeMines(b, rows, cols, mines, r, c);
      ph = "playing";
      setPhase("playing");
      setFirstClick(false);
    }

    if (b[r][c].mine) {
      const blown = b.map((row, ri) => row.map((cell, ci) => ({
        ...cell,
        revealed: cell.mine ? true : cell.revealed,
      })));
      setBoard(blown);
      setPhase("lost");
      return;
    }

    const nb = reveal(b, rows, cols, r, c);
    const won = nb.every((row) => row.every((cell) => cell.mine || cell.revealed));
    setBoard(nb);
    if (won) setPhase("won");
  }, [board, phase, firstClick, rows, cols, mines]);

  const handleFlag = useCallback((e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (phase === "won" || phase === "lost" || board[r][c].revealed) return;
    const nb = board.map((row) => row.map((cell) => ({ ...cell })));
    nb[r][c].flagged = !nb[r][c].flagged;
    setMinesLeft((m) => m + (nb[r][c].flagged ? -1 : 1));
    setBoard(nb);
  }, [board, phase]);

  const cellSize = diff === "hard" ? 28 : diff === "medium" ? 34 : 40;

  if (!started) {
    return (
      <div className="page">
        <GameHeader title="Minesweeper" color={COLOR} />
        <main className="page-content justify-center">
          <div className="game-container" style={{ maxWidth: 340 }}>
            <div className="flex justify-center mb-6">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
                style={{ background: `linear-gradient(145deg, ${COLOR}25, ${COLOR}08)`, border: `1px solid ${COLOR}30` }}
              >
                💣
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center mb-2 tracking-tight" style={{ color: "var(--text-primary)" }}>Minesweeper</h2>
            <p className="text-sm text-center mb-6" style={{ color: "var(--text-secondary)" }}>
              Clear the minefield without hitting a bomb. First click is always safe.
            </p>
            <div className="card p-4 mb-6">
              <div className="text-xs space-y-2" style={{ color: "var(--text-secondary)" }}>
                {[
                  ["Left click", "Reveal a cell"],
                  ["Right click", "Place or remove a flag"],
                  ["Numbers", "Adjacent mine count"],
                ].map(([key, desc]) => (
                  <div key={key} className="flex items-center justify-between gap-3">
                    <span className="px-2 py-0.5 rounded font-mono text-xs shrink-0" style={{ background: "var(--bg-raised)", color: "var(--text-primary)" }}>{key}</span>
                    <span style={{ color: "var(--text-muted)" }}>{desc}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--text-muted)" }}>Choose difficulty</p>
            <div className="flex flex-col gap-3">
              {(["easy","medium","hard"] as Difficulty[]).map((d, i) => {
                const { rows, cols, mines } = CONFIGS[d];
                const labels = ["Easy","Medium","Hard"];
                return (
                  <button
                    key={d}
                    className="btn btn-lg w-full flex items-center justify-between px-5"
                    style={i === 2
                      ? { background: COLOR, color: "#fff", border: "none" }
                      : { background: "var(--bg-card)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
                    onClick={() => startNew(d)}
                    onMouseEnter={(e) => { if (i !== 2) e.currentTarget.style.borderColor = COLOR; }}
                    onMouseLeave={(e) => { if (i !== 2) e.currentTarget.style.borderColor = "var(--border)"; }}
                  >
                    <span className="font-semibold">{labels[i]}</span>
                    <span style={{ fontSize: "0.75rem", opacity: 0.65 }}>{rows}×{cols} · {mines} mines</span>
                  </button>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page">
      <GameHeader title="Minesweeper" color={COLOR} />
      <main className="page-content">
        <div className="game-container flex flex-col items-center" style={{ maxWidth: 640 }}>

          {/* Stats */}
          <div className="flex items-center gap-3 mb-5 w-full" style={{ maxWidth: cols * cellSize + 20 }}>
            <div className="card flex-1 text-center py-2">
              <div className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>💣 Left</div>
              <div className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>{minesLeft}</div>
            </div>
            <div className="card flex-1 text-center py-2">
              <div className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>⏱ Time</div>
              <div className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>{seconds}s</div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => startNew(diff)}>Reset</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setStarted(false)}>Difficulty</button>
          </div>

          {(phase === "won" || phase === "lost") && (
            <div className={`${phase === "won" ? "badge-success" : "badge-error"} rounded-xl px-4 py-2.5 mb-4 text-sm font-medium text-center w-full`}
              style={{ maxWidth: cols * cellSize + 20 }}>
              {phase === "won" ? `You won in ${seconds}s! 🎉` : "Boom! You hit a mine."}
            </div>
          )}

          {/* Board */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: "1px solid var(--border)", boxShadow: "var(--shadow-md)" }}
            onContextMenu={(e) => e.preventDefault()}
          >
            {board.map((row, r) => (
              <div key={r} className="flex">
                {row.map((cell, c) => {
                  const isMineRevealed = cell.mine && cell.revealed;
                  const isNum = cell.revealed && !cell.mine && cell.adj > 0;
                  const isEmpty = cell.revealed && !cell.mine && cell.adj === 0;

                  return (
                    <button
                      key={c}
                      className="flex items-center justify-center font-bold transition-colors duration-75"
                      style={{
                        width: cellSize, height: cellSize,
                        fontSize: cellSize < 32 ? "0.7rem" : "0.875rem",
                        background: isMineRevealed ? "var(--error-dim)"
                          : isEmpty ? "var(--bg-secondary)"
                          : cell.revealed ? "var(--bg-secondary)"
                          : "var(--bg-card)",
                        border: "1px solid var(--border-subtle)",
                        color: isNum ? ADJ_COLORS[cell.adj] : "var(--text-primary)",
                        cursor: cell.revealed ? "default" : "pointer",
                      }}
                      onClick={() => handleReveal(r, c)}
                      onContextMenu={(e) => handleFlag(e, r, c)}
                      onMouseEnter={(e) => { if (!cell.revealed && phase !== "won" && phase !== "lost") e.currentTarget.style.background = "var(--bg-card-hover)"; }}
                      onMouseLeave={(e) => { if (!cell.revealed) e.currentTarget.style.background = "var(--bg-card)"; }}
                    >
                      {cell.flagged && !cell.revealed ? "🚩"
                        : isMineRevealed ? "💣"
                        : cell.revealed && cell.adj > 0 ? cell.adj
                        : ""}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <p className="text-xs text-center mt-4" style={{ color: "var(--text-muted)" }}>
            Left click to reveal · Right click to flag
          </p>
        </div>
      </main>
    </div>
  );
}
