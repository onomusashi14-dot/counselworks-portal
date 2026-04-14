import DraftCard from "./DraftCard";
import Spinner from "../common/Spinner";
import ErrorCard from "../common/ErrorCard";
import { useApi } from "../../hooks/useApi";
import { getDrafts } from "../../api/portalApi";

export default function DraftsInbox() {
  const { data, loading, error, refetch } = useApi((signal) =>
    getDrafts(signal),
  );

  if (loading && !data) return <Spinner label="Loading drafts…" />;
  if (error && !data) return <ErrorCard message={error} onRetry={refetch} />;

  const drafts = data?.drafts ?? [];

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
          Drafts Inbox
        </h1>
        <div style={{ marginTop: 6, fontSize: 14, color: "var(--text-2)" }}>
          {drafts.length} drafts ready for review
        </div>
      </div>
      {drafts.length === 0 ? (
        <div
          style={{
            fontSize: 13,
            color: "var(--text-2)",
            padding: 24,
            textAlign: "center",
          }}
        >
          No drafts yet.
        </div>
      ) : (
        drafts.map((d) => <DraftCard key={d.id} draft={d} />)
      )}
    </div>
  );
}
