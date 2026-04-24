"use client";

import { useState, useEffect, useCallback } from "react";
import GameHeader from "@/components/GameHeader";

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
  const cols = pairs === 12 ? "grid-cols-6" : "grid-cols-4";

  if (!started) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-primary)" }}>
        <GameHeader title="Memory" />
        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-xs">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">🧩</div>
              <h2 className="text-xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                Choose difficulty
              </h2>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                More pairs = harder game
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {([6, 8, 12] as const).map((p, i) => {
                const labels = ["Easy — 6 pairs", "Medium — 8 pairs", "Hard — 12 pairs"];
                const isAccent = i === 2;
                return (
                  <button
                    key={p}
                    onClick={() => startGame(p)}
                    className="w-full py-3 rounded-xl text-sm font-medium transition-all duration-150"
                    style={{
                      background: isAccent ? "var(--accent)" : "var(--bg-card)",
                      border: `1px solid ${isAccent ? "var(--accent)" : "var(--border)"}`,
                      color: isAccent ? "#fff" : "var(--text-primary)",
                    }}
                    onMouseEnter={(e) => { if (!isAccent) e.currentTarget.style.borderColor = "var(--accent)"; }}
                    onMouseLeave={(e) => { if (!isAccent) e.currentTarget.style.borderColor = "var(--border)"; }}
                  >
                    {labels[i]}
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
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-primary)" }}>
      <GameHeader title="Memory" />
      <main className="flex-1 flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-lg">

          {/* Stats row */}
          <div
            className="grid grid-cols-3 gap-px rounded-2xl overflow-hidden mb-6"
            style={{ background: "var(--border)", border: "1px solid var(--border)" }}
          >
            {[
              { label: "Moves", value: moves },
              { label: "Time", value: fmt(seconds) },
              { label: "Pairs", value: `${cards.filter((c) => c.matched).length / 2}/${pairs}` },
            ].map(({ label, value }) => (
              <div key={label} className="text-center py-4" style={{ background: "var(--bg-card)" }}>
                <div className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>{label}</div>
                <div className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>{value}</div>
              </div>
            ))}
          </div>

          {won && (
            <div
              className="rounded-xl px-4 py-3 mb-5 text-center text-sm"
              style={{ background: "var(--accent-dim)", border: "1px solid var(--accent)" }}
            >
              <span style={{ color: "var(--accent)" }}>
                You won in {moves} moves and {fmt(seconds)}! 🎉
              </span>
            </div>
          )}

          {/* Grid */}
          <div className={`grid ${cols} gap-2 mb-5`}>
            {cards.map((card) => (
              <button
                key={card.id}
                onClick={() => handleCard(card.id)}
                className="aspect-square rounded-xl text-2xl flex items-center justify-center transition-all duration-200"
                style={{
                  background: card.matched ? "var(--accent-dim)" : card.flipped ? "var(--bg-card-hover)" : "var(--bg-card)",
                  border: card.matched ? "1px solid var(--accent)" : "1px solid var(--border-subtle)",
                  cursor: card.matched || card.flipped ? "default" : "pointer",
                  transform: card.flipped || card.matched ? "scale(1)" : "scale(0.96)",
                }}
              >
                {card.flipped || card.matched ? card.emoji : ""}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => startGame(pairs)}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
            >
              Restart
            </button>
            <button
              onClick={() => setStarted(false)}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
            >
              Change difficulty
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
