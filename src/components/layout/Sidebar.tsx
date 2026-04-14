import type { CSSProperties } from "react";

export type NavKey =
  | "morning"
  | "active"
  | "requests"
  | "drafts"
  | "documents";

interface SidebarProps {
  current: NavKey;
  onNavigate: (key: NavKey) => void;
  counts: {
    on_track: number;
    needs_attention: number;
    blocked: number;
  };
  countsLoaded?: boolean;
  userName?: string;
  userRole?: string;
  onLogout?: () => void;
}

const NAV_ITEMS: { key: NavKey; label: string }[] = [
  { key: "morning", label: "Morning Brief" },
  { key: "active", label: "Active Files" },
  { key: "requests", label: "Request Center" },
  { key: "drafts", label: "Drafts Inbox" },
  { key: "documents", label: "Documents" },
];

function NavIcon({ name }: { name: NavKey }) {
  const common = {
    width: 16,
    height: 16,
    stroke: "currentColor",
    fill: "none",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (name === "morning")
    return (
      <svg {...common} viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
      </svg>
    );
  if (name === "active")
    return (
      <svg {...common} viewBox="0 0 24 24">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    );
  if (name === "requests")
    return (
      <svg {...common} viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    );
  if (name === "drafts")
    return (
      <svg {...common} viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M16 13H8M16 17H8" />
      </svg>
    );
  if (name === "documents")
    return (
      <svg {...common} viewBox="0 0 24 24">
        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
      </svg>
    );
  return null;
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatRole(role?: string): string {
  if (!role) return "Attorney";
  return role
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function Sidebar({
  current,
  onNavigate,
  counts,
  countsLoaded = true,
  userName = "James Mitchell",
  userRole,
  onLogout,
}: SidebarProps) {
  const fmt = (n: number) => (countsLoaded ? String(n) : "—");
  const initials = getInitials(userName);
  const displayRole = formatRole(userRole);

  return (
    <aside
      style={{
        width: 240,
        minWidth: 240,
        background: "var(--navy)",
        color: "var(--white)",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        height: "100vh",
      }}
    >
      <div
        style={{
          padding: "20px 20px 24px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: 4,
            background: "var(--mustard)",
            color: "var(--white)",
            fontWeight: 800,
            fontSize: 11,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          CW
        </div>
        <div style={{ fontSize: 15, fontWeight: 700 }}>CounselWorks</div>
      </div>

      <nav style={{ flex: 1, padding: "0 10px" }}>
        {NAV_ITEMS.map((item) => {
          const active = current === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                width: "100%",
                padding: "10px 16px",
                marginBottom: 2,
                borderRadius: 6,
                background: active ? "rgba(201,125,46,0.12)" : "transparent",
                color: active ? "#FFFFFF" : "rgba(255,255,255,0.6)",
                fontWeight: active ? 700 : 500,
                fontSize: 13,
                border: "none",
                borderLeft: active
                  ? "2px solid var(--mustard)"
                  : "2px solid transparent",
                textAlign: "left",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.85)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                }
              }}
            >
              <NavIcon name={item.key} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.04)",
          padding: "10px 16px",
          fontSize: 11,
          fontWeight: 600,
          color: "rgba(255,255,255,0.7)",
          display: "flex",
          gap: 14,
          alignItems: "center",
        }}
      >
        <span
          style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--green)",
            }}
          />
          {fmt(counts.on_track)} on track
        </span>
        <span
          style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--amber)",
            }}
          />
          {fmt(counts.needs_attention)} attention
        </span>
        <span
          style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--red)",
            }}
          />
          {fmt(counts.blocked)} blocked
        </span>
      </div>

      <div
        style={{
          padding: "14px 16px",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "var(--navy-2)",
            color: "var(--white)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--white)",
            }}
          >
            {userName}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
            {displayRole}
          </div>
        </div>
        {onLogout && (
          <button
            title="Sign out"
            onClick={onLogout}
            style={{
              background: "transparent",
              border: "none",
              color: "rgba(255,255,255,0.5)",
              cursor: "pointer",
              padding: 4,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "rgba(255,255,255,0.9)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(255,255,255,0.5)";
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </button>
        )}
      </div>
    </aside>
  );
}
