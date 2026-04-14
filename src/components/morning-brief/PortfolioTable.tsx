import { useState } from "react";
import FilterPills from "../common/FilterPills";
import StatusDot from "../common/StatusDot";
import ReadinessBar from "../common/ReadinessBar";
import { thStyle } from "../../utils/helpers";
import type { Case } from "../../data/mockData";

interface PortfolioTableProps {
  cases: Case[];
  onOpenCase: (id: string) => void;
  compact?: boolean;
  showClient?: boolean;
  showUpdated?: boolean;
}

export default function PortfolioTable({
  cases,
  onOpenCase,
  compact = false,
  showClient = false,
  showUpdated = false,
}: PortfolioTableProps) {
  const [filter, setFilter] = useState("all");

  const filtered = cases.filter((c) => {
    if (filter === "all") return true;
    if (filter === "attention")
      return (
        c.healthStatus === "needs_attention" || c.healthStatus === "blocked"
      );
    if (filter === "on_track") return c.healthStatus === "on_track";
    if (filter === "blocked") return c.healthStatus === "blocked";
    return true;
  });

  const order: Record<string, number> = {
    blocked: 0,
    needs_attention: 1,
    on_track: 2,
  };
  const sorted = [...filtered].sort((a, b) => {
    if (order[a.healthStatus] !== order[b.healthStatus])
      return order[a.healthStatus] - order[b.healthStatus];
    return a.readinessScore - b.readinessScore;
  });

  const filterOpts = compact
    ? [
        { value: "all", label: "All" },
        { value: "attention", label: "Needs Attention" },
        { value: "on_track", label: "On Track" },
      ]
    : [
        { value: "all", label: "All" },
        { value: "attention", label: "Needs Attention" },
        { value: "on_track", label: "On Track" },
        { value: "blocked", label: "Blocked" },
      ];

  return (
    <div>
      <div
        style={{
          padding: "14px 16px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <FilterPills options={filterOpts} value={filter} onChange={setFilter} />
      </div>

      <div style={{ overflowX: "auto" }} className="cw-scroll">
        <table
          style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
        >
          <thead>
            <tr style={{ background: "var(--surface-header)" }}>
              <th style={{ ...thStyle, width: 40 }}></th>
              <th style={thStyle}>Case</th>
              {showClient && <th style={thStyle}>Client</th>}
              <th style={{ ...thStyle, width: "10%" }}>Phase</th>
              <th style={{ ...thStyle, width: "14%" }}>Readiness</th>
              <th style={{ ...thStyle, width: "14%" }}>Your Paralegal</th>
              <th style={thStyle}>Next Action</th>
              <th style={{ ...thStyle, width: 90 }}>
                {showUpdated ? "Updated" : "ETA"}
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((c) => (
              <tr
                key={c.id}
                onClick={() => onOpenCase(c.id)}
                style={{
                  borderBottom: "1px solid var(--border)",
                  cursor: "pointer",
                  height: 48,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--surface-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <td style={{ padding: "0 12px 0 16px" }}>
                  <StatusDot status={c.healthStatus} />
                </td>
                <td style={{ padding: "8px 12px" }}>
                  <div
                    className="cw-display"
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "var(--text-1)",
                    }}
                  >
                    {c.caseName}
                  </div>
                  <div
                    className="cw-mono"
                    style={{
                      fontSize: 11,
                      color: "var(--text-3)",
                      marginTop: 2,
                    }}
                  >
                    {c.matterNumber}
                  </div>
                </td>
                {showClient && (
                  <td style={{ padding: "8px 12px", color: "var(--text-1)" }}>
                    {c.clientName}
                  </td>
                )}
                <td style={{ padding: "8px 12px", color: "var(--text-2)" }}>
                  {c.phase}
                </td>
                <td style={{ padding: "8px 12px" }}>
                  <ReadinessBar
                    value={c.readinessScore}
                    status={c.healthStatus}
                  />
                </td>
                <td style={{ padding: "8px 12px", color: "var(--text-1)" }}>
                  {c.assignedParalegal}
                </td>
                <td style={{ padding: "8px 12px", color: "var(--text-1)" }}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    {c.healthStatus === "blocked" && (
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "var(--red)",
                        }}
                      />
                    )}
                    <span>{c.nextAction}</span>
                  </div>
                </td>
                <td style={{ padding: "8px 16px 8px 12px" }}>
                  {showUpdated ? (
                    <span style={{ color: "var(--text-2)", fontSize: 12 }}>
                      {c.lastUpdated}
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: 12,
                        color:
                          c.healthStatus === "blocked"
                            ? "var(--red)"
                            : "var(--text-2)",
                      }}
                    >
                      {c.nextActionEta || "—"}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
