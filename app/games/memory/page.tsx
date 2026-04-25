"use client";

import { useState, useEffect, useCallback } from "react";
import GameHeader from "@/components/GameHeader";

const COLOR = "#A855F7";
const EMOJI_POOL = ["🦊", "🐼", "🦁", "🐸", "🦋", "🐙", "🦄", "🐬", "🦜", "🐺", "🦩", "🐳"];

interface Card {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

function buildDeck(pairs: number): Card[] {
  const emojis = EMOJI_POOL.slice(0, pairs);
  return [...emojis, ...emojis]
    .sort(() => Math.random() - 0.5)
    .map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));
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

  const handleCard = useCallback((id: number) => {
    if (locked || won) return;
    const card = cards[id];
    if (card.flipped || card.matched) return;
    if (!running) setRunning(true);

    const newCards = cards.map((c) => c.id === id ? { ...c, flipped: true } : c);
    const newSel = [...selected, id];
    setCards(newCards);
    setSelected(newSel);

    if (newSel.length === 2) {
      setMoves((m) => m + 1);
      setLocked(true);
      const [a, b] = newSel;
      if (newCards[a].emoji === newCards[b].emoji) {
        const matched = newCards.map((c) => c.id === a || c.id === b ? { ...c, matched: true } : c);
        setCards(matched);
        setSelected([]);
        setLocked(false);
        if (matched.every((c) => c.matched)) { setRunning(false); setWon(true); }
      } else {
        setTimeout(() => {
          setCards((prev) => prev.map((c) => c.id === a || c.id === b ? { ...c, flipped: false } : c));
          setSelected([]);
          setLocked(false);
        }, 900);
      }
    }
  }, [cards, selected, locked, won, running]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const cols = pairs === 12 ? "grid-cols-6" : "grid-cols-4";

  if (!started) {
    return (
      <div className="page">
        <GameHeader title="Memory" color={COLOR} />
        <main className="page-content justify-center">
          <div className="game-container" style={{ maxWidth: 320 }}>
            <div className="text-center mb-10">
              <div className="text-5xl mb-5">🧩</div>
              <h2 className="text-xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Choose difficulty</h2>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>More pairs = harder game</p>
            </div>
            <div className="flex flex-col gap-3">
              {([
                { p: 6 as const, label: "Easy", sub: "6 pairs · 12 cards" },
                { p: 8 as const, label: "Medium", sub: "8 pairs · 16 cards" },
                { p: 12 as const, label: "Hard", sub: "12 pairs · 24 cards" },
              ]).map(({ p, label, sub }, i) => (
                <button
                  key={p}
                  onClick={() => startGame(p)}
                  className="btn btn-lg w-full flex flex-col gap-0.5"
                  style={i === 2
                    ? { background: COLOR, color: "#fff", border: "none" }
                    : { background: "var(--bg-card)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
                  onMouseEnter={(e) => { if (i !== 2) e.currentTarget.style.borderColor = COLOR; }}
                  onMouseLeave={(e) => { if (i !== 2) e.currentTarget.style.borderColor = "var(--border)"; }}
                >
                  <span>{label}</span>
                  <span style={{ fontSize: "0.7rem", opacity: 0.6 }}>{sub}</span>
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  const matchedCount = cards.filter((c) => c.matched).length / 2;

  return (
    <div className="page">
      <GameHeader title="Memory" color={COLOR} />
      <main className="page-content">
        <div className="game-container" style={{ maxWidth: 480 }}>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: "Moves", value: moves },
              { label: "Time",  value: fmt(seconds) },
              { label: "Pairs", value: `${matchedCount}/${pairs}` },
            ].map(({ label, value }) => (
              <div key={label} className="card text-center py-3 px-2">
                <div className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>{label}</div>
                <div className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>{value}</div>
              </div>
            ))}
          </div>

          {won && (
            <div className="badge-success rounded-xl px-4 py-3 mb-5 text-center text-sm">
              You won in {moves} moves and {fmt(seconds)}! 🎉
            </div>
          )}

          {/* Card grid */}
          <div className={`grid ${cols} gap-2 mb-5`}>
            {cards.map((card) => (
              <div
                key={card.id}
                className="flip-container"
                style={{ aspectRatio: "1", cursor: card.matched || card.flipped ? "default" : "pointer" }}
                onClick={() => handleCard(card.id)}
              >
                <div className={`flip-inner ${card.flipped || card.matched ? "is-flipped" : ""}`}
                  style={{ width: "100%", height: "100%" }}>
                  {/* Front (hidden) */}
                  <div
                    className="flip-face"
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--border)" }} />
                  </div>
                  {/* Back (revealed) */}
                  <div
                    className="flip-face flip-face-back text-2xl"
                    style={{
                      background: card.matched ? `${COLOR}18` : "var(--bg-card-hover)",
                      border: `1px solid ${card.matched ? COLOR + "40" : "var(--border)"}`,
                    }}
                  >
                    {card.emoji}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button className="btn btn-secondary flex-1" onClick={() => startGame(pairs)}>Restart</button>
            <button className="btn btn-ghost flex-1" onClick={() => setStarted(false)}>Change difficulty</button>
          </div>
        </div>
      </main>
    </div>
  );
}
