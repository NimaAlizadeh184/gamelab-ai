"use client";

import Link from "next/link";

interface GameCardProps {
  title: string;
  description: string;
  href: string;
  icon: string;
  tags: string[];
}

export default function GameCard({ title, description, href, icon, tags }: GameCardProps) {
  return (
    <Link href={href} className="group block">
      <div
        className="relative rounded-2xl p-6 h-full transition-all duration-200 cursor-pointer"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.background = "var(--bg-card-hover)";
          (e.currentTarget as HTMLDivElement).style.borderColor = "var(--accent)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.background = "var(--bg-card)";
          (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
        }}
      >
        <div className="text-4xl mb-4">{icon}</div>
        <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
          {title}
        </h2>
        <p className="text-sm mb-4 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          {description}
        </p>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-1 rounded-full"
              style={{
                background: "var(--accent-dim)",
                color: "var(--accent)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
        <div
          className="absolute bottom-6 right-6 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ color: "var(--accent)" }}
        >
          Play →
        </div>
      </div>
    </Link>
  );
}
