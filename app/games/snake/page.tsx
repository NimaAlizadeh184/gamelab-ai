"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import GameHeader from "@/components/GameHeader";

const COLOR = "#22C55E";
const GRID = 20;
const CELL = 20;
const SIZE = GRID * CELL;

type Dir = { x: number; y: number };
type Point = { x: number; y: number };

const UP: Dir    = { x: 0, y: -1 };
const DOWN: Dir  = { x: 0, y:  1 };
const LEFT: Dir  = { x: -1, y: 0 };
const RIGHT: Dir = { x:  1, y: 0 };

function randomFood(snake: Point[]): Point {
  let food: Point;
  do { food = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) }; }
  while (snake.some((s) => s.x === food.x && s.y === food.y));
  return food;
}

export default function SnakePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    snake: [{ x: 10, y: 10 }],
    dir: RIGHT, nextDir: RIGHT,
    food: { x: 15, y: 10 },
    score: 0, running: false, dead: false,
  });
  const loopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [status, setStatus] = useState<"idle" | "running" | "dead">("idle");
  const [speed, setSpeed] = useState(150);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { snake, food } = stateRef.current;

    ctx.fillStyle = "#161616";
    ctx.fillRect(0, 0, SIZE, SIZE);

    snake.forEach((seg, i) => {
      const isHead = i === 0;
      const alpha = Math.max(0.35, 1 - i * 0.035);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = isHead ? COLOR : "#16a34a";
      const pad = isHead ? 1 : 2;
      ctx.beginPath();
      ctx.roundRect(seg.x * CELL + pad, seg.y * CELL + pad, CELL - pad * 2, CELL - pad * 2, isHead ? 6 : 4);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    ctx.fillStyle = "#f0f0f0";
    ctx.beginPath();
    ctx.roundRect(food.x * CELL + 3, food.y * CELL + 3, CELL - 6, CELL - 6, 5);
    ctx.fill();
  }, []);

  const tick = useCallback(() => {
    const s = stateRef.current;
    if (!s.running) return;
    s.dir = s.nextDir;
    const head = { x: s.snake[0].x + s.dir.x, y: s.snake[0].y + s.dir.y };
    if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID ||
        s.snake.some((seg) => seg.x === head.x && seg.y === head.y)) {
      s.running = false; s.dead = true;
      setStatus("dead");
      setBest((b) => Math.max(b, s.score));
      if (loopRef.current) clearInterval(loopRef.current);
      draw(); return;
    }
    const ate = head.x === s.food.x && head.y === s.food.y;
    s.snake = [head, ...s.snake];
    if (ate) { s.score++; setScore(s.score); s.food = randomFood(s.snake); }
    else s.snake.pop();
    draw();
  }, [draw]);

  const startGame = useCallback(() => {
    if (loopRef.current) clearInterval(loopRef.current);
    const initSnake = [{ x: 10, y: 10 }];
    stateRef.current = { snake: initSnake, dir: RIGHT, nextDir: RIGHT, food: randomFood(initSnake), score: 0, running: true, dead: false };
    setScore(0); setStatus("running");
    loopRef.current = setInterval(tick, speed);
    draw();
  }, [tick, draw, speed]);

  useEffect(() => { draw(); }, [draw]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (!s.running) return;
      const map: Record<string, Dir> = {
        ArrowUp: UP, w: UP, W: UP, ArrowDown: DOWN, s: DOWN, S: DOWN,
        ArrowLeft: LEFT, a: LEFT, A: LEFT, ArrowRight: RIGHT, d: RIGHT, D: RIGHT,
      };
      const nd = map[e.key];
      if (!nd) return;
      e.preventDefault();
      if (nd.x + s.dir.x === 0 && nd.y + s.dir.y === 0) return;
      s.nextDir = nd;
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    let sx = 0, sy = 0;
    const onStart = (e: TouchEvent) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; };
    const onEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - sx;
      const dy = e.changedTouches[0].clientY - sy;
      const s = stateRef.current;
      if (!s.running) return;
      if (Math.abs(dx) > Math.abs(dy)) {
        const nd = dx > 0 ? RIGHT : LEFT;
        if (nd.x + s.dir.x !== 0) s.nextDir = nd;
      } else {
        const nd = dy > 0 ? DOWN : UP;
        if (nd.y + s.dir.y !== 0) s.nextDir = nd;
      }
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    return () => { window.removeEventListener("touchstart", onStart); window.removeEventListener("touchend", onEnd); };
  }, []);

  useEffect(() => () => { if (loopRef.current) clearInterval(loopRef.current); }, []);

  return (
    <div className="page">
      <GameHeader title="Snake" color={COLOR} />
      <main className="page-content">
        <div className="game-container" style={{ maxWidth: 440 }}>

          {/* Score row */}
          <div className="flex items-center justify-between mb-4">
            <div className="card px-4 py-2.5 flex items-center gap-3">
              <div>
                <div className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>Score</div>
                <div className="text-xl font-semibold" style={{ color: COLOR }}>{score}</div>
              </div>
              <div className="w-px h-8" style={{ background: "var(--border)" }} />
              <div>
                <div className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>Best</div>
                <div className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>{best}</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {([200, 150, 100] as const).map((sp, i) => (
                <button
                  key={sp}
                  onClick={() => setSpeed(sp)}
                  className="btn btn-sm"
                  style={speed === sp
                    ? { background: COLOR, color: "#fff", border: "none" }
                    : { background: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
                >
                  {["Slow", "Normal", "Fast"][i]}
                </button>
              ))}
            </div>
          </div>

          {/* Canvas */}
          <div
            className="rounded-2xl overflow-hidden relative mb-4"
            style={{ border: "1px solid var(--border)", boxShadow: "var(--shadow-md)" }}
          >
            <canvas ref={canvasRef} width={SIZE} height={SIZE} className="block w-full" />
            {status !== "running" && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-5"
                style={{ background: "rgba(16,16,16,0.92)" }}
              >
                {status === "dead" && (
                  <div className="text-center">
                    <div className="text-lg font-semibold mb-1" style={{ color: "var(--error)" }}>Game over</div>
                    <div className="text-sm" style={{ color: "var(--text-muted)" }}>
                      Score: <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{score}</span>
                      {score === best && score > 0 && <span style={{ color: COLOR }}> · New best!</span>}
                    </div>
                  </div>
                )}
                {status === "idle" && (
                  <div className="text-center">
                    <div className="text-4xl mb-3">🐍</div>
                    <div className="text-base font-medium" style={{ color: "var(--text-secondary)" }}>Ready to play?</div>
                  </div>
                )}
                <button
                  className="btn btn-primary btn-lg"
                  style={{ background: COLOR }}
                  onClick={startGame}
                >
                  {status === "idle" ? "Start game" : "Play again"}
                </button>
              </div>
            )}
          </div>

          <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
            Arrow keys or WASD to move · Swipe on mobile
          </p>
        </div>
      </main>
    </div>
  );
}
