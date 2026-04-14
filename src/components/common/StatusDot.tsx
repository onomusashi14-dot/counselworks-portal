import { healthColor } from "../../utils/helpers";
import type { HealthStatus } from "../../data/mockData";

interface StatusDotProps {
  status: HealthStatus | string;
  size?: number;
}

export default function StatusDot({ status, size = 8 }: StatusDotProps) {
  return (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        borderRadius: "50%",
        background: healthColor(status),
        flexShrink: 0,
      }}
    />
  );
}
