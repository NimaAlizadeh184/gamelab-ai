"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import GameHeader from "@/components/GameHeader";

const GRID = 20;
const CELL = 20;
const SIZE = GRID * CELL;

type Dir = { x: number; y: number };
type Point = { x: number; y: number };

const UP: Dir = { x: 0, y: -1 };
const DOWN: Dir = { x: 0, y: 1 };
const LEFT: Dir = { x: -1, y: 0 };
const RIGHT: Dir = { x: 1, y: 0 };

function randomFood(snake: Point[]): Point {
  let food: Point;
  do {
    food = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
  } while (snake.some((s) => s.x === food.x && s.y === food.y));
  return food;
}

export default function SnakePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    snake: [{ x: 10, y: 10 }],
    dir: RIGHT,
    nextDir: RIGHT,
    food: { x: 15, y: 10 },
    score: 0,
    running: false,
    dead: false,
  });
  const loopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<"idle" | "running" | "dead">("idle");
  const [speed, setSpeed] = useState(150);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { snake, food } = stateRef.current;

    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, SIZE, SIZE);

    ctx.strokeStyle = "#222";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID; i++) {
      ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, SIZE); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(SIZE, i * CELL); ctx.stroke();
    }

    snake.forEach((seg, i) => {
      const isHead = i === 0;
      ctx.fillStyle = isHead ? "#d97757" : i % 2 === 0 ? "#b85f3f" : "#a0522d";
      const pad = isHead ? 1 : 2;
      ctx.beginPath();
      ctx.roundRect(seg.x * CELL + pad, seg.y * CELL + pad, CELL - pad * 2, CELL - pad * 2, isHead ? 5 : 3);
      ctx.fill();
    });

    ctx.fillStyle = "#ececec";
    ctx.beginPath();
    ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL / 2 - 3, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  const tick = useCallback(() => {
    const s = stateRef.current;
    if (!s.running) return;

    s.dir = s.nextDir;
    const head = { x: s.snake[0].x + s.dir.x, y: s.snake[0].y + s.dir.y };

    if (
      head.x < 0 || head.x >= GRID ||
      head.y < 0 || head.y >= GRID ||
      s.snake.some((seg) => seg.x === head.x && seg.y === head.y)
    ) {
      s.running = false;
      s.dead = true;
      setStatus("dead");
      if (loopRef.current) clearInterval(loopRef.current);
      draw();
      return;
    }

    const ate = head.x === s.food.x && head.y === s.food.y;
    s.snake = [head, ...s.snake];
    if (ate) {
      s.score++;
      setScore(s.score);
      s.food = randomFood(s.snake);
    } else {
      s.snake.pop();
    }
    draw();
  }, [draw]);

  const startGame = useCallback(() => {
    if (loopRef.current) clearInterval(loopRef.current);
    const initSnake = [{ x: 10, y: 10 }];
    stateRef.current = {
      snake: initSnake,
      dir: RIGHT,
      nextDir: RIGHT,
      food: randomFood(initSnake),
      score: 0,
      running: true,
      dead: false,
    };
    setScore(0);
    setStatus("running");
    loopRef.current = setInterval(tick, speed);
    draw();
  }, [tick, draw, speed]);

  useEffect(() => { draw(); }, [draw]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (!s.running) return;
      const map: Record<string, Dir> = {
        ArrowUp: UP, w: UP, W: UP,
        ArrowDown: DOWN, s: DOWN, S: DOWN,
        ArrowLeft: LEFT, a: LEFT, A: LEFT,
        ArrowRight: RIGHT, d: RIGHT, D: RIGHT,
      };
      const newDir = map[e.key];
      if (!newDir) return;
      e.preventDefault();
      if (newDir.x + s.dir.x === 0 && newDir.y + s.dir.y === 0) return;
      s.nextDir = newDir;
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    return () => { if (loopRef.current) clearInterval(loopRef.current); };
  }, []);

  useEffect(() => {
    let startX = 0, startY = 0;
    const onStart = (e: TouchEvent) => { startX = e.touches[0].clientX; startY = e.touches[0].clientY; };
    const onEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      const s = stateRef.current;
      if (!s.running) return;
      if (Math.abs(dx) > Math.abs(dy)) {
        const newDir = dx > 0 ? RIGHT : LEFT;
        if (newDir.x + s.dir.x !== 0) s.nextDir = newDir;
      } else {
        const newDir = dy > 0 ? DOWN : UP;
        if (newDir.y + s.dir.y !== 0) s.nextDir = newDir;
      }
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchend", onEnd);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-primary)" }}>
      <GameHeader title="Snake" />
      <main className="flex-1 flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-md">

          {/* Score + speed */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>Score</div>
              <div className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>{score}</div>
            </div>
            <div className="flex items-center gap-1.5">
              {([200, 150, 100] as const).map((sp, i) => (
                <button
                  key={sp}
                  onClick={() => setSpeed(sp)}
                  className="text-xs px-2.5 py-1 rounded-lg transition-all"
                  style={{
                    background: speed === sp ? "var(--accent)" : "var(--bg-card)",
                    color: speed === sp ? "#fff" : "var(--text-muted)",
                    border: `1px solid ${speed === sp ? "var(--accent)" : "var(--border)"}`,
                  }}
                >
                  {["Slow", "Normal", "Fast"][i]}
                </button>
              ))}
            </div>
          </div>

          {/* Canvas */}
          <div
            className="rounded-2xl overflow-hidden mb-4 relative"
            style={{ border: "1px solid var(--border)" }}
          >
            <canvas ref={canvasRef} width={SIZE} height={SIZE} className="block w-full" />
            {status !== "running" && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-5"
                style={{ background: "rgba(26,26,26,0.88)" }}
              >
                {status === "dead" && (
                  <div className="text-center">
                    <div className="text-base font-semibold mb-1" style={{ color: "var(--accent)" }}>Game over</div>
                    <div className="text-sm" style={{ color: "var(--text-muted)" }}>Score: {score}</div>
                  </div>
                )}
                <button
                  onClick={startGame}
                  className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{ background: "var(--accent)", color: "#fff" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
                >
                  {status === "idle" ? "Start game" : "Play again"}
                </button>
              </div>
            )}
          </div>

          <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
            Arrow keys or WASD · Swipe on mobile
          </p>
        </div>
      </main>
    </div>
  );
}
