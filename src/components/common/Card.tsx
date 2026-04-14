import type { CSSProperties, ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  style?: CSSProperties;
  leftBorderColor?: string;
  className?: string;
}

export default function Card({
  children,
  style = {},
  leftBorderColor,
  className = "",
}: CardProps) {
  return (
    <div
      className={className}
      style={{
        background: "var(--white)",
        border: "1px solid var(--border)",
        borderLeft: leftBorderColor
          ? `2px solid ${leftBorderColor}`
          : "1px solid var(--border)",
        borderRadius: 6,
        padding: 20,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
