import Card from "../common/Card";
import SectionLabel from "../common/SectionLabel";
import type { DocumentItem } from "../../data/mockData";

interface MissingItemsAlertProps {
  missing: DocumentItem[];
}

export default function MissingItemsAlert({ missing }: MissingItemsAlertProps) {
  if (missing.length === 0) return null;

  return (
    <Card leftBorderColor="var(--red)" style={{ marginBottom: 16 }}>
      <SectionLabel style={{ color: "var(--red)" }}>
        Missing Documents
      </SectionLabel>
      <div>
        {missing.map((m) => (
          <div
            key={m.id}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              padding: "8px 0",
              fontSize: 13,
              color: "var(--text-1)",
              lineHeight: 1.6,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "var(--red)",
                flexShrink: 0,
                marginTop: 6,
              }}
            />
            <div>
              <span style={{ fontWeight: 600 }}>{m.name}</span>
              <span style={{ color: "var(--text-2)" }}>
                {" "}
                — {m.caseName} ({m.actionDetail})
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
