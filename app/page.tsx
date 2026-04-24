import GameCard from "@/components/GameCard";

const games = [
  {
    title: "Tic-Tac-Toe",
    description: "The classic 3×3 grid game. Play against a friend locally or challenge an AI opponent.",
    href: "/games/tictactoe",
    icon: "⭕",
    tags: ["2 Players", "vs AI", "Strategy"],
  },
  {
    title: "Memory",
    description: "Flip cards and find matching pairs. Test your memory and beat your best time.",
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
    description: "Beat the dealer to 21 without going bust. Classic casino card game.",
    href: "/games/blackjack",
    icon: "♠️",
    tags: ["Single Player", "Card Game"],
  },
];

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-16">
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              G
            </div>
            <span className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
              GameLab
            </span>
          </div>
          <h1 className="text-4xl font-semibold mb-3 tracking-tight" style={{ color: "var(--text-primary)" }}>
            Pick a game
          </h1>
          <p className="text-base" style={{ color: "var(--text-secondary)" }}>
            {games.length} games available — more coming soon.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {games.map((game) => (
            <GameCard key={game.href} {...game} />
          ))}
        </div>
      </div>

      <footer
        className="text-center py-6 text-xs"
        style={{ color: "var(--text-muted)", borderTop: "1px solid var(--border-subtle)" }}
      >
        GameLab — built with Next.js
      </footer>
    </main>
  );
}
