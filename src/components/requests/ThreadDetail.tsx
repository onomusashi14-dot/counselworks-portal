import { useState } from "react";
import Card from "../common/Card";
import Button from "../common/Button";
import SectionLabel from "../common/SectionLabel";
import Spinner from "../common/Spinner";
import ErrorCard from "../common/ErrorCard";
import MessageRow from "./MessageRow";
import { useApi } from "../../hooks/useApi";
import { getThread, replyToThread } from "../../api/portalApi";

interface ThreadDetailProps {
  threadId: string;
  onBack: () => void;
  onReplySent?: () => void;
}

export default function ThreadDetail({
  threadId,
  onBack,
  onReplySent,
}: ThreadDetailProps) {
  const { data, loading, error, refetch } = useApi(
    (signal) => getThread(threadId, signal),
    [threadId],
  );
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  if (loading && !data) return <Spinner label="Loading thread…" />;
  if (error && !data) return <ErrorCard message={error} onRetry={refetch} />;
  if (!data) return null;

  const thread = data.thread;

  async function handleSend() {
    const body = reply.trim();
    if (!body || sending) return;
    setSending(true);
    setSendError(null);
    try {
      await replyToThread(threadId, body);
      setReply("");
      refetch();
      if (onReplySent) onReplySent();
    } catch (err) {
      setSendError(
        err instanceof Error ? err.message : "Failed to send reply.",
      );
    } finally {
      setSending(false);
    }
  }

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
          marginBottom: 14,
          cursor: "pointer",
        }}
      >
        ← Back to Request Center
      </button>
      <h1 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
        {thread.subject}
      </h1>
      <div
        style={{
          fontSize: 13,
          color: "var(--text-2)",
          marginTop: 4,
          marginBottom: 24,
        }}
      >
        {thread.caseName} · {thread.statusSentence}
        {thread.openedAt && (
          <>
            {" · "}
            <span style={{ color: "var(--text-3)" }}>
              Opened {thread.openedAt}
            </span>
          </>
        )}
      </div>

      <div>
        {thread.messages.map((m) => (
          <MessageRow key={m.id} msg={m} />
        ))}
      </div>

      <Card style={{ marginTop: 20 }}>
        <SectionLabel>Reply to your team</SectionLabel>
        <textarea
          placeholder="Reply to your team..."
          rows={4}
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          disabled={sending}
          style={{
            width: "100%",
            padding: 12,
            border: "1px solid var(--border)",
            borderRadius: 6,
            fontSize: 13,
            resize: "vertical",
            outline: "none",
            fontFamily: "inherit",
          }}
        />
        {sendError && (
          <div
            style={{
              fontSize: 12,
              color: "var(--red)",
              marginTop: 8,
            }}
          >
            {sendError}
          </div>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: 12,
          }}
        >
          <Button
            variant="primary"
            onClick={handleSend}
            disabled={sending || reply.trim().length === 0}
          >
            {sending ? "Sending…" : "Send →"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
