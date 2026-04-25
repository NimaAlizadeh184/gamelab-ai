"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import GameHeader from "@/components/GameHeader";

const COLOR  = "#818CF8";
const COLS   = 10;
const ROWS   = 20;
const CELL   = 28;

// ── Pieces ───────────────────────────────────────────────────────────────────
const PIECES = [
  { shape: [[1,1,1,1]],               color: "#06B6D4" }, // I
  { shape: [[1,1],[1,1]],             color: "#F59E0B" }, // O
  { shape: [[0,1,0],[1,1,1]],         color: "#A855F7" }, // T
  { shape: [[0,1,1],[1,1,0]],         color: "#22C55E" }, // S
  { shape: [[1,1,0],[0,1,1]],         color: "#EF4444" }, // Z
  { shape: [[1,0,0],[1,1,1]],         color: "#3B82F6" }, // J
  { shape: [[0,0,1],[1,1,1]],         color: "#F97316" }, // L
];

type Grid = (string | 0)[][];

function emptyGrid(): Grid {
  return Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
}

function randomPiece() {
  return { ...PIECES[Math.floor(Math.random() * PIECES.length)], x: 3, y: 0 };
}

function rotate(shape: number[][]): number[][] {
  const R = shape.length, C = shape[0].length;
  return Array.from({ length: C }, (_, c) => Array.from({ length: R }, (_, r) => shape[R - 1 - r][c]));
}

function fits(grid: Grid, shape: number[][], x: number, y: number): boolean {
  for (let r = 0; r < shape.length; r++)
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const gr = y + r, gc = x + c;
      if (gr < 0 || gr >= ROWS || gc < 0 || gc >= COLS) return false;
      if (grid[gr][gc]) return false;
    }
  return true;
}

function place(grid: Grid, shape: number[][], x: number, y: number, color: string): Grid {
  const g = grid.map((r) => [...r]) as Grid;
  shape.forEach((row, r) => row.forEach((v, c) => { if (v) g[y + r][x + c] = color; }));
  return g;
}

function clearLines(grid: Grid): { grid: Grid; lines: number } {
  const kept = grid.filter((row) => row.some((c) => !c));
  const lines = ROWS - kept.length;
  const newRows: Grid = Array(lines).fill(null).map(() => Array(COLS).fill(0));
  return { grid: [...newRows, ...kept] as Grid, lines };
}

function ghostY(grid: Grid, shape: number[][], x: number, y: number): number {
  let gy = y;
  while (fits(grid, shape, x, gy + 1)) gy++;
  return gy;
}

const LINE_SCORES = [0, 100, 300, 500, 800];

export default function TetrisPage() {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const previewRef   = useRef<HTMLCanvasElement>(null);
  const stateRef     = useRef({
    grid:    emptyGrid(),
    piece:   randomPiece(),
    next:    randomPiece(),
    score:   0,
    lines:   0,
    level:   1,
    running: false,
    over:    false,
  });
  const loopRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const [score,    setScore]   = useState(0);
  const [lines,    setLines]   = useState(0);
  const [level,    setLevel]   = useState(1);
  const [status,   setStatus]  = useState<"idle"|"running"|"paused"|"over">("idle");

  // ── Draw ───────────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { grid, piece, next } = stateRef.current;

    // Background
    ctx.fillStyle = "#161616";
    ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL);

    // Grid lines
    ctx.strokeStyle = "#1e1e1e";
    ctx.lineWidth = 1;
    for (let r = 0; r <= ROWS; r++) { ctx.beginPath(); ctx.moveTo(0, r * CELL); ctx.lineTo(COLS * CELL, r * CELL); ctx.stroke(); }
    for (let c = 0; c <= COLS; c++) { ctx.beginPath(); ctx.moveTo(c * CELL, 0); ctx.lineTo(c * CELL, ROWS * CELL); ctx.stroke(); }

    // Placed cells
    grid.forEach((row, r) => row.forEach((cell, c) => {
      if (!cell) return;
      ctx.fillStyle = cell as string;
      ctx.beginPath();
      ctx.roundRect(c * CELL + 1, r * CELL + 1, CELL - 2, CELL - 2, 4);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.1)";
      ctx.beginPath();
      ctx.roundRect(c * CELL + 2, r * CELL + 2, CELL - 4, 8, [4, 4, 0, 0]);
      ctx.fill();
    }));

    // Ghost piece
    const gy = ghostY(grid, piece.shape, piece.x, piece.y);
    if (gy !== piece.y) {
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = piece.color;
      piece.shape.forEach((row, r) => row.forEach((v, c) => {
        if (!v) return;
        ctx.beginPath();
        ctx.roundRect((piece.x + c) * CELL + 1, (gy + r) * CELL + 1, CELL - 2, CELL - 2, 4);
        ctx.fill();
      }));
      ctx.globalAlpha = 1;
    }

    // Active piece
    ctx.fillStyle = piece.color;
    piece.shape.forEach((row, r) => row.forEach((v, c) => {
      if (!v) return;
      ctx.beginPath();
      ctx.roundRect((piece.x + c) * CELL + 1, (piece.y + r) * CELL + 1, CELL - 2, CELL - 2, 4);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.beginPath();
      ctx.roundRect((piece.x + c) * CELL + 2, (piece.y + r) * CELL + 2, CELL - 4, 8, [4, 4, 0, 0]);
      ctx.fill();
      ctx.fillStyle = piece.color;
    }));

    // Preview
    const prev = previewRef.current;
    if (!prev) return;
    const pc = prev.getContext("2d");
    if (!pc) return;
    const PS = 24;
    pc.fillStyle = "#1e1e1e";
    pc.fillRect(0, 0, prev.width, prev.height);
    const pw = next.shape[0].length * PS;
    const ph = next.shape.length * PS;
    const ox = Math.floor((prev.width  - pw) / 2);
    const oy = Math.floor((prev.height - ph) / 2);
    pc.fillStyle = next.color;
    next.shape.forEach((row, r) => row.forEach((v, c) => {
      if (!v) return;
      pc.beginPath();
      pc.roundRect(ox + c * PS + 1, oy + r * PS + 1, PS - 2, PS - 2, 3);
      pc.fill();
    }));
  }, []);

  // ── Tick ───────────────────────────────────────────────────────────────────
  const tick = useCallback(() => {
    const s = stateRef.current;
    if (!s.running) return;
    const { grid, piece } = s;

    if (fits(grid, piece.shape, piece.x, piece.y + 1)) {
      s.piece = { ...piece, y: piece.y + 1 };
    } else {
      const placed = place(grid, piece.shape, piece.x, piece.y, piece.color);
      const { grid: cleared, lines: ln } = clearLines(placed);
      const pts = LINE_SCORES[ln] * s.level;
      s.grid    = cleared;
      s.score  += pts;
      s.lines  += ln;
      s.level   = Math.floor(s.lines / 10) + 1;
      setScore(s.score);
      setLines(s.lines);
      setLevel(s.level);

      const nextPiece = { ...s.next, x: 3, y: 0 };
      if (!fits(cleared, nextPiece.shape, nextPiece.x, nextPiece.y)) {
        s.running = false; s.over = true;
        setStatus("over");
        if (loopRef.current) clearInterval(loopRef.current);
        draw(); return;
      }
      s.piece = nextPiece;
      s.next  = randomPiece();

      // Restart loop at new speed
      if (loopRef.current) clearInterval(loopRef.current);
      loopRef.current = setInterval(tick, Math.max(100, 800 - (s.level - 1) * 60));
    }
    draw();
  }, [draw]);

  // ── Input ──────────────────────────────────────────────────────────────────
  const moveLeft  = useCallback(() => { const s = stateRef.current; if (!s.running) return; if (fits(s.grid, s.piece.shape, s.piece.x - 1, s.piece.y)) { s.piece = { ...s.piece, x: s.piece.x - 1 }; draw(); } }, [draw]);
  const moveRight = useCallback(() => { const s = stateRef.current; if (!s.running) return; if (fits(s.grid, s.piece.shape, s.piece.x + 1, s.piece.y)) { s.piece = { ...s.piece, x: s.piece.x + 1 }; draw(); } }, [draw]);
  const moveDown  = useCallback(() => { const s = stateRef.current; if (!s.running) return; if (fits(s.grid, s.piece.shape, s.piece.x, s.piece.y + 1)) { s.piece = { ...s.piece, y: s.piece.y + 1 }; draw(); } }, [draw]);
  const rotatePiece = useCallback(() => {
    const s = stateRef.current;
    if (!s.running) return;
    const rot = rotate(s.piece.shape);
    for (const kick of [0, 1, -1, 2, -2]) {
      if (fits(s.grid, rot, s.piece.x + kick, s.piece.y)) {
        s.piece = { ...s.piece, shape: rot, x: s.piece.x + kick };
        draw(); break;
      }
    }
  }, [draw]);
  const hardDrop = useCallback(() => {
    const s = stateRef.current;
    if (!s.running) return;
    s.piece = { ...s.piece, y: ghostY(s.grid, s.piece.shape, s.piece.x, s.piece.y) };
    draw();
    tick();
  }, [draw, tick]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, () => void> = {
        ArrowLeft: moveLeft, a: moveLeft, A: moveLeft,
        ArrowRight: moveRight, d: moveRight, D: moveRight,
        ArrowDown: moveDown, s: moveDown, S: moveDown,
        ArrowUp: rotatePiece, w: rotatePiece, W: rotatePiece,
        " ": hardDrop,
        p: () => { const s = stateRef.current; if (!s.over) { s.running = !s.running; setStatus(s.running ? "running" : "paused"); if (s.running) { loopRef.current = setInterval(tick, Math.max(100, 800 - (s.level - 1) * 60)); } else if (loopRef.current) clearInterval(loopRef.current); } },
        P: () => { const s = stateRef.current; if (!s.over) { s.running = !s.running; setStatus(s.running ? "running" : "paused"); if (s.running) { loopRef.current = setInterval(tick, Math.max(100, 800 - (s.level - 1) * 60)); } else if (loopRef.current) clearInterval(loopRef.current); } },
      };
      if (map[e.key]) { e.preventDefault(); map[e.key](); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [moveLeft, moveRight, moveDown, rotatePiece, hardDrop, tick]);

  const startGame = useCallback(() => {
    if (loopRef.current) clearInterval(loopRef.current);
    stateRef.current = { grid: emptyGrid(), piece: randomPiece(), next: randomPiece(), score: 0, lines: 0, level: 1, running: true, over: false };
    setScore(0); setLines(0); setLevel(1); setStatus("running");
    loopRef.current = setInterval(tick, 800);
    draw();
  }, [tick, draw]);

  useEffect(() => { draw(); }, [draw]);
  useEffect(() => () => { if (loopRef.current) clearInterval(loopRef.current); }, []);

  return (
    <div className="page">
      <GameHeader title="Tetris" color={COLOR} />
      <main className="page-content">
        <div className="flex gap-5 items-start justify-center flex-wrap">

          {/* Canvas */}
          <div
            className="rounded-2xl overflow-hidden relative"
            style={{ border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)", flexShrink: 0 }}
          >
            <canvas ref={canvasRef} width={COLS * CELL} height={ROWS * CELL} />
            {status !== "running" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-5"
                style={{ background: "rgba(16,16,16,0.92)" }}>
                {status === "over" && (
                  <div className="text-center">
                    <div className="text-xl font-bold mb-1" style={{ color: "var(--error)" }}>Game Over</div>
                    <div className="text-sm" style={{ color: "var(--text-muted)" }}>Score: <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{score}</span></div>
                  </div>
                )}
                {status === "idle" && (
                  <div className="text-center px-6">
                    <div className="text-4xl mb-3">🎮</div>
                    <div className="text-sm" style={{ color: "var(--text-secondary)" }}>Arrow keys / WASD to move<br />↑ or W to rotate · Space to drop</div>
                  </div>
                )}
                {status === "paused" && (
                  <div className="text-lg font-bold" style={{ color: COLOR }}>Paused</div>
                )}
                <button className="btn btn-primary btn-lg" style={{ background: COLOR }} onClick={startGame}>
                  {status === "idle" ? "Start game" : "Play again"}
                </button>
              </div>
            )}
          </div>

          {/* Side panel */}
          <div className="flex flex-col gap-4" style={{ width: 130 }}>
            <div className="card p-4">
              <div className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Score</div>
              <div className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{score}</div>
            </div>
            <div className="card p-4">
              <div className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Level</div>
              <div className="text-xl font-bold" style={{ color: COLOR }}>{level}</div>
            </div>
            <div className="card p-4">
              <div className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Lines</div>
              <div className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{lines}</div>
            </div>
            <div className="card p-4">
              <div className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>Next</div>
              <canvas ref={previewRef} width={96} height={72} className="block" style={{ borderRadius: 8 }} />
            </div>
            {status === "running" && (
              <button className="btn btn-secondary btn-sm w-full" onClick={() => {
                const s = stateRef.current;
                s.running = false; setStatus("paused");
                if (loopRef.current) clearInterval(loopRef.current);
              }}>Pause</button>
            )}
            {status === "paused" && (
              <button className="btn btn-primary btn-sm w-full" style={{ background: COLOR }} onClick={() => {
                const s = stateRef.current;
                s.running = true; setStatus("running");
                loopRef.current = setInterval(tick, Math.max(100, 800 - (s.level - 1) * 60));
              }}>Resume</button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
