"use client";

import Link from "next/link";

interface GameHeaderProps {
  title: string;
}

export default function GameHeader({ title }: GameHeaderProps) {
  return (
    <header
      className="sticky top-0 z-10 w-full"
      style={{ background: "var(--bg-primary)", borderBottom: "1px solid var(--border-subtle)" }}
    >
      <div className="max-w-2xl mx-auto px-5 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 group"
          style={{ textDecoration: "none" }}
        >
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold transition-opacity group-hover:opacity-80"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            G
          </div>
          <span
            className="text-sm font-medium transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            GameLab
          </span>
        </Link>

        <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
          {title}
        </span>

        <div style={{ width: 80 }} />
      </div>
    </header>
  );
}
