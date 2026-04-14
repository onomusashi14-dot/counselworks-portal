import { healthColor } from "../../utils/helpers";
import type { HealthStatus } from "../../data/mockData";

interface ReadinessBarProps {
  value: number;
  status: HealthStatus | string;
  width?: number;
}

export default function ReadinessBar({
  value,
  status,
  width = 80,
}: ReadinessBarProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div
        style={{
          width,
          height: 6,
          background: "var(--border)",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${value}%`,
            height: "100%",
            background: healthColor(status),
          }}
        />
      </div>
      <span className="cw-mono" style={{ fontSize: 11, color: "var(--text-2)" }}>
        {value}%
      </span>
    </div>
  );
}
