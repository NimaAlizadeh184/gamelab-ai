"use client";

import Link from "next/link";

interface GameHeaderProps {
  title: string;
  color?: string;
}

export default function GameHeader({ title, color }: GameHeaderProps) {
  return (
    <header
      className="sticky top-0 z-20 w-full"
      style={{
        background: "rgba(22, 22, 22, 0.88)",
        borderBottom: "1px solid var(--border-subtle)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div className="max-w-2xl mx-auto px-5 h-13 flex items-center gap-3" style={{ height: 52 }}>
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold transition-all duration-150 group-hover:scale-105"
            style={{ background: color ?? "var(--accent)", color: "#fff" }}
          >
            G
          </div>
          <span
            className="text-xs font-medium transition-colors duration-150"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            GameLab
          </span>
        </Link>

        <div className="w-px h-4 mx-0.5" style={{ background: "var(--border)" }} />

        <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
          {title}
        </span>
      </div>
    </header>
  );
}
