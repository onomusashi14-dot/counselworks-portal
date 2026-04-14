import React from "react";
import Card from "../common/Card";
import SectionLabel from "../common/SectionLabel";
import type { EscalationApi, EscalationStepApi } from "../../api/portalApi";

/**
 * EscalationTimeline — renders one rung-chart per open MedicalRecordRequest.
 *
 * The server (GET /portal/cases/:caseId) now computes step state dynamically
 * from `createdAt` (the MedicalRecordRequest model has no `requestedDate`
 * column). Each escalation gets a 4-rung timeline:
 *   Day 3  → Phone follow-up
 *   Day 7  → Second letter
 *   Day 14 → Compliance escalation
 *   Day 30 → Attorney alert
 *
 * This component is now pure-presentational — no hard-coded dates or steps.
 */

interface EscalationTimelineProps {
  escalations: EscalationApi[];
}

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function dotColor(state: EscalationStepApi["state"]): string {
  if (state === "done") return "var(--green)";
  if (state === "current") return "var(--amber)";
  return "var(--border)";
}

function connectorColor(state: EscalationStepApi["state"]): string {
  // A connector is "done" only if the step BEFORE it is done.
  return state === "done" ? "var(--green)" : "var(--border)";
}

export default function EscalationTimeline({ escalations }: EscalationTimelineProps) {
  if (!escalations || escalations.length === 0) {
    return (
      <Card>
        <SectionLabel>Escalation Timeline</SectionLabel>
        <div style={{ fontSize: 13, color: "var(--text-2)", marginTop: 8 }}>
          No open record requests — nothing to escalate.
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <SectionLabel>Escalation Timeline</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 8 }}>
        {escalations.map((esc) => (
          <div key={esc.id}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 8,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>
                {esc.provider}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-3)" }}>
                {esc.recordType} · requested {formatShortDate(esc.requestedAt)}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              {esc.steps.map((s, i) => (
                <React.Fragment key={i}>
                  <div style={{ textAlign: "center", flexShrink: 0, minWidth: 72 }}>
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: dotColor(s.state),
                        color: "var(--white)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 700,
                        margin: "0 auto",
                      }}
                    >
                      {s.state === "done" ? "✓" : i + 1}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        marginTop: 6,
                        color: "var(--text-1)",
                      }}
                    >
                      {s.label}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-3)" }}>
                      {formatShortDate(s.dueAt)}
                    </div>
                  </div>
                  {i < esc.steps.length - 1 && (
                    <div
                      style={{
                        flex: 1,
                        height: 2,
                        background: connectorColor(s.state),
                        borderStyle: s.state === "done" ? "solid" : "dashed",
                        marginTop: -22,
                        alignSelf: "center",
                      }}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
