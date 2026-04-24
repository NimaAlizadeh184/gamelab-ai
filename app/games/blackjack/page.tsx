"use client";

import { useState, useCallback } from "react";
import GameHeader from "@/components/GameHeader";

type Suit = "♠" | "♥" | "♦" | "♣";
type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";

interface Card {
  suit: Suit;
  rank: Rank;
  hidden?: boolean;
}

const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
const RANKS: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function buildDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) for (const rank of RANKS) deck.push({ suit, rank });
  return deck.sort(() => Math.random() - 0.5);
}

function cardValue(rank: Rank): number {
  if (rank === "A") return 11;
  if (["J", "Q", "K"].includes(rank)) return 10;
  return parseInt(rank);
}

function handTotal(hand: Card[]): number {
  let total = 0;
  let aces = 0;
  for (const c of hand) {
    if (c.hidden) continue;
    total += cardValue(c.rank);
    if (c.rank === "A") aces++;
  }
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return total;
}

function fullTotal(hand: Card[]): number {
  return handTotal(hand.map((c) => ({ ...c, hidden: false })));
}

type Phase = "betting" | "playing" | "dealer" | "over";
type Result = "win" | "loss" | "push" | "blackjack" | null;

export default function BlackjackPage() {
  const [balance, setBalance] = useState(1000);
  const [bet, setBet] = useState(0);
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [phase, setPhase] = useState<Phase>("betting");
  const [result, setResult] = useState<Result>(null);
  const [message, setMessage] = useState("");

  const deal = useCallback((amount: number) => {
    if (amount > balance || amount <= 0) return;
    const d = buildDeck();
    const player = [d.pop()!, d.pop()!];
    const dealer = [d.pop()!, { ...d.pop()!, hidden: true }];
    setBet(amount);
    setBalance((b) => b - amount);
    setDeck(d);
    setPlayerHand(player);
    setDealerHand(dealer);
    setResult(null);
    setMessage("");

    const pTotal = handTotal(player);
    if (pTotal === 21) {
      const revealed = dealer.map((c) => ({ ...c, hidden: false }));
      const dTotal = fullTotal(dealer);
      if (dTotal === 21) {
        setDealerHand(revealed);
        setPhase("over");
        setResult("push");
        setBalance((b) => b + amount);
        setMessage("Push — both blackjack!");
      } else {
        setDealerHand(revealed);
        setPhase("over");
        setResult("blackjack");
        setBalance((b) => b + Math.floor(amount * 2.5));
        setMessage("Blackjack! You win 3:2 🎉");
      }
    } else {
      setPhase("playing");
    }
  }, [balance]);

  const hit = useCallback(() => {
    if (phase !== "playing") return;
    const d = [...deck];
    const card = d.pop()!;
    const newHand = [...playerHand, card];
    setDeck(d);
    setPlayerHand(newHand);
    const total = handTotal(newHand);
    if (total > 21) {
      setPhase("over");
      setResult("loss");
      setMessage("Bust! You went over 21.");
    } else if (total === 21) {
      stand(newHand, d);
    }
  }, [deck, playerHand, phase]);

  const stand = useCallback((hand = playerHand, d = deck) => {
    setPhase("dealer");
    let dHand = dealerHand.map((c) => ({ ...c, hidden: false }));
    let dDeck = [...d];

    const runDealer = (currentHand: Card[], currentDeck: Card[]) => {
      const total = fullTotal(currentHand);
      if (total < 17) {
        const card = currentDeck.pop()!;
        const next = [...currentHand, card];
        setDealerHand(next);
        setTimeout(() => runDealer(next, currentDeck), 400);
      } else {
        const playerTotal = handTotal(hand);
        const dealerTotal = fullTotal(currentHand);
        setDealerHand(currentHand);
        setPhase("over");
        if (dealerTotal > 21) {
          setResult("win"); setBalance((b) => b + bet * 2); setMessage("Dealer busts — you win! 🎉");
        } else if (playerTotal > dealerTotal) {
          setResult("win"); setBalance((b) => b + bet * 2); setMessage("You win! 🎉");
        } else if (playerTotal < dealerTotal) {
          setResult("loss"); setMessage("Dealer wins.");
        } else {
          setResult("push"); setBalance((b) => b + bet); setMessage("Push — it's a tie.");
        }
      }
    };

    setDealerHand(dHand);
    setTimeout(() => runDealer(dHand, dDeck), 300);
  }, [dealerHand, deck, playerHand, bet]);

  const newRound = useCallback(() => {
    setPhase("betting");
    setBet(0);
    setPlayerHand([]);
    setDealerHand([]);
    setResult(null);
    setMessage("");
  }, []);

  const isRed = (suit: Suit) => suit === "♥" || suit === "♦";

  const renderCard = (card: Card, i: number) => (
    <div
      key={i}
      className="flex flex-col items-center justify-between rounded-xl p-2 text-sm font-bold select-none shrink-0"
      style={{
        width: 56,
        height: 80,
        background: card.hidden ? "var(--bg-secondary)" : "#f7f5f0",
        border: `1px solid ${card.hidden ? "var(--border)" : "#d8d4cc"}`,
        color: card.hidden ? "var(--border)" : isRed(card.suit) ? "#c0392b" : "#1a1a1a",
      }}
    >
      {card.hidden ? (
        <div className="flex-1 flex items-center justify-center text-2xl" style={{ color: "var(--border-subtle)" }}>?</div>
      ) : (
        <>
          <span className="self-start text-xs leading-tight">{card.rank}<br />{card.suit}</span>
          <span className="text-xl leading-none">{card.suit}</span>
          <span className="self-end text-xs leading-tight rotate-180">{card.rank}<br />{card.suit}</span>
        </>
      )}
    </div>
  );

  const chipAmounts = [25, 50, 100, 200, 500];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-primary)" }}>
      <GameHeader title="Blackjack" />
      <main className="flex-1 flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-md">

          {/* Balance bar */}
          <div
            className="flex items-center justify-between rounded-2xl px-5 py-3 mb-6"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>Balance</span>
            <span className="text-lg font-semibold" style={{ color: balance === 0 ? "var(--accent)" : "var(--text-primary)" }}>
              ${balance}
            </span>
          </div>

          {/* Hands */}
          {phase !== "betting" && (
            <div className="flex flex-col gap-4 mb-5">
              {[
                { label: "Dealer", hand: dealerHand, total: phase === "over" || phase === "dealer" ? fullTotal(dealerHand) : handTotal(dealerHand) },
                { label: "You", hand: playerHand, total: handTotal(playerHand) },
              ].map(({ label, hand, total }) => (
                <div
                  key={label}
                  className="rounded-2xl p-4"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{label}</span>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}
                    >
                      {total}
                    </span>
                  </div>
                  <div className="flex gap-2 flex-wrap">{hand.map((c, i) => renderCard(c, i))}</div>
                </div>
              ))}
            </div>
          )}

          {/* Message */}
          {message && (
            <div
              className="rounded-xl px-4 py-3 mb-4 text-center text-sm"
              style={{
                background: result === "win" || result === "blackjack" ? "var(--accent-dim)" : "var(--bg-card)",
                border: `1px solid ${result === "win" || result === "blackjack" ? "var(--accent)" : "var(--border)"}`,
                color: result === "win" || result === "blackjack" ? "var(--accent)" : "var(--text-secondary)",
              }}
            >
              {message}
            </div>
          )}

          {/* Betting UI */}
          {phase === "betting" && (
            <div
              className="rounded-2xl p-5"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              {balance === 0 ? (
                <div className="text-center py-2">
                  <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>You're out of chips!</p>
                  <button
                    onClick={() => setBalance(1000)}
                    className="px-5 py-2.5 rounded-xl text-sm font-medium"
                    style={{ background: "var(--accent)", color: "#fff" }}
                  >
                    Reload $1000
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>Place your bet</p>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {chipAmounts.filter((c) => c <= balance).map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setBet((b) => Math.min(b + amount, balance))}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                        style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                      >
                        +${amount}
                      </button>
                    ))}
                    {bet > 0 && (
                      <button
                        onClick={() => setBet(0)}
                        className="px-3 py-1.5 rounded-lg text-sm"
                        style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      Bet: <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>${bet}</span>
                    </span>
                    <button
                      onClick={() => deal(bet)}
                      disabled={bet === 0}
                      className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
                      style={{
                        background: bet > 0 ? "var(--accent)" : "var(--bg-secondary)",
                        color: bet > 0 ? "#fff" : "var(--text-muted)",
                        cursor: bet > 0 ? "pointer" : "not-allowed",
                      }}
                      onMouseEnter={(e) => { if (bet > 0) e.currentTarget.style.background = "var(--accent-hover)"; }}
                      onMouseLeave={(e) => { if (bet > 0) e.currentTarget.style.background = "var(--accent)"; }}
                    >
                      Deal
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Actions */}
          {phase === "playing" && (
            <div className="flex gap-3">
              <button
                onClick={hit}
                className="flex-1 py-3 rounded-xl text-sm font-medium transition-all"
                style={{ background: "var(--accent)", color: "#fff" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
              >
                Hit
              </button>
              <button
                onClick={() => stand()}
                className="flex-1 py-3 rounded-xl text-sm font-medium transition-all"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              >
                Stand
              </button>
              {playerHand.length === 2 && bet <= balance && (
                <button
                  onClick={() => { setBalance((b) => b - bet); setBet((b) => b * 2); hit(); }}
                  className="flex-1 py-3 rounded-xl text-sm font-medium transition-all"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                >
                  Double
                </button>
              )}
            </div>
          )}

          {phase === "over" && (
            <button
              onClick={newRound}
              className="w-full py-3 rounded-xl text-sm font-medium transition-all"
              style={{ background: "var(--accent)", color: "#fff" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
            >
              Next round
            </button>
          )}

          {phase === "dealer" && (
            <div
              className="py-3 text-center text-sm rounded-xl"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
            >
              Dealer playing…
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
