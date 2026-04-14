import { useState } from "react";
import Card from "../common/Card";
import FilterPills from "../common/FilterPills";
import StatusDot from "../common/StatusDot";
import ReadinessBar from "../common/ReadinessBar";
import Spinner from "../common/Spinner";
import ErrorCard from "../common/ErrorCard";
import { thStyle } from "../../utils/helpers";
import { useApi } from "../../hooks/useApi";
import { getCases } from "../../api/portalApi";
import type { NavKey } from "../layout/Sidebar";

interface ActiveFilesProps {
  onOpenCase: (id: string) => void;
  onNavigate: (key: NavKey) => void;
}

export default function ActiveFiles({
  onOpenCase,
  onNavigate,
}: ActiveFilesProps) {
  const { data, loading, error, refetch } = useApi((signal) =>
    getCases(signal),
  );
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [phase, setPhase] = useState("all");

  if (loading && !data) return <Spinner label="Loading active files…" />;
  if (error && !data) return <ErrorCard message={error} onRetry={refetch} />;

  const cases = data?.cases ?? [];

  const filtered = cases
    .filter((c) => {
      if (filter === "attention")
        return (
          c.healthStatus === "needs_attention" ||
          c.healthStatus === "blocked"
        );
      if (filter === "on_track") return c.healthStatus === "on_track";
      if (filter === "blocked") return c.healthStatus === "blocked";
      return true;
    })
    .filter((c) =>
      phase === "all" ? true : c.phase.toLowerCase() === phase
    )
    .filter((c) =>
      search
        ? c.caseName.toLowerCase().includes(search.toLowerCase()) ||
          c.clientName.toLowerCase().includes(search.toLowerCase()) ||
          c.matterNumber.toLowerCase().includes(search.toLowerCase())
        : true
    );

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

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: "-0.02em",
          }}
        >
          Active Files
        </h1>
        <div style={{ marginTop: 6, fontSize: 14, color: "var(--text-2)" }}>
          {cases.length} active cases
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder="Search cases..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: 280,
            padding: "8px 12px",
            border: "1px solid var(--border)",
            borderRadius: 6,
            fontSize: 13,
            background: "var(--white)",
            color: "var(--text-1)",
            outline: "none",
          }}
        />
        <FilterPills
          options={[
            { value: "all", label: "All" },
            { value: "attention", label: "Needs Attention" },
            { value: "on_track", label: "On Track" },
            { value: "blocked", label: "Blocked" },
          ]}
          value={filter}
          onChange={setFilter}
        />
        <select
          value={phase}
          onChange={(e) => setPhase(e.target.value)}
          style={{
            padding: "8px 12px",
            border: "1px solid var(--border)",
            borderRadius: 6,
            fontSize: 13,
            background: "var(--white)",
            color: "var(--text-1)",
          }}
        >
          <option value="all">All Phases</option>
          <option value="intake">Intake</option>
          <option value="active">Active</option>
          <option value="discovery">Discovery</option>
          <option value="negotiation">Negotiation</option>
          <option value="litigation">Litigation</option>
          <option value="settled">Settled</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }} className="cw-scroll">
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 13,
            }}
          >
            <thead>
              <tr style={{ background: "var(--surface-header)" }}>
                <th style={{ ...thStyle, width: 40 }}></th>
                <th style={thStyle}>Case</th>
                <th style={thStyle}>Client</th>
                <th style={{ ...thStyle, width: "10%" }}>Phase</th>
                <th style={{ ...thStyle, width: "14%" }}>Readiness</th>
                <th style={{ ...thStyle, width: "14%" }}>Your Paralegal</th>
                <th style={thStyle}>Next Action</th>
                <th style={{ ...thStyle, width: 90 }}>Updated</th>
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
                    (e.currentTarget.style.background =
                      "var(--surface-hover)")
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
                      style={{ fontSize: 14, fontWeight: 600 }}
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
                  <td
                    style={{ padding: "8px 12px", color: "var(--text-1)" }}
                  >
                    {c.clientName}
                  </td>
                  <td
                    style={{ padding: "8px 12px", color: "var(--text-2)" }}
                  >
                    {c.phase}
                  </td>
                  <td style={{ padding: "8px 12px" }}>
                    <ReadinessBar
                      value={c.readinessScore}
                      status={c.healthStatus}
                    />
                  </td>
                  <td
                    style={{ padding: "8px 12px", color: "var(--text-1)" }}
                  >
                    {c.assignedParalegal}
                  </td>
                  <td style={{ padding: "8px 12px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
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
                  <td
                    style={{
                      padding: "8px 16px 8px 12px",
                      color: "var(--text-2)",
                      fontSize: 12,
                    }}
                  >
                    {c.lastUpdated}
                  </td>
                </tr>
              ))}
              {sorted.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      padding: 24,
                      textAlign: "center",
                      color: "var(--text-2)",
                    }}
                  >
                    No cases match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div style={{ marginTop: 16, textAlign: "center" }}>
        <button
          onClick={() => onNavigate("requests")}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--accent)",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          Need to add a case? Send instructions to your team →
        </button>
      </div>
    </div>
  );
}
