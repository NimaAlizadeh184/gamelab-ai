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
    <Link href={href} style={{ textDecoration: "none" }} className="group block h-full">
      <div
        className="flex flex-col h-full rounded-2xl overflow-hidden transition-all duration-200"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.borderColor = "var(--accent)";
          el.style.transform = "translateY(-2px)";
          el.style.boxShadow = "0 8px 24px rgba(0,0,0,0.3)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.borderColor = "var(--border)";
          el.style.transform = "translateY(0)";
          el.style.boxShadow = "none";
        }}
      >
        {/* Icon area */}
        <div
          className="flex items-center justify-center py-8 text-4xl"
          style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-subtle)" }}
        >
          {icon}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-5">
          <h2 className="text-base font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>
            {title}
          </h2>
          <p className="text-sm leading-relaxed flex-1" style={{ color: "var(--text-secondary)" }}>
            {description}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: "var(--bg-secondary)", color: "var(--text-muted)", border: "1px solid var(--border-subtle)" }}
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
