import Card from "../common/Card";
import Button from "../common/Button";
import type { Draft } from "../../data/mockData";

interface DraftCardProps {
  draft: Draft;
}

export default function DraftCard({ draft }: DraftCardProps) {
  const confColor =
    draft.confidence === "verified" ? "var(--green)" : "var(--amber)";
  const confLabel =
    draft.confidence === "verified" ? "Verified" : "System-Confirmed";

  return (
    <Card style={{ marginBottom: 12 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            className="cw-display"
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "var(--text-1)",
            }}
          >
            {draft.draftType} — {draft.caseName}
          </div>
          <div
            style={{
              fontSize: 13,
              color: "var(--text-2)",
              marginTop: 6,
            }}
          >
            Prepared by{" "}
            <span style={{ fontWeight: 600, color: "var(--text-1)" }}>
              {draft.preparedBy}
            </span>{" "}
            · QA reviewed by{" "}
            <span style={{ fontWeight: 600, color: "var(--text-1)" }}>
              {draft.reviewedBy}
            </span>{" "}
            · QA Score:{" "}
            <span
              className="cw-mono"
              style={{ fontWeight: 700, color: "var(--text-1)" }}
            >
              {draft.qaScore}/100
            </span>
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--text-3)",
              marginTop: 4,
            }}
          >
            Delivered {draft.deliveredDate}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            fontWeight: 600,
            color: confColor,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: confColor,
            }}
          />
          Confidence: {confLabel}
        </div>
      </div>

      <div
        style={{
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
          margin: "14px 0",
          padding: "10px 0",
          fontSize: 10,
          fontStyle: "italic",
          color: "var(--text-3)",
          textAlign: "center",
          letterSpacing: "0.04em",
        }}
      >
        DRAFT — PREPARED FOR ATTORNEY REVIEW ONLY. NOT LEGAL ADVICE.
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <Button variant="secondary">View Draft</Button>
        <Button variant="secondary">Download Word</Button>
        <Button variant="secondary">View Revision History</Button>
      </div>
    </Card>
  );
}
