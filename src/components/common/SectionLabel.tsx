import type { CSSProperties, ReactNode } from "react";

interface SectionLabelProps {
  children: ReactNode;
  style?: CSSProperties;
}

export default function SectionLabel({
  children,
  style = {},
}: SectionLabelProps) {
  return (
    <div
      style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "var(--text-3)",
        marginBottom: 12,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
