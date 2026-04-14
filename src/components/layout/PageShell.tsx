import type { ReactNode } from "react";
import Sidebar, { type NavKey } from "./Sidebar";
import Footer from "../common/Footer";

interface PageShellProps {
  current: NavKey;
  onNavigate: (key: NavKey) => void;
  counts: {
    on_track: number;
    needs_attention: number;
    blocked: number;
  };
  countsLoaded?: boolean;
  children: ReactNode;
}

export default function PageShell({
  current,
  onNavigate,
  counts,
  countsLoaded,
  children,
}: PageShellProps) {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--canvas)",
      }}
    >
      <Sidebar
        current={current}
        onNavigate={onNavigate}
        counts={counts}
        countsLoaded={countsLoaded}
      />
      <main style={{ flex: 1, padding: "32px 40px", overflowX: "auto" }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            minHeight: "calc(100vh - 64px)",
          }}
        >
          <div style={{ flex: 1 }}>{children}</div>
          <Footer />
        </div>
      </main>
    </div>
  );
}
