"use client";

import { useState, useEffect, useCallback } from "react";
import BackButton from "@/components/BackButton";

const EMOJI_POOL = ["🦊", "🐼", "🦁", "🐸", "🦋", "🐙", "🦄", "🐬", "🦜", "🐺", "🦩", "🐳"];

interface Card {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

function buildDeck(pairs: number): Card[] {
  const emojis = EMOJI_POOL.slice(0, pairs);
  const doubled = [...emojis, ...emojis];
  const shuffled = doubled.sort(() => Math.random() - 0.5);
  return shuffled.map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));
}

export default function MemoryPage() {
  const [pairs, setPairs] = useState<6 | 8 | 12>(6);
  const [started, setStarted] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [won, setWon] = useState(false);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  const startGame = useCallback((p: 6 | 8 | 12) => {
    setPairs(p);
    setCards(buildDeck(p));
    setSelected([]);
    setMoves(0);
    setSeconds(0);
    setRunning(false);
    setWon(false);
    setLocked(false);
    setStarted(true);
  }, []);

  const handleCard = useCallback(
    (id: number) => {
      if (locked || won) return;
      const card = cards[id];
      if (card.flipped || card.matched) return;

      if (!running) setRunning(true);

      const newCards = cards.map((c) => (c.id === id ? { ...c, flipped: true } : c));
      const newSelected = [...selected, id];
      setCards(newCards);
      setSelected(newSelected);

      if (newSelected.length === 2) {
        setMoves((m) => m + 1);
        setLocked(true);
        const [a, b] = newSelected;
        if (newCards[a].emoji === newCards[b].emoji) {
          const matched = newCards.map((c) =>
            c.id === a || c.id === b ? { ...c, matched: true } : c
          );
          setCards(matched);
          setSelected([]);
          setLocked(false);
          if (matched.every((c) => c.matched)) {
            setRunning(false);
            setWon(true);
          }
        } else {
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) => (c.id === a || c.id === b ? { ...c, flipped: false } : c))
            );
            setSelected([]);
            setLocked(false);
          }, 900);
        }
      }
    },
    [cards, selected, locked, won, running]
  );

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const cols = pairs === 6 ? "grid-cols-4" : pairs === 8 ? "grid-cols-4" : "grid-cols-6";

  if (!started) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: "var(--bg-primary)" }}>
        <div className="w-full max-w-sm">
          <div className="mb-10">
            <BackButton />
          </div>
          <div className="text-4xl mb-4 text-center">🧩</div>
          <h1 className="text-2xl font-semibold text-center mb-2" style={{ color: "var(--text-primary)" }}>
            Memory
          </h1>
          <p className="text-center text-sm mb-10" style={{ color: "var(--text-secondary)" }}>
            Choose a difficulty
          </p>
          <div className="flex flex-col gap-3">
            {([6, 8, 12] as const).map((p, i) => {
              const labels = ["Easy — 6 pairs", "Medium — 8 pairs", "Hard — 12 pairs"];
              return (
                <button
                  key={p}
                  onClick={() => startGame(p)}
                  className="w-full py-3 rounded-xl text-sm font-medium transition-all duration-150"
                  style={{
                    background: i === 2 ? "var(--accent)" : "var(--bg-card)",
                    border: `1px solid ${i === 2 ? "var(--accent)" : "var(--border)"}`,
                    color: i === 2 ? "#fff" : "var(--text-primary)",
                  }}
                  onMouseEnter={(e) => {
                    if (i !== 2) e.currentTarget.style.borderColor = "var(--accent)";
                  }}
                  onMouseLeave={(e) => {
                    if (i !== 2) e.currentTarget.style.borderColor = "var(--border)";
                  }}
                >
                  {labels[i]}
                </button>
              );
            })}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-10" style={{ background: "var(--bg-primary)" }}>
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-between mb-8">
          <BackButton />
          <button
            onClick={() => setStarted(false)}
            className="text-xs px-3 py-1.5 rounded-lg"
            style={{ color: "var(--text-muted)", background: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            Change difficulty
          </button>
        </div>

        <div className="flex items-center justify-between mb-6 px-1">
          <div>
            <div className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>Moves</div>
            <div className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>{moves}</div>
          </div>
          <div className="text-center">
            <div className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>Time</div>
            <div className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>{fmt(seconds)}</div>
          </div>
          <div className="text-right">
            <div className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>Matched</div>
            <div className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
              {cards.filter((c) => c.matched).length / 2}/{pairs}
            </div>
          </div>
        </div>

        {won && (
          <div
            className="rounded-xl px-4 py-3 mb-6 text-center text-sm"
            style={{ background: "var(--accent-dim)", border: "1px solid var(--accent)" }}
          >
            <span style={{ color: "var(--accent)" }}>
              You won in {moves} moves and {fmt(seconds)}! 🎉
            </span>
          </div>
        )}

        <div className={`grid ${cols} gap-2 mb-6`}>
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => handleCard(card.id)}
              className="aspect-square rounded-xl text-2xl flex items-center justify-center transition-all duration-200 font-medium"
              style={{
                background: card.matched
                  ? "var(--accent-dim)"
                  : card.flipped
                  ? "var(--bg-card-hover)"
                  : "var(--bg-card)",
                border: card.matched
                  ? "1px solid var(--accent)"
                  : card.flipped
                  ? "1px solid var(--border)"
                  : "1px solid var(--border-subtle)",
                cursor: card.matched || card.flipped ? "default" : "pointer",
                transform: card.flipped || card.matched ? "scale(1)" : "scale(0.97)",
              }}
            >
              {card.flipped || card.matched ? card.emoji : ""}
            </button>
          ))}
        </div>

        <button
          onClick={() => startGame(pairs)}
          className="w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
        >
          Restart
        </button>
      </div>
    </main>
  );
}
