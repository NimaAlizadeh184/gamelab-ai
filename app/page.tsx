import GameCard from "@/components/GameCard";

const games = [
  {
    title: "Tic-Tac-Toe",
    description: "Classic 3×3 strategy. Play against a friend locally or face an unbeatable AI.",
    href: "/games/tictactoe",
    icon: "⭕",
    tags: ["2 Players", "vs AI"],
    color: "#3B82F6",
  },
  {
    title: "Memory",
    description: "Flip cards, find pairs. Three difficulty levels — how fast can you clear the board?",
    href: "/games/memory",
    icon: "🧩",
    tags: ["Single Player", "Puzzle"],
    color: "#A855F7",
  },
  {
    title: "Snake",
    description: "Guide the snake, eat food, and grow without hitting the walls. Three speeds.",
    href: "/games/snake",
    icon: "🐍",
    tags: ["Single Player", "Arcade"],
    color: "#22C55E",
  },
  {
    title: "Blackjack",
    description: "Beat the dealer to 21. Hit, stand, or double down — starts with $1,000 in chips.",
    href: "/games/blackjack",
    icon: "♠️",
    tags: ["Single Player", "Cards"],
    color: "#F59E0B",
  },
  {
    title: "2048",
    description: "Slide tiles to merge numbers and reach 2048. Easy to learn, hard to master.",
    href: "/games/2048",
    icon: "🔢",
    tags: ["Single Player", "Puzzle"],
    color: "#EF4444",
  },
  {
    title: "Rock Paper Scissors",
    description: "The timeless hand game. Play best-of-5 against a random AI.",
    href: "/games/rps",
    icon: "✊",
    tags: ["vs AI", "Quick Play"],
    color: "#06B6D4",
  },
  {
    title: "Minesweeper",
    description: "Clear the minefield without detonating a single bomb. Flagging optional.",
    href: "/games/minesweeper",
    icon: "💣",
    tags: ["Single Player", "Strategy"],
    color: "#F97316",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col" style={{ background: "var(--bg-primary)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-20 w-full"
        style={{
          background: "rgba(22,22,22,0.88)",
          borderBottom: "1px solid var(--border-subtle)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <div className="max-w-5xl mx-auto px-6 flex items-center gap-2.5" style={{ height: 52 }}>
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            G
          </div>
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            GameLab
          </span>
          <div className="flex-1" />
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {games.length} games
          </span>
        </div>
      </header>

      {/* Hero */}
      <div
        className="w-full"
        style={{
          background: "linear-gradient(to bottom, rgba(217,119,87,0.06) 0%, transparent 100%)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div className="max-w-5xl mx-auto px-6 py-12">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--accent)" }}>
            Game Collection
          </p>
          <h1 className="text-3xl font-semibold tracking-tight mb-2" style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            Pick something to play
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            All games run in your browser — no download, no login.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {games.map((game) => (
            <GameCard key={game.href} {...game} />
          ))}
        </div>
      </div>

      <footer
        className="text-center py-5 text-xs"
        style={{ color: "var(--text-muted)", borderTop: "1px solid var(--border-subtle)" }}
      >
        GameLab · Built with Next.js
      </footer>
    </main>
  );
}
