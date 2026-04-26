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
          el.style.borderColor = color + "55";
          el.style.boxShadow = `0 16px 40px rgba(0,0,0,0.55), 0 0 0 1px ${color}25`;
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
          className="relative flex items-center justify-center py-10"
          style={{
            background: `radial-gradient(ellipse at 50% 60%, ${color}22 0%, ${color}06 70%, transparent 100%)`,
            borderBottom: `1px solid ${color}18`,
          }}
        >
          {/* Icon container */}
          <div
            className="flex items-center justify-center rounded-2xl text-4xl select-none transition-transform duration-200 group-hover:scale-110"
            style={{
              width: 72,
              height: 72,
              background: `linear-gradient(145deg, ${color}20, ${color}08)`,
              border: `1px solid ${color}28`,
              boxShadow: `0 4px 20px ${color}25, inset 0 1px 0 ${color}30`,
            }}
          >
            {icon}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-5">
          <h2 className="text-sm font-semibold mb-1.5 tracking-tight" style={{ color: "var(--text-primary)" }}>
            {title}
          </h2>
          <p className="text-xs leading-relaxed flex-1" style={{ color: "var(--text-secondary)", lineHeight: 1.65 }}>
            {description}
          </p>

          <div className="flex items-center justify-between mt-4 pt-3.5" style={{ borderTop: "1px solid var(--border-subtle)" }}>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full"
                  style={{
                    background: `${color}12`,
                    color,
                    border: `1px solid ${color}25`,
                    fontSize: "0.68rem",
                    fontWeight: 500,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
            <span
              className="text-xs font-medium shrink-0 ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
              style={{ color }}
            >
              Play →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
