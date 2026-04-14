import type { ReactNode } from "react";

interface SlideOverPanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: number;
}

export default function SlideOverPanel({
  open,
  onClose,
  title,
  children,
  width = 520,
}: SlideOverPanelProps) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      <div
        onClick={onClose}
        style={{ flex: 1, background: "rgba(15,30,46,0.55)" }}
      />
      <div
        className="cw-scroll"
        style={{
          width,
          background: "var(--white)",
          borderLeft: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{title}</h3>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              fontSize: 20,
              color: "var(--text-2)",
              cursor: "pointer",
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div
          className="cw-scroll"
          style={{ flex: 1, overflowY: "auto", padding: 24 }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
