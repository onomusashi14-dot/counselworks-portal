import type { CSSProperties } from "react";
import type { DocActionState, HealthStatus } from "../data/mockData";

export const healthColor = (status: HealthStatus | string): string => {
  if (status === "on_track") return "var(--green)";
  if (status === "needs_attention") return "var(--amber)";
  if (status === "blocked") return "var(--red)";
  return "var(--text-3)";
};

export const healthLabel = (status: HealthStatus | string): string => {
  if (status === "on_track") return "On Track";
  if (status === "needs_attention") return "Needs Attention";
  if (status === "blocked") return "Blocked";
  return "—";
};

export const healthBadgeColor = (
  h: HealthStatus | string
): "green" | "amber" | "red" =>
  h === "on_track" ? "green" : h === "needs_attention" ? "amber" : "red";

export const categoryColor = (cat: string): string => {
  const map: Record<string, string> = {
    pleading: "var(--accent)",
    medical: "var(--red)",
    billing: "var(--mustard)",
    evidence: "var(--green)",
    correspondence: "var(--text-2)",
    court_order: "var(--navy-2)",
  };
  return map[cat] || "var(--text-2)";
};

export const actionStateColor = (state: DocActionState | string): string => {
  if (state === "received") return "var(--green)";
  if (state === "pending_review") return "var(--amber)";
  if (state === "used_in_draft") return "var(--accent)";
  return "var(--red)";
};

export const formatRelative = (minutes: number): string => {
  if (minutes < 60) return `${minutes} minutes ago`;
  const h = Math.round(minutes / 60);
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const d = Math.round(h / 24);
  return `${d} day${d === 1 ? "" : "s"} ago`;
};

export const greeting = (): string => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

export const todayLabel = (): string => {
  const d = new Date();
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

// Shared style for table <th> cells.
export const thStyle: CSSProperties = {
  textAlign: "left",
  padding: "12px 12px",
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "var(--text-2)",
  borderBottom: "1px solid var(--border)",
};
