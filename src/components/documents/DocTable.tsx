import StatusDot from "../common/StatusDot";
import Badge from "../common/Badge";
import { actionStateColor, thStyle } from "../../utils/helpers";
import type { DocumentItem } from "../../data/mockData";

interface DocTableProps {
  docs: DocumentItem[];
}

const categoryBadgeColor = (
  category: string
): "red" | "blue" | "mustard" | "green" | "gray" => {
  if (category === "medical") return "red";
  if (category === "pleading") return "blue";
  if (category === "billing") return "mustard";
  if (category === "evidence") return "green";
  return "gray";
};

export default function DocTable({ docs }: DocTableProps) {
  return (
    <div style={{ overflowX: "auto" }} className="cw-scroll">
      <table
        style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
      >
        <thead>
          <tr style={{ background: "var(--surface-header)" }}>
            <th style={{ ...thStyle, width: 40 }}></th>
            <th style={thStyle}>Document</th>
            <th style={{ ...thStyle, width: 130 }}>Category</th>
            <th style={thStyle}>Case</th>
            <th style={{ ...thStyle, width: 220 }}>Action State</th>
            <th style={{ ...thStyle, width: 140 }}>Uploaded By</th>
            <th style={{ ...thStyle, width: 120 }}>Date</th>
            <th style={{ ...thStyle, width: 40 }}></th>
          </tr>
        </thead>
        <tbody>
          {docs.map((d) => (
            <tr
              key={d.id}
              style={{
                borderBottom: "1px solid var(--border)",
                height: 48,
              }}
            >
              <td style={{ padding: "0 12px 0 16px" }}>
                <StatusDot status={d.healthStatus} />
              </td>
              <td
                style={{
                  padding: "8px 12px",
                  fontSize: 14,
                  fontWeight: 500,
                  color: "var(--text-1)",
                }}
              >
                {d.name}
              </td>
              <td style={{ padding: "8px 12px" }}>
                <Badge color={categoryBadgeColor(d.category)}>
                  {d.category.replace("_", " ")}
                </Badge>
              </td>
              <td style={{ padding: "8px 12px", color: "var(--text-2)" }}>
                {d.caseName}
              </td>
              <td
                style={{
                  padding: "8px 12px",
                  color: actionStateColor(d.actionState),
                  fontSize: 13,
                  fontWeight: d.actionState.startsWith("missing") ? 600 : 500,
                }}
              >
                {d.actionDetail}
              </td>
              <td style={{ padding: "8px 12px", color: "var(--text-1)" }}>
                {d.uploadedBy}
              </td>
              <td style={{ padding: "8px 12px", color: "var(--text-2)" }}>
                {d.date}
              </td>
              <td
                style={{
                  padding: "8px 16px 8px 12px",
                  textAlign: "center",
                }}
              >
                {d.actionState !== "missing_followup" &&
                  d.actionState !== "missing_escalated" &&
                  d.actionState !== "missing_not_requested" && (
                    <button
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--text-2)",
                        cursor: "pointer",
                      }}
                      title="Download"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                      </svg>
                    </button>
                  )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
