import { useState } from "react";
import Card from "../common/Card";
import Badge from "../common/Badge";
import SectionLabel from "../common/SectionLabel";
import Spinner from "../common/Spinner";
import ErrorCard from "../common/ErrorCard";
import HealthSummary from "./HealthSummary";
import EscalationTimeline from "./EscalationTimeline";
import TimelineEntries from "./TimelineEntries";
import ChecklistView from "./ChecklistView";
import DraftCard from "../drafts/DraftCard";
import DocTable from "../documents/DocTable";
import { healthBadgeColor, healthColor, healthLabel } from "../../utils/helpers";
import { useApi } from "../../hooks/useApi";
import { getCase } from "../../api/portalApi";

interface CaseDetailProps {
  caseId: string;
  onBack: () => void;
}

type Tab =
  | "overview"
  | "drafts"
  | "documents"
  | "timeline"
  | "checklist"
  | "threads"
  | "notes";

const TABS: Tab[] = [
  "overview",
  "drafts",
  "documents",
  "timeline",
  "checklist",
  "threads",
  "notes",
];

export default function CaseDetail({ caseId, onBack }: CaseDetailProps) {
  const [tab, setTab] = useState<Tab>("overview");
  // Notes are local-only (no backend endpoint yet) — this gives the attorney a
  // scratchpad that persists within the session while the real endpoint ships.
  const [notes, setNotes] = useState<string>("");
  const { data, loading, error, refetch } = useApi(
    (signal) => getCase(caseId, signal),
    [caseId],
  );

  if (loading && !data) return <Spinner label="Loading case…" />;
  if (error && !data) return <ErrorCard message={error} onRetry={refetch} />;
  if (!data) return null;

  const caseData = data.case;
  const caseDrafts = data.drafts;
  const caseDocs = data.documents;
  const caseThreads = data.threads;
  const escalations = data.escalations ?? [];
  // Show the timeline whenever there are open MRR escalations, regardless of
  // overall case health. Previously this was gated on healthStatus which hid
  // real escalation state on otherwise-green cases.
  const showEscalation = escalations.length > 0;

  return (
    <div>
      <button
        onClick={onBack}
        style={{
          background: "transparent",
          border: "none",
          color: "var(--accent)",
          fontSize: 13,
          fontWeight: 600,
          padding: 0,
          marginBottom: 16,
          cursor: "pointer",
        }}
      >
        ← Back to Active Files
      </button>

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 6,
        }}
      >
        <h1
          className="cw-display"
          style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: "-0.01em",
            color: "var(--text-1)",
          }}
        >
          {caseData.caseName}
        </h1>
        <Badge color={healthBadgeColor(caseData.healthStatus)} withDot>
          {healthLabel(caseData.healthStatus)}
        </Badge>
      </div>
      <div
        className="cw-mono"
        style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 6 }}
      >
        {caseData.matterNumber}
      </div>
      <div style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 4 }}>
        <span
          className="cw-display"
          style={{ color: "var(--text-1)", fontWeight: 600 }}
        >
          {caseData.clientName}
        </span>
        {" · "}
        {caseData.caseType}
        {" · "}
        {caseData.jurisdiction}
      </div>
      <div
        style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 20 }}
      >
        Assigned to:{" "}
        <span style={{ fontWeight: 600, color: "var(--text-1)" }}>
          {caseData.assignedParalegal}
        </span>{" "}
        (Lead) ·{" "}
        <span style={{ fontWeight: 600, color: "var(--text-1)" }}>
          {caseData.assignedRecordsSpecialist}
        </span>{" "}
        (Records)
      </div>

      {/* Readiness bar */}
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            width: "100%",
            height: 8,
            background: "var(--border)",
            borderRadius: 4,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              width: `${caseData.readinessScore}%`,
              height: "100%",
              background: healthColor(caseData.healthStatus),
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 8,
          }}
        >
          <div style={{ fontSize: 12, color: "var(--text-2)" }}>
            {caseData.readinessBasis}
          </div>
          <div
            className="cw-mono"
            style={{
              fontSize: 12,
              color: "var(--text-1)",
              fontWeight: 600,
            }}
          >
            {caseData.readinessScore}%
          </div>
        </div>
      </div>

      <HealthSummary caseData={caseData} />

      {/* Tabs */}
      <div
        style={{
          borderBottom: "1px solid var(--border)",
          display: "flex",
          gap: 24,
          marginBottom: 20,
        }}
      >
        {TABS.map((t) => {
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                background: "transparent",
                border: "none",
                padding: "10px 0",
                fontSize: 13,
                fontWeight: active ? 700 : 500,
                color: active ? "var(--text-1)" : "var(--text-2)",
                borderBottom: active
                  ? "2px solid var(--mustard)"
                  : "2px solid transparent",
                textTransform: "capitalize",
                cursor: "pointer",
              }}
            >
              {t}
            </button>
          );
        })}
      </div>

      {tab === "overview" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
          }}
        >
          <Card>
            <SectionLabel>Key Dates</SectionLabel>
            <div style={{ fontSize: 13, lineHeight: 1.8 }}>
              <div
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <span style={{ color: "var(--text-2)" }}>
                  Statute of limitations
                </span>
                <span style={{ fontWeight: 600 }}>Jun 14, 2027</span>
              </div>
              <div
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <span style={{ color: "var(--text-2)" }}>Next court date</span>
                <span style={{ fontWeight: 600 }}>May 22, 2026</span>
              </div>
              <div
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <span style={{ color: "var(--text-2)" }}>Discovery cutoff</span>
                <span style={{ fontWeight: 600 }}>Aug 3, 2026</span>
              </div>
              <div
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <span style={{ color: "var(--text-2)" }}>
                  Next CounselWorks action
                </span>
                <span style={{ fontWeight: 600 }}>
                  {caseData.nextActionEta || "—"}
                </span>
              </div>
            </div>
          </Card>
          <Card>
            <SectionLabel>Checklist Summary</SectionLabel>
            <div style={{ fontSize: 13, lineHeight: 1.8 }}>
              <div
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <span style={{ color: "var(--text-2)" }}>Intake complete</span>
                <span
                  style={{ color: "var(--green)", fontWeight: 600 }}
                >
                  ✓ Done
                </span>
              </div>
              <div
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <span style={{ color: "var(--text-2)" }}>
                  Records collection
                </span>
                <span
                  style={{ color: "var(--amber)", fontWeight: 600 }}
                >
                  In progress
                </span>
              </div>
              <div
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <span style={{ color: "var(--text-2)" }}>Expert retention</span>
                <span
                  style={{ color: "var(--green)", fontWeight: 600 }}
                >
                  ✓ Done
                </span>
              </div>
              <div
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <span style={{ color: "var(--text-2)" }}>Demand package</span>
                <span
                  style={{ color: "var(--text-3)", fontWeight: 600 }}
                >
                  Not started
                </span>
              </div>
            </div>
          </Card>
          <Card style={{ gridColumn: "1 / -1" }}>
            <SectionLabel>Team Assignment</SectionLabel>
            <div style={{ fontSize: 13, lineHeight: 1.8 }}>
              <div>
                <span style={{ fontWeight: 600 }}>
                  {caseData.assignedParalegal}
                </span>
                <span style={{ color: "var(--text-2)" }}>
                  {" "}
                  — Lead Case Coordinator
                </span>
              </div>
              <div>
                <span style={{ fontWeight: 600 }}>
                  {caseData.assignedRecordsSpecialist}
                </span>
                <span style={{ color: "var(--text-2)" }}>
                  {" "}
                  — Records Specialist
                </span>
              </div>
              <div>
                <span style={{ fontWeight: 600 }}>Ana Cruz</span>
                <span style={{ color: "var(--text-2)" }}>
                  {" "}
                  — QA Supervisor
                </span>
              </div>
            </div>
          </Card>
          {showEscalation && (
            <div style={{ gridColumn: "1 / -1" }}>
              <EscalationTimeline escalations={escalations} />
            </div>
          )}
        </div>
      )}

      {tab === "drafts" && (
        <div>
          {caseDrafts.length === 0 ? (
            <Card>
              <div style={{ fontSize: 13, color: "var(--text-2)" }}>
                No drafts delivered yet for this case.
              </div>
            </Card>
          ) : (
            caseDrafts.map((d) => <DraftCard key={d.id} draft={d} />)
          )}
        </div>
      )}

      {tab === "documents" && (
        <div>
          <Card
            style={{ padding: 0, overflow: "hidden", marginBottom: 16 }}
          >
            <DocTable docs={caseDocs} />
          </Card>
          {showEscalation && <EscalationTimeline escalations={escalations} />}
        </div>
      )}

      {tab === "timeline" && (
        <Card>
          <SectionLabel>Activity Log</SectionLabel>
          <TimelineEntries />
        </Card>
      )}

      {tab === "checklist" && (
        <Card>
          <SectionLabel>Case Checklist</SectionLabel>
          <ChecklistView />
        </Card>
      )}

      {tab === "threads" && (
        <div>
          {caseThreads.length === 0 ? (
            <Card>
              <div style={{ fontSize: 13, color: "var(--text-2)" }}>
                No request threads for this case yet.
              </div>
            </Card>
          ) : (
            caseThreads.map((t) => (
              <Card key={t.id} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>
                  {t.subject}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text-2)",
                    marginTop: 4,
                  }}
                >
                  {t.handler} · {t.statusSentence} · Last update:{" "}
                  {t.lastUpdate}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {tab === "notes" && (
        <Card>
          <SectionLabel>Attorney Notes</SectionLabel>
          <div
            style={{
              fontSize: 12,
              color: "var(--text-3)",
              marginTop: 4,
              marginBottom: 10,
            }}
          >
            Private scratchpad for this attorney. Not shared with CounselWorks
            staff.
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this case…"
            rows={10}
            style={{
              width: "100%",
              minHeight: 200,
              padding: 12,
              fontSize: 13,
              lineHeight: 1.5,
              fontFamily: "inherit",
              color: "var(--text-1)",
              background: "var(--white)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              resize: "vertical",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          <div
            style={{
              fontSize: 11,
              color: "var(--text-3)",
              marginTop: 8,
              textAlign: "right",
            }}
          >
            {notes.length} characters
          </div>
        </Card>
      )}
    </div>
  );
}
