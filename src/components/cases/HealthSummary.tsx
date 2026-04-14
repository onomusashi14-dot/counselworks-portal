import Card from "../common/Card";
import SectionLabel from "../common/SectionLabel";
import type { Case } from "../../data/mockData";

interface HealthSummaryProps {
  caseData: Case;
}

export default function HealthSummary({ caseData }: HealthSummaryProps) {
  const confColor =
    caseData.healthConfidence === "verified"
      ? "var(--green)"
      : "var(--amber)";
  const confLabel =
    caseData.healthConfidence === "verified"
      ? "Verified"
      : "System-Confirmed";
  return (
    <Card style={{ marginBottom: 20, position: "relative" }}>
      <div
        style={{
          position: "absolute",
          top: 16,
          right: 20,
          fontSize: 11,
          fontWeight: 600,
          color: confColor,
          display: "flex",
          alignItems: "center",
          gap: 6,
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
        {confLabel}
      </div>
      <SectionLabel>Health Summary</SectionLabel>
      <p
        className="cw-display"
        style={{
          margin: 0,
          fontSize: 14,
          fontWeight: 400,
          lineHeight: 1.65,
          color: "var(--text-1)",
        }}
      >
        {caseData.healthSummary}
      </p>
    </Card>
  );
}
