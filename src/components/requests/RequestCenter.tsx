import { useState } from "react";
import Card from "../common/Card";
import Button from "../common/Button";
import SectionLabel from "../common/SectionLabel";
import StatusDot from "../common/StatusDot";
import Spinner from "../common/Spinner";
import ErrorCard from "../common/ErrorCard";
import ThreadDetail from "./ThreadDetail";
import NewInstructionForm from "./NewInstructionForm";
import { healthColor } from "../../utils/helpers";
import { useApi } from "../../hooks/useApi";
import { getThreads, getCases } from "../../api/portalApi";

export default function RequestCenter() {
  const threadsQuery = useApi((signal) => getThreads(signal));
  const casesQuery = useApi((signal) => getCases(signal));
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  if (threadsQuery.loading && !threadsQuery.data)
    return <Spinner label="Loading requests…" />;
  if (threadsQuery.error && !threadsQuery.data)
    return (
      <ErrorCard
        message={threadsQuery.error}
        onRetry={threadsQuery.refetch}
      />
    );

  const threads = threadsQuery.data?.threads ?? [];
  const cases = casesQuery.data?.cases ?? [];

  const active = threads.filter((t) => t.status !== "completed");
  const completed = threads.filter((t) => t.status === "completed");
  const awaitingReview = threads.filter(
    (t) => t.status === "ready_for_review"
  ).length;

  if (selectedThreadId) {
    return (
      <ThreadDetail
        threadId={selectedThreadId}
        onBack={() => setSelectedThreadId(null)}
        onReplySent={() => threadsQuery.refetch()}
      />
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 28,
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 800,
              letterSpacing: "-0.02em",
            }}
          >
            Request Center
          </h1>
          <div
            style={{ marginTop: 6, fontSize: 14, color: "var(--text-2)" }}
          >
            {active.length} active · {awaitingReview} awaiting your response
          </div>
        </div>
        <Button variant="primary" onClick={() => setShowNewForm(true)}>
          + Send Instructions
        </Button>
      </div>

      <SectionLabel>Active Threads</SectionLabel>
      {active.map((t) => (
        <Card
          key={t.id}
          style={{ marginBottom: 10, cursor: "pointer" }}
          leftBorderColor={healthColor(t.healthStatus)}
        >
          <div
            onClick={() => setSelectedThreadId(t.id)}
            style={{ display: "flex", gap: 12 }}
          >
            <StatusDot status={t.healthStatus} />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--text-1)",
                }}
              >
                {t.subject}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--text-2)",
                  marginTop: 2,
                }}
              >
                {t.caseName}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--text-2)",
                  marginTop: 6,
                }}
              >
                <span
                  style={{ fontWeight: 600, color: "var(--text-1)" }}
                >
                  Handler:
                </span>{" "}
                {t.handler} · {t.statusSentence}
                {t.eta && ` · ETA: ${t.eta}`}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--text-3)",
                  marginTop: 4,
                }}
              >
                Last update: {t.lastUpdate}
              </div>
            </div>
          </div>
        </Card>
      ))}

      {completed.length > 0 && (
        <>
          <SectionLabel style={{ marginTop: 32 }}>Completed</SectionLabel>
          {completed.map((t) => (
            <Card
              key={t.id}
              style={{ marginBottom: 10, opacity: 0.65, cursor: "pointer" }}
            >
              <div
                onClick={() => setSelectedThreadId(t.id)}
                style={{ display: "flex", gap: 12 }}
              >
                <span
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: "var(--green)",
                    color: "var(--white)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  ✓
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>
                    {t.subject}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--text-2)",
                      marginTop: 2,
                    }}
                  >
                    {t.caseName}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--text-2)",
                      marginTop: 6,
                    }}
                  >
                    Handler: {t.handler} · {t.statusSentence}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </>
      )}

      <NewInstructionForm
        open={showNewForm}
        onClose={() => setShowNewForm(false)}
        cases={cases}
        onCreated={() => {
          setShowNewForm(false);
          threadsQuery.refetch();
        }}
      />
    </div>
  );
}
