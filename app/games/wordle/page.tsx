"use client";

import { useState, useEffect, useCallback } from "react";
import GameHeader from "@/components/GameHeader";
import { ANSWERS, randomAnswer } from "./words";

const COLOR = "#4ADE80";
const MAX_GUESSES = 6;
const WORD_LENGTH = 5;

type LetterState = "correct" | "present" | "absent" | "empty" | "tbd";

interface TileData { letter: string; state: LetterState; }

function evaluateGuess(guess: string, answer: string): LetterState[] {
  const result: LetterState[] = Array(WORD_LENGTH).fill("absent");
  const answerArr = answer.split("");
  const guessArr  = guess.split("");

  // First pass: mark correct
  guessArr.forEach((l, i) => {
    if (l === answerArr[i]) { result[i] = "correct"; answerArr[i] = "#"; guessArr[i] = "#"; }
  });

  // Second pass: mark present
  guessArr.forEach((l, i) => {
    if (l === "#") return;
    const idx = answerArr.indexOf(l);
    if (idx !== -1) { result[i] = "present"; answerArr[idx] = "#"; }
  });

  return result;
}

function buildKeyboardState(guesses: string[], results: LetterState[][]): Record<string, LetterState> {
  const state: Record<string, LetterState> = {};
  const priority: Record<LetterState, number> = { correct: 3, present: 2, absent: 1, empty: 0, tbd: 0 };
  guesses.forEach((guess, gi) => {
    guess.split("").forEach((l, li) => {
      const s = results[gi][li];
      if (!state[l] || priority[s] > priority[state[l]]) state[l] = s;
    });
  });
  return state;
}

const TILE_BG: Record<LetterState, string> = {
  correct: "var(--success)",
  present: "var(--warning)",
  absent:  "var(--bg-raised)",
  empty:   "var(--bg-card)",
  tbd:     "var(--bg-card-hover)",
};

const TILE_BORDER: Record<LetterState, string> = {
  correct: "var(--success)",
  present: "var(--warning)",
  absent:  "var(--border)",
  empty:   "var(--border-subtle)",
  tbd:     "var(--border-strong)",
};

const TILE_COLOR: Record<LetterState, string> = {
  correct: "#fff",
  present: "#fff",
  absent:  "var(--text-secondary)",
  empty:   "transparent",
  tbd:     "var(--text-primary)",
};

const KEY_ROWS = [
  ["Q","W","E","R","T","Y","U","I","O","P"],
  ["A","S","D","F","G","H","J","K","L"],
  ["ENTER","Z","X","C","V","B","N","M","⌫"],
];

export default function WordlePage() {
  const [answer,      setAnswer]      = useState(() => randomAnswer());
  const [guesses,     setGuesses]     = useState<string[]>([]);
  const [results,     setResults]     = useState<LetterState[][]>([]);
  const [current,     setCurrent]     = useState("");
  const [phase,       setPhase]       = useState<"playing"|"won"|"lost">("playing");
  const [shake,       setShake]       = useState(false);
  const [message,     setMessage]     = useState("");
  const [revealed,    setRevealed]    = useState<number[]>([]);   // row indices that are mid-reveal

  const flash = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 1800);
  };

  const submitGuess = useCallback(() => {
    if (current.length !== WORD_LENGTH) { setShake(true); setTimeout(() => setShake(false), 500); flash("Not enough letters"); return; }
    if (!ANSWERS.includes(current.toLowerCase())) { setShake(true); setTimeout(() => setShake(false), 500); flash("Not in word list"); return; }

    const guess = current.toLowerCase();
    const result = evaluateGuess(guess, answer);
    const newGuesses = [...guesses, guess];
    const newResults = [...results, result];

    setGuesses(newGuesses);
    setResults(newResults);
    setCurrent("");
    setRevealed([...revealed, newGuesses.length - 1]);

    const won = result.every((s) => s === "correct");
    if (won)                             { setTimeout(() => { setPhase("won");  flash("Genius! 🎉"); }, 350 * WORD_LENGTH); }
    else if (newGuesses.length >= MAX_GUESSES) { setTimeout(() => { setPhase("lost"); flash(answer.toUpperCase()); }, 350 * WORD_LENGTH); }
  }, [current, answer, guesses, results, revealed]);

  const pressKey = useCallback((key: string) => {
    if (phase !== "playing") return;
    if (key === "ENTER") { submitGuess(); return; }
    if (key === "⌫" || key === "BACKSPACE") { setCurrent((c) => c.slice(0, -1)); return; }
    if (/^[A-Za-z]$/.test(key) && current.length < WORD_LENGTH) setCurrent((c) => c + key.toUpperCase());
  }, [phase, current, submitGuess]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      pressKey(e.key === "Backspace" ? "BACKSPACE" : e.key === "Enter" ? "ENTER" : e.key.toUpperCase());
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pressKey]);

  const newGame = () => {
    setAnswer(randomAnswer());
    setGuesses([]); setResults([]); setCurrent("");
    setPhase("playing"); setMessage(""); setRevealed([]);
  };

  const keyState = buildKeyboardState(guesses, results);

  // Build board rows
  const rows: TileData[][] = [];
  for (let r = 0; r < MAX_GUESSES; r++) {
    const row: TileData[] = [];
    if (r < guesses.length) {
      guesses[r].split("").forEach((l, c) => row.push({ letter: l.toUpperCase(), state: results[r][c] }));
    } else if (r === guesses.length && phase === "playing") {
      for (let c = 0; c < WORD_LENGTH; c++)
        row.push({ letter: current[c] ?? "", state: current[c] ? "tbd" : "empty" });
    } else {
      for (let c = 0; c < WORD_LENGTH; c++) row.push({ letter: "", state: "empty" });
    }
    rows.push(row);
  }

  return (
    <div className="page">
      <GameHeader title="Wordle" color={COLOR} />
      <main className="page-content items-center">
        <div className="game-container flex flex-col items-center" style={{ maxWidth: 380 }}>

          {/* Message toast */}
          <div
            className="text-sm font-semibold px-4 py-2 rounded-xl mb-4 transition-all duration-200"
            style={{
              background: message ? "var(--bg-raised)" : "transparent",
              color: "var(--text-primary)",
              border: message ? "1px solid var(--border)" : "1px solid transparent",
              opacity: message ? 1 : 0,
              minHeight: 36,
            }}
          >
            {message}
          </div>

          {/* Board */}
          <div className="flex flex-col gap-1.5 mb-6">
            {rows.map((row, r) => (
              <div
                key={r}
                className="flex gap-1.5"
                style={{ animation: r === guesses.length && shake ? "shake 0.4s ease" : undefined }}
              >
                {row.map((tile, c) => {
                  const isRevealed = r < guesses.length;
                  const delay = isRevealed ? `${c * 0.12}s` : "0s";
                  return (
                    <div
                      key={c}
                      className="flex items-center justify-center font-bold text-xl rounded-lg select-none"
                      style={{
                        width: 58, height: 58,
                        background: TILE_BG[tile.state],
                        border: `2px solid ${TILE_BORDER[tile.state]}`,
                        color: TILE_COLOR[tile.state],
                        transition: isRevealed ? `background ${0.12}s ease ${delay}, border-color ${0.12}s ease ${delay}, color ${0.12}s ease ${delay}` : "border-color 0.1s",
                        transform: tile.letter && !isRevealed ? "scale(1.05)" : "scale(1)",
                      }}
                    >
                      {tile.letter}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Keyboard */}
          <div className="flex flex-col gap-1.5 w-full">
            {KEY_ROWS.map((row, i) => (
              <div key={i} className="flex gap-1 justify-center">
                {row.map((key) => {
                  const s = keyState[key] as LetterState | undefined;
                  const isWide = key === "ENTER" || key === "⌫";
                  return (
                    <button
                      key={key}
                      onClick={() => pressKey(key)}
                      className="rounded-lg font-semibold transition-all duration-150 active:scale-95"
                      style={{
                        height: 56,
                        minWidth: isWide ? 64 : 36,
                        flex: isWide ? "0 0 64px" : "0 0 36px",
                        fontSize: isWide ? "0.7rem" : "0.875rem",
                        background: s === "correct" ? "var(--success)"
                                  : s === "present" ? "var(--warning)"
                                  : s === "absent"  ? "var(--bg-raised)"
                                  : "var(--bg-card)",
                        color: (s === "correct" || s === "present") ? "#fff"
                             : s === "absent" ? "var(--text-muted)"
                             : "var(--text-primary)",
                        border: "1px solid var(--border-subtle)",
                      }}
                    >
                      {key}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {phase !== "playing" && (
            <button className="btn btn-primary btn-lg mt-6" style={{ background: COLOR }} onClick={newGame}>
              New game
            </button>
          )}
        </div>
      </main>

      <style>{`
        @keyframes shake {
          0%,100%{ transform: translateX(0); }
          20%    { transform: translateX(-6px); }
          40%    { transform: translateX(6px); }
          60%    { transform: translateX(-4px); }
          80%    { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}
