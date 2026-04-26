"use client";

import { useState, useCallback } from "react";
import GameHeader from "@/components/GameHeader";

const COLOR = "#06B6D4";

type Choice = "rock" | "paper" | "scissors";
type Result = "win" | "loss" | "draw";

const CHOICES: { value: Choice; icon: string; label: string }[] = [
  { value: "rock",     icon: "✊", label: "Rock" },
  { value: "paper",    icon: "🖐️", label: "Paper" },
  { value: "scissors", icon: "✌️", label: "Scissors" },
];

const BEATS: Record<Choice, Choice> = { rock: "scissors", paper: "rock", scissors: "paper" };

function getResult(player: Choice, ai: Choice): Result {
  if (player === ai) return "draw";
  return BEATS[player] === ai ? "win" : "loss";
}

const AI_LABELS: Record<Result, string> = { win: "loses", loss: "wins", draw: "ties" };
const RESULT_LABELS: Record<Result, string> = { win: "You win!", loss: "AI wins.", draw: "Draw!" };

const TARGET = 5;

export default function RPSPage() {
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [aiChoice, setAiChoice] = useState<Choice | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [score, setScore] = useState({ wins: 0, losses: 0, draws: 0 });
  const [round, setRound] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [animating, setAnimating] = useState(false);

  const play = useCallback((choice: Choice) => {
    if (animating || gameOver) return;
    setAnimating(true);
    setPlayerChoice(choice);
    setAiChoice(null);
    setResult(null);

    setTimeout(() => {
      const ai = CHOICES[Math.floor(Math.random() * 3)].value;
      const res = getResult(choice, ai);
      setAiChoice(ai);
      setResult(res);
      setAnimating(false);
      setRound((r) => {
        const nr = r + 1;
        setScore((s) => {
          const ns = { ...s, [res === "win" ? "wins" : res === "loss" ? "losses" : "draws"]: s[res === "win" ? "wins" : res === "loss" ? "losses" : "draws"] + 1 };
          if (nr >= TARGET || ns.wins >= Math.ceil(TARGET / 2) || ns.losses >= Math.ceil(TARGET / 2)) setGameOver(true);
          return ns;
        });
        return nr;
      });
    }, 500);
  }, [animating, gameOver]);

  const reset = () => {
    setPlayerChoice(null); setAiChoice(null); setResult(null);
    setScore({ wins: 0, losses: 0, draws: 0 });
    setRound(0); setGameOver(false); setAnimating(false);
  };

  const [started, setStarted] = useState(false);
  const wins = score.wins, losses = score.losses;
  const finalResult = wins > losses ? "win" : losses > wins ? "loss" : "draw";

  if (!started) {
    return (
      <div className="page">
        <GameHeader title="Rock Paper Scissors" color={COLOR} />
        <main className="page-content justify-center">
          <div className="game-container" style={{ maxWidth: 340 }}>
            <div className="flex justify-center mb-6">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
                style={{ background: `linear-gradient(145deg, ${COLOR}25, ${COLOR}08)`, border: `1px solid ${COLOR}30` }}
              >
                ✊
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center mb-2 tracking-tight" style={{ color: "var(--text-primary)" }}>Rock Paper Scissors</h2>
            <p className="text-sm text-center mb-6" style={{ color: "var(--text-secondary)" }}>
              Best of {TARGET} against the AI. First to {Math.ceil(TARGET / 2)} wins takes the series.
            </p>
            <div className="card p-4 mb-8">
              <div className="text-xs space-y-3" style={{ color: "var(--text-secondary)" }}>
                <div className="flex items-center gap-3">
                  <span className="text-base">✊</span>
                  <span>Rock beats Scissors</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-base">🖐️</span>
                  <span>Paper beats Rock</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-base">✌️</span>
                  <span>Scissors beats Paper</span>
                </div>
              </div>
            </div>
            <button
              className="btn btn-primary btn-lg w-full"
              style={{ background: COLOR, color: "#fff" }}
              onClick={() => setStarted(true)}
            >
              Start game
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page">
      <GameHeader title="Rock Paper Scissors" color={COLOR} />
      <main className="page-content justify-center">
        <div className="game-container" style={{ maxWidth: 380 }}>

          {/* Score */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { label: "You",   value: score.wins,   color: "var(--success)" },
              { label: "Draws", value: score.draws,  color: "var(--text-muted)" },
              { label: "AI",    value: score.losses, color: "var(--error)" },
            ].map(({ label, value, color }) => (
              <div key={label} className="card text-center py-3">
                <div className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>{label}</div>
                <div className="text-2xl font-bold" style={{ color }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>Round {round}/{TARGET}</span>
          </div>
          <div className="rounded-full mb-8 overflow-hidden" style={{ height: 4, background: "var(--bg-raised)" }}>
            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${(round / TARGET) * 100}%`, background: COLOR }} />
          </div>

          {/* Arena */}
          <div
            className="rounded-2xl p-6 mb-8 flex items-center justify-around"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", minHeight: 140 }}
          >
            {playerChoice ? (
              <>
                <div className="text-center">
                  <div className="text-5xl mb-2">{CHOICES.find((c) => c.value === playerChoice)?.icon}</div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>You</div>
                </div>
                <div className="text-lg font-bold" style={{ color: "var(--text-muted)" }}>vs</div>
                <div className="text-center">
                  {animating ? (
                    <div className="text-5xl mb-2" style={{ filter: "grayscale(1)", opacity: 0.3 }}>?</div>
                  ) : (
                    <div className="text-5xl mb-2">{CHOICES.find((c) => c.value === aiChoice)?.icon}</div>
                  )}
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>AI</div>
                </div>
              </>
            ) : (
              <div className="text-center w-full">
                <div className="text-3xl mb-2" style={{ opacity: 0.3 }}>✊ 🖐️ ✌️</div>
                <div className="text-sm" style={{ color: "var(--text-muted)" }}>Pick a move below</div>
              </div>
            )}
          </div>

          {/* Result badge */}
          {result && !gameOver && (
            <div
              className={`rounded-xl px-4 py-2.5 mb-6 text-center text-sm font-medium ${result === "win" ? "badge-success" : result === "loss" ? "badge-error" : "badge-accent"}`}
            >
              {RESULT_LABELS[result]}
              {aiChoice && (
                <span style={{ opacity: 0.7, fontWeight: 400 }}>
                  {" "}· AI played {CHOICES.find((c) => c.value === aiChoice)?.label}
                </span>
              )}
            </div>
          )}

          {/* Game over */}
          {gameOver && (
            <div
              className={`rounded-xl px-4 py-3 mb-6 text-center ${finalResult === "win" ? "badge-success" : finalResult === "loss" ? "badge-error" : "badge-accent"}`}
            >
              <div className="text-base font-semibold mb-0.5">
                {finalResult === "win" ? "You win the series! 🎉" : finalResult === "loss" ? "AI wins the series." : "Series ends in a draw."}
              </div>
              <div className="text-xs" style={{ opacity: 0.7 }}>Final: {wins}W – {losses}L – {score.draws}D</div>
            </div>
          )}

          {/* Choices */}
          {!gameOver ? (
            <div className="grid grid-cols-3 gap-3">
              {CHOICES.map(({ value, icon, label }) => (
                <button
                  key={value}
                  onClick={() => play(value)}
                  disabled={animating}
                  className="btn btn-secondary flex flex-col gap-1 py-5"
                  style={{
                    borderColor: playerChoice === value && result ? (result === "win" ? "var(--success)" : result === "loss" ? "var(--error)" : "var(--border)") : "var(--border)",
                  }}
                  onMouseEnter={(e) => { if (!animating) e.currentTarget.style.borderColor = COLOR; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = playerChoice === value && result ? (result === "win" ? "var(--success)" : result === "loss" ? "var(--error)" : "var(--border)") : "var(--border)"; }}
                >
                  <span className="text-3xl">{icon}</span>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</span>
                </button>
              ))}
            </div>
          ) : (
            <button className="btn btn-primary w-full btn-lg" style={{ background: COLOR }} onClick={reset}>
              Play again
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
