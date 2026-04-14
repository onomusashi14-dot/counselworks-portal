import type { CSSProperties, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "destructive";

interface ButtonProps {
  variant?: ButtonVariant;
  children: ReactNode;
  onClick?: () => void;
  style?: CSSProperties;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export default function Button({
  variant = "primary",
  children,
  onClick,
  style = {},
  disabled = false,
  type = "button",
}: ButtonProps) {
  const base: CSSProperties = {
    padding: "8px 16px",
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    border: "1px solid transparent",
    boxShadow: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.55 : 1,
    ...style,
  };
  if (variant === "primary") {
    base.background = "var(--mustard)";
    base.color = "var(--white)";
    base.border = "1px solid var(--mustard)";
  } else if (variant === "secondary") {
    base.background = "var(--white)";
    base.color = "var(--text-1)";
    base.border = "1px solid var(--border)";
  } else if (variant === "destructive") {
    base.background = "var(--white)";
    base.color = "var(--red)";
    base.border = "1px solid var(--red)";
  }
  return (
    <button type={type} style={base} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
