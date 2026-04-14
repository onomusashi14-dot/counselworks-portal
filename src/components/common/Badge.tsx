import type { ReactNode } from "react";

export type BadgeColor = "green" | "amber" | "red" | "blue" | "gray" | "mustard";

interface BadgeProps {
  color?: BadgeColor;
  children: ReactNode;
  withDot?: boolean;
}

const COLOR_MAP: Record<BadgeColor, string> = {
  green: "var(--green)",
  amber: "var(--amber)",
  red: "var(--red)",
  blue: "var(--accent)",
  gray: "var(--text-2)",
  mustard: "var(--mustard)",
};

export default function Badge({
  color = "gray",
  children,
  withDot = false,
}: BadgeProps) {
  const c = COLOR_MAP[color] || COLOR_MAP.gray;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px",
        borderRadius: 999,
        background: `${c}26`,
        color: c,
        border: `1px solid ${c}66`,
        fontSize: 10,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        whiteSpace: "nowrap",
      }}
    >
      {withDot && (
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: c,
          }}
        />
      )}
      {children}
    </span>
  );
}
