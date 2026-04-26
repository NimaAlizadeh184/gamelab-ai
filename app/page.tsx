import GameCard from "@/components/GameCard";

const games = [
  {
    title: "Tetris",
    description: "Stack falling tetrominoes, clear lines, and survive as long as you can. Speed increases every level.",
    href: "/games/tetris",
    icon: "🟦",
    tags: ["Single Player", "Arcade"],
    color: "#818CF8",
  },
  {
    title: "Wordle",
    description: "Guess the hidden 5-letter word in 6 tries. Green means correct, yellow means wrong position.",
    href: "/games/wordle",
    icon: "🟩",
    tags: ["Single Player", "Word"],
    color: "#4ADE80",
  },
  {
    title: "Connect Four",
    description: "Drop discs and connect four in a row. Play against a friend or challenge the AI.",
    href: "/games/connectfour",
    icon: "🔴",
    tags: ["2 Players", "vs AI"],
    color: "#F472B6",
  },
  {
    title: "Blackjack",
    description: "Beat the dealer to 21 without going bust. Hit, stand, or double down. Starts with $1,000.",
    href: "/games/blackjack",
    icon: "🂡",
    tags: ["Single Player", "Cards"],
    color: "#F59E0B",
  },
  {
    title: "Snake",
    description: "Guide the snake, eat food, and grow as long as you can without hitting the walls.",
    href: "/games/snake",
    icon: "🐍",
    tags: ["Single Player", "Arcade"],
    color: "#22C55E",
  },
  {
    title: "2048",
    description: "Slide tiles to merge matching numbers. Reach 2048 to win. Harder than it looks.",
    href: "/games/2048",
    icon: "🔢",
    tags: ["Single Player", "Puzzle"],
    color: "#EF4444",
  },
  {
    title: "Minesweeper",
    description: "Clear the minefield without hitting a bomb. First click is always safe.",
    href: "/games/minesweeper",
    icon: "💣",
    tags: ["Single Player", "Strategy"],
    color: "#F97316",
  },
  {
    title: "Memory",
    description: "Flip cards and find matching pairs. Three difficulty levels to keep it challenging.",
    href: "/games/memory",
    icon: "🃏",
    tags: ["Single Player", "Puzzle"],
    color: "#A855F7",
  },
  {
    title: "Tic-Tac-Toe",
    description: "The classic 3x3 grid game. Play locally with a friend or face an unbeatable AI.",
    href: "/games/tictactoe",
    icon: "⭕",
    tags: ["2 Players", "vs AI"],
    color: "#3B82F6",
  },
  {
    title: "Rock Paper Scissors",
    description: "Best of 5 against an AI. Simple, fast, and surprisingly addictive.",
    href: "/games/rps",
    icon: "✊",
    tags: ["vs AI", "Quick Play"],
    color: "#06B6D4",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col" style={{ background: "var(--bg-primary)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-20 w-full"
        style={{
          background: "rgba(22,22,22,0.9)",
          borderBottom: "1px solid var(--border-subtle)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center gap-3" style={{ height: 52 }}>
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
            style={{ background: "var(--accent)", color: "#fff", boxShadow: "0 2px 8px rgba(217,119,87,0.4)" }}
          >
            G
          </div>
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>GameLab</span>
          <div className="flex-1" />
          <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border-subtle)" }}>
            {games.length} games
          </span>
        </div>
      </header>

      {/* Hero */}
      <div
        className="w-full"
        style={{
          background: "linear-gradient(160deg, rgba(217,119,87,0.07) 0%, transparent 60%)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-14">
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--accent)", letterSpacing: "0.12em" }}>
            Game Collection
          </p>
          <h1 className="text-4xl font-bold tracking-tight mb-3" style={{ color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
            Pick something to play
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            All games run in your browser. No download, no login.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {games.map((game) => (
            <GameCard key={game.href} {...game} />
          ))}
        </div>
      </div>

      <footer className="text-center py-6 text-xs" style={{ color: "var(--text-muted)", borderTop: "1px solid var(--border-subtle)" }}>
        GameLab · Built with Next.js
      </footer>
    </main>
  );
}
