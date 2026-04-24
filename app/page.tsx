import GameCard from "@/components/GameCard";

const games = [
  {
    title: "Tic-Tac-Toe",
    description: "The classic 3×3 grid. Play against a friend locally or challenge an unbeatable AI.",
    href: "/games/tictactoe",
    icon: "⭕",
    tags: ["2 Players", "vs AI", "Strategy"],
  },
  {
    title: "Memory",
    description: "Flip cards and find matching pairs. Three difficulty levels to keep it challenging.",
    href: "/games/memory",
    icon: "🧩",
    tags: ["Single Player", "Puzzle"],
  },
  {
    title: "Snake",
    description: "Guide the snake, eat food, and grow as long as you can without hitting the walls.",
    href: "/games/snake",
    icon: "🐍",
    tags: ["Single Player", "Arcade"],
  },
  {
    title: "Blackjack",
    description: "Beat the dealer to 21 without going bust. Hit, stand, or double down.",
    href: "/games/blackjack",
    icon: "♠️",
    tags: ["Single Player", "Card Game"],
  },
];

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header
        className="w-full"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center gap-2.5">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            G
          </div>
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            GameLab
          </span>
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-5xl mx-auto w-full px-6 pt-14 pb-10">
        <p className="text-xs font-medium uppercase tracking-widest mb-4" style={{ color: "var(--accent)" }}>
          All games
        </p>
        <h1 className="text-3xl font-semibold tracking-tight mb-3" style={{ color: "var(--text-primary)" }}>
          Pick something to play
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {games.length} games available — more coming soon.
        </p>
      </div>

      {/* Grid */}
      <div className="max-w-5xl mx-auto w-full px-6 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {games.map((game) => (
            <GameCard key={game.href} {...game} />
          ))}
        </div>
      </div>

      <div className="flex-1" />

      <footer
        className="text-center py-5 text-xs"
        style={{ color: "var(--text-muted)", borderTop: "1px solid var(--border-subtle)" }}
      >
        GameLab
      </footer>
    </main>
  );
}
