"use client";

import Link from "next/link";

interface GameCardProps {
  title: string;
  description: string;
  href: string;
  icon: string;
  tags: string[];
  color: string;
}

export default function GameCard({ title, description, href, icon, tags, color }: GameCardProps) {
  return (
    <Link href={href} className="block h-full group" style={{ textDecoration: "none" }}>
      <div
        className="flex flex-col h-full rounded-2xl overflow-hidden transition-all duration-200"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-sm)",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.transform = "translateY(-3px)";
          el.style.borderColor = color + "60";
          el.style.boxShadow = `0 12px 32px rgba(0,0,0,0.6), 0 0 0 1px ${color}30`;
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.transform = "translateY(0)";
          el.style.borderColor = "var(--border)";
          el.style.boxShadow = "var(--shadow-sm)";
        }}
      >
        {/* Icon area */}
        <div
          className="relative flex items-center justify-center py-9"
          style={{
            background: `linear-gradient(135deg, ${color}1a 0%, ${color}08 100%)`,
            borderBottom: `1px solid ${color}20`,
          }}
        >
          <span className="text-4xl select-none">{icon}</span>
          {/* Subtle glow dot */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1 h-1 rounded-full"
            style={{ background: color, opacity: 0.6, boxShadow: `0 0 8px 3px ${color}` }}
          />
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-5">
          <h2 className="text-sm font-semibold mb-1.5 tracking-tight" style={{ color: "var(--text-primary)" }}>
            {title}
          </h2>
          <p className="text-xs leading-relaxed flex-1" style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>
            {description}
          </p>

          <div
            className="flex items-center justify-between mt-4 pt-3.5"
            style={{ borderTop: "1px solid var(--border-subtle)" }}
          >
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: "var(--bg-secondary)",
                    color: "var(--text-muted)",
                    border: "1px solid var(--border-subtle)",
                    fontSize: "0.7rem",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
            <span
              className="text-xs font-medium shrink-0 ml-3 transition-colors duration-150"
              style={{ color: "var(--text-muted)" }}
            >
              Play →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
