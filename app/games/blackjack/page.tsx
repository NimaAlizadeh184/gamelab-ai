"use client";

import { useState, useCallback } from "react";
import GameHeader from "@/components/GameHeader";

const COLOR = "#F59E0B";

type Suit = "♠" | "♥" | "♦" | "♣";
type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";
interface Card { suit: Suit; rank: Rank; hidden?: boolean; }

const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
const RANKS: Rank[] = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

function buildDeck(): Card[] {
  return SUITS.flatMap((suit) => RANKS.map((rank) => ({ suit, rank }))).sort(() => Math.random() - 0.5);
}

function cardValue(rank: Rank): number {
  if (rank === "A") return 11;
  if (["J","Q","K"].includes(rank)) return 10;
  return parseInt(rank);
}

function handTotal(hand: Card[]): number {
  let total = 0, aces = 0;
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

const isRed = (suit: Suit) => suit === "♥" || suit === "♦";

function PlayingCard({ card }: { card: Card }) {
  return (
    <div
      className="flex flex-col rounded-xl select-none shrink-0"
      style={{
        width: 58, height: 84, padding: "6px 8px",
        background: card.hidden ? "var(--bg-raised)" : "#faf8f2",
        border: `1px solid ${card.hidden ? "var(--border)" : "#e0dbd0"}`,
        boxShadow: "var(--shadow-sm)",
        color: card.hidden ? "var(--border)" : isRed(card.suit) ? "#c0392b" : "#1a1a1a",
        fontWeight: 700,
      }}
    >
      {card.hidden ? (
        <div className="flex-1 flex items-center justify-center text-xl" style={{ color: "var(--border-subtle)" }}>?</div>
      ) : (
        <>
          <span style={{ fontSize: "0.7rem", lineHeight: 1.2 }}>{card.rank}<br />{card.suit}</span>
          <div className="flex-1 flex items-center justify-center" style={{ fontSize: "1.2rem" }}>{card.suit}</div>
          <span style={{ fontSize: "0.7rem", lineHeight: 1.2, alignSelf: "flex-end", transform: "rotate(180deg)", display: "block" }}>
            {card.rank}<br />{card.suit}
          </span>
        </>
      )}
    </div>
  );
}

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
    setBet(amount); setBalance((b) => b - amount);
    setDeck(d); setPlayerHand(player); setDealerHand(dealer);
    setResult(null); setMessage("");
    if (handTotal(player) === 21) {
      const rev = dealer.map((c) => ({ ...c, hidden: false }));
      if (fullTotal(dealer) === 21) {
        setDealerHand(rev); setPhase("over"); setResult("push");
        setBalance((b) => b + amount); setMessage("Push — both blackjack!");
      } else {
        setDealerHand(rev); setPhase("over"); setResult("blackjack");
        setBalance((b) => b + Math.floor(amount * 2.5)); setMessage("Blackjack! You win 3:2 🎉");
      }
    } else setPhase("playing");
  }, [balance]);

  const hit = useCallback(() => {
    if (phase !== "playing") return;
    const d = [...deck]; const card = d.pop()!;
    const nh = [...playerHand, card];
    setDeck(d); setPlayerHand(nh);
    const t = handTotal(nh);
    if (t > 21) { setPhase("over"); setResult("loss"); setMessage("Bust! Over 21."); }
    else if (t === 21) stand(nh, d);
  }, [deck, playerHand, phase]);

  const stand = useCallback((hand = playerHand, d = deck) => {
    setPhase("dealer");
    let dh = dealerHand.map((c) => ({ ...c, hidden: false }));
    const dd = [...d];
    const run = (cur: Card[], curD: Card[]) => {
      if (fullTotal(cur) < 17) {
        const c = curD.pop()!; const next = [...cur, c];
        setDealerHand(next);
        setTimeout(() => run(next, curD), 420);
      } else {
        const pt = handTotal(hand), dt = fullTotal(cur);
        setDealerHand(cur); setPhase("over");
        if (dt > 21)      { setResult("win");  setBalance((b) => b + bet * 2); setMessage("Dealer busts — you win! 🎉"); }
        else if (pt > dt) { setResult("win");  setBalance((b) => b + bet * 2); setMessage("You win! 🎉"); }
        else if (pt < dt) { setResult("loss"); setMessage("Dealer wins."); }
        else              { setResult("push"); setBalance((b) => b + bet);     setMessage("Push — it's a tie."); }
      }
    };
    setDealerHand(dh);
    setTimeout(() => run(dh, dd), 300);
  }, [dealerHand, deck, playerHand, bet]);

  const newRound = useCallback(() => {
    setPhase("betting"); setBet(0);
    setPlayerHand([]); setDealerHand([]);
    setResult(null); setMessage("");
  }, []);

  const chipAmounts = [25, 50, 100, 200, 500];

  const statusClass = result === "win" || result === "blackjack"
    ? "badge-success" : result === "loss" ? "badge-error" : "badge-accent";

  return (
    <div className="page">
      <GameHeader title="Blackjack" color={COLOR} />
      <main className="page-content">
        <div className="game-container" style={{ maxWidth: 420 }}>

          {/* Balance */}
          <div className="card flex items-center justify-between px-5 py-3 mb-5">
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>Balance</span>
            <span className="text-xl font-semibold" style={{ color: balance < 100 ? "var(--error)" : "var(--text-primary)" }}>
              ${balance.toLocaleString()}
            </span>
          </div>

          {/* Hands */}
          {phase !== "betting" && (
            <div className="flex flex-col gap-3 mb-4">
              {([
                { label: "Dealer", hand: dealerHand, total: phase === "over" || phase === "dealer" ? fullTotal(dealerHand) : handTotal(dealerHand) },
                { label: "You",    hand: playerHand, total: handTotal(playerHand) },
              ]).map(({ label, hand, total }) => (
                <div key={label} className="card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{label}</span>
                    <span
                      className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                      style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}
                    >
                      {total}
                    </span>
                  </div>
                  <div className="flex gap-2 flex-wrap">{hand.map((c, i) => <PlayingCard key={i} card={c} />)}</div>
                </div>
              ))}
            </div>
          )}

          {/* Message */}
          {message && (
            <div className={`${statusClass} rounded-xl px-4 py-3 mb-4 text-center text-sm font-medium`}>
              {message}
            </div>
          )}

          {/* Betting */}
          {phase === "betting" && (
            <div className="card p-5">
              {balance === 0 ? (
                <div className="text-center py-2">
                  <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>You're out of chips!</p>
                  <button className="btn btn-primary" style={{ background: COLOR }} onClick={() => setBalance(1000)}>
                    Reload $1,000
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-sm mb-4 font-medium" style={{ color: "var(--text-secondary)" }}>Place your bet</p>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {chipAmounts.filter((c) => c <= balance).map((amount) => (
                      <button
                        key={amount}
                        className="btn btn-secondary btn-sm"
                        onClick={() => setBet((b) => Math.min(b + amount, balance))}
                      >
                        +${amount}
                      </button>
                    ))}
                    {bet > 0 && (
                      <button className="btn btn-ghost btn-sm" onClick={() => setBet(0)}>Clear</button>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>Bet </span>
                      <span className="text-base font-semibold" style={{ color: bet > 0 ? COLOR : "var(--text-muted)" }}>
                        ${bet}
                      </span>
                    </div>
                    <button
                      className="btn btn-primary"
                      style={{ background: COLOR, opacity: bet > 0 ? 1 : 0.4, cursor: bet > 0 ? "pointer" : "not-allowed" }}
                      onClick={() => deal(bet)}
                      disabled={bet === 0}
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
            <div className="flex gap-2.5">
              <button className="btn btn-primary flex-1 btn-lg" style={{ background: COLOR }} onClick={hit}>Hit</button>
              <button className="btn btn-secondary flex-1 btn-lg" onClick={() => stand()}>Stand</button>
              {playerHand.length === 2 && bet <= balance && (
                <button className="btn btn-secondary flex-1 btn-lg" onClick={() => { setBalance((b) => b - bet); setBet((b) => b * 2); hit(); }}>
                  Double
                </button>
              )}
            </div>
          )}

          {phase === "over" && (
            <button className="btn btn-primary w-full btn-lg" style={{ background: COLOR }} onClick={newRound}>
              Next round
            </button>
          )}

          {phase === "dealer" && (
            <div className="card py-3 text-center text-sm" style={{ color: "var(--text-muted)" }}>
              Dealer playing…
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
