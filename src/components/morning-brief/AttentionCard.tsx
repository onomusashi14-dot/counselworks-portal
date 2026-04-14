import Card from "../common/Card";
import type { AttentionItem } from "../../data/mockData";

interface AttentionCardProps {
  item: AttentionItem;
  onOpenCase: (id: string) => void;
}

export default function AttentionCard({
  item,
  onOpenCase,
}: AttentionCardProps) {
  const borderColor = item.severity === "red" ? "var(--red)" : "var(--amber)";
  return (
    <Card leftBorderColor={borderColor} style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: borderColor,
            marginTop: 8,
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1 }}>
          <div
            className="cw-display"
            style={{ fontSize: 15, fontWeight: 600, color: "var(--text-1)" }}
          >
            {item.caseName}
          </div>
          <div
            className="cw-mono"
            style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}
          >
            {item.matterNumber}
          </div>
          <p
            style={{
              margin: "10px 0 12px",
              fontSize: 13,
              color: "var(--text-1)",
              lineHeight: 1.65,
            }}
          >
            {item.description}
          </p>
          <button
            onClick={() => onOpenCase(item.caseId)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--accent)",
              fontSize: 13,
              fontWeight: 600,
              padding: 0,
              cursor: "pointer",
            }}
          >
            View Case →
          </button>
        </div>
      </div>
    </Card>
  );
}
