"use client";

import { useState, useEffect, useCallback } from "react";
import GameHeader from "@/components/GameHeader";

const COLOR = "#EF4444";

type Grid = number[][];

const TILE_COLORS: Record<number, { bg: string; color: string }> = {
  0:    { bg: "#262626", color: "transparent" },
  2:    { bg: "#3d3d3d", color: "#f0f0f0" },
  4:    { bg: "#4a4025", color: "#f0f0f0" },
  8:    { bg: "#8b4513", color: "#fff" },
  16:   { bg: "#a0522d", color: "#fff" },
  32:   { bg: "#b85c2a", color: "#fff" },
  64:   { bg: "#cc5500", color: "#fff" },
  128:  { bg: "#c8a020", color: "#fff" },
  256:  { bg: "#c8a020", color: "#fff" },
  512:  { bg: "#b8920a", color: "#fff" },
  1024: { bg: "#a07800", color: "#fff" },
  2048: { bg: "#e8c200", color: "#1a1a1a" },
};

function getColors(n: number) {
  if (n >= 2048) return TILE_COLORS[2048];
  return TILE_COLORS[n] ?? { bg: "#7c4dff", color: "#fff" };
}

function emptyGrid(): Grid {
  return Array(4).fill(null).map(() => Array(4).fill(0));
}

function addTile(g: Grid): Grid {
  const empty: [number, number][] = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) if (g[r][c] === 0) empty.push([r, c]);
  if (!empty.length) return g;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  const ng = g.map((row) => [...row]);
  ng[r][c] = Math.random() < 0.9 ? 2 : 4;
  return ng;
}

function slideRow(row: number[]): { row: number[]; score: number } {
  const filtered = row.filter((n) => n !== 0);
  let score = 0;
  const merged: number[] = [];
  let i = 0;
  while (i < filtered.length) {
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      merged.push(filtered[i] * 2);
      score += filtered[i] * 2;
      i += 2;
    } else {
      merged.push(filtered[i]);
      i++;
    }
  }
  while (merged.length < 4) merged.push(0);
  return { row: merged, score };
}

function moveGrid(g: Grid, dir: "left" | "right" | "up" | "down"): { grid: Grid; score: number; moved: boolean } {
  let grid = g.map((r) => [...r]);
  let totalScore = 0;
  let moved = false;

  const transpose = (m: Grid): Grid => m[0].map((_, c) => m.map((r) => r[c]));
  const reverse   = (m: Grid): Grid => m.map((r) => [...r].reverse());

  if (dir === "right") grid = reverse(grid);
  if (dir === "up")    grid = transpose(grid);
  if (dir === "down")  grid = reverse(transpose(grid));

  grid = grid.map((row) => {
    const { row: nr, score } = slideRow(row);
    totalScore += score;
    if (nr.some((v, i) => v !== row[i])) moved = true;
    return nr;
  });

  if (dir === "right") grid = reverse(grid);
  if (dir === "up")    grid = transpose(grid);
  if (dir === "down")  grid = transpose(reverse(grid));

  return { grid, score: totalScore, moved };
}

function canMove(g: Grid): boolean {
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++) {
      if (g[r][c] === 0) return true;
      if (c < 3 && g[r][c] === g[r][c + 1]) return true;
      if (r < 3 && g[r][c] === g[r + 1][c]) return true;
    }
  return false;
}

function newGame(): { grid: Grid; score: number } {
  let g = addTile(emptyGrid());
  g = addTile(g);
  return { grid: g, score: 0 };
}

export default function Game2048() {
  const [started, setStarted] = useState(false);
  const [{ grid, score }, setGame] = useState(newGame);
  const [best, setBest] = useState(0);
  const [won, setWon] = useState(false);
  const [over, setOver] = useState(false);

  const move = useCallback((dir: "left" | "right" | "up" | "down") => {
    if (over) return;
    setGame(({ grid: g, score: s }) => {
      const { grid: ng, score: ns, moved } = moveGrid(g, dir);
      if (!moved) return { grid: g, score: s };
      const withTile = addTile(ng);
      const newScore = s + ns;
      setBest((b) => Math.max(b, newScore));
      if (!won && ng.some((r) => r.some((v) => v === 2048))) setWon(true);
      if (!canMove(withTile)) setOver(true);
      return { grid: withTile, score: newScore };
    });
  }, [over, won]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, "left" | "right" | "up" | "down"> = {
        ArrowLeft: "left", a: "left", A: "left",
        ArrowRight: "right", d: "right", D: "right",
        ArrowUp: "up", w: "up", W: "up",
        ArrowDown: "down", s: "down", S: "down",
      };
      if (map[e.key]) { e.preventDefault(); move(map[e.key]); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move]);

  useEffect(() => {
    let sx = 0, sy = 0;
    const onStart = (e: TouchEvent) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; };
    const onEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - sx;
      const dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
      if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? "right" : "left");
      else move(dy > 0 ? "down" : "up");
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    return () => { window.removeEventListener("touchstart", onStart); window.removeEventListener("touchend", onEnd); };
  }, [move]);

  const restart = () => { setGame(newGame()); setWon(false); setOver(false); };

  if (!started) {
    return (
      <div className="page">
        <GameHeader title="2048" color={COLOR} />
        <main className="page-content justify-center">
          <div className="game-container" style={{ maxWidth: 340 }}>
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center font-black text-3xl"
                style={{ background: `linear-gradient(145deg, ${COLOR}25, ${COLOR}08)`, border: `1px solid ${COLOR}30`, color: COLOR }}>
                2048
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center mb-2 tracking-tight" style={{ color: "var(--text-primary)" }}>2048</h2>
            <p className="text-sm text-center mb-6" style={{ color: "var(--text-secondary)" }}>
              Slide tiles to merge matching numbers. Reach 2048 to win.
            </p>
            <div className="card p-4 mb-8">
              <div className="text-xs space-y-2" style={{ color: "var(--text-secondary)" }}>
                {[
                  ["Arrow keys / WASD", "Slide tiles"],
                  ["Swipe", "Slide on mobile"],
                  ["Same numbers", "Merge into double"],
                ].map(([key, desc]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded font-mono text-xs" style={{ background: "var(--bg-raised)", color: "var(--text-primary)" }}>{key}</span>
                    <span style={{ color: "var(--text-muted)" }}>{desc}</span>
                  </div>
                ))}
              </div>
            </div>
            <button className="btn btn-primary btn-lg w-full" style={{ background: COLOR }} onClick={() => { restart(); setStarted(true); }}>
              Start game
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page">
      <GameHeader title="2048" color={COLOR} />
      <main className="page-content">
        <div className="game-container" style={{ maxWidth: 380 }}>

          {/* Score row */}
          <div className="flex items-center gap-3 mb-5">
            <div className="card flex-1 text-center py-2.5">
              <div className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>Score</div>
              <div className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>{score}</div>
            </div>
            <div className="card flex-1 text-center py-2.5">
              <div className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>Best</div>
              <div className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>{best}</div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={restart}>New game</button>
          </div>

          {(won || over) && (
            <div className={`${over ? "badge-error" : "badge-accent"} rounded-xl px-4 py-3 mb-4 text-center text-sm font-medium flex items-center justify-between`}>
              <span>{over ? "Game over!" : "You reached 2048! 🎉"}</span>
              <button className="btn btn-sm ml-3" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "none" }} onClick={restart}>
                Restart
              </button>
            </div>
          )}

          {/* Grid */}
          <div
            className="rounded-2xl p-2.5 relative"
            style={{ background: "#1e1e1e", border: "1px solid var(--border)", boxShadow: "var(--shadow-md)" }}
          >
            <div className="grid grid-cols-4 gap-2">
              {grid.map((row, r) =>
                row.map((val, c) => {
                  const { bg, color } = getColors(val);
                  return (
                    <div
                      key={`${r}-${c}`}
                      className="aspect-square rounded-xl flex items-center justify-center font-bold transition-all duration-100"
                      style={{
                        background: bg,
                        color,
                        fontSize: val >= 1024 ? "1rem" : val >= 128 ? "1.2rem" : "1.4rem",
                      }}
                    >
                      {val !== 0 ? val : ""}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <p className="text-xs text-center mt-4" style={{ color: "var(--text-muted)" }}>
            Arrow keys or WASD to move · Swipe on mobile
          </p>
        </div>
      </main>
    </div>
  );
}
