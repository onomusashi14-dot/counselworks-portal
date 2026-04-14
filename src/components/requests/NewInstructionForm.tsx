import { useState } from "react";
import SlideOverPanel from "../common/SlideOverPanel";
import Button from "../common/Button";
import { createThread } from "../../api/portalApi";
import type { Case } from "../../data/mockData";

interface NewInstructionFormProps {
  open: boolean;
  onClose: () => void;
  cases: Case[];
  onCreated?: () => void;
}

export default function NewInstructionForm({
  open,
  onClose,
  cases,
  onCreated,
}: NewInstructionFormProps) {
  const [newCase, setNewCase] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newBody, setNewBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setNewCase("");
    setNewSubject("");
    setNewBody("");
    setError(null);
    setSubmitting(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit() {
    if (submitting) return;
    const body = newBody.trim();
    const subject = newSubject.trim() || body.slice(0, 80);
    if (!body) {
      setError("Please describe what you need.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createThread({
        subject,
        body,
        caseId: newCase || undefined,
      });
      reset();
      if (onCreated) onCreated();
      else onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send instructions.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SlideOverPanel
      open={open}
      onClose={handleClose}
      title="Send Instructions to Your Team"
    >
      <div style={{ marginBottom: 18 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            marginBottom: 6,
            color: "var(--text-1)",
          }}
        >
          Which case?
        </div>
        <select
          value={newCase}
          onChange={(e) => setNewCase(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 12px",
            border: "1px solid var(--border)",
            borderRadius: 6,
            fontSize: 13,
            background: "var(--white)",
            color: "var(--text-1)",
          }}
        >
          <option value="">No case / general</option>
          {cases.map((c) => (
            <option key={c.id} value={c.id}>
              {c.caseName}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 18 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            marginBottom: 6,
            color: "var(--text-1)",
          }}
        >
          Subject
        </div>
        <input
          type="text"
          value={newSubject}
          onChange={(e) => setNewSubject(e.target.value)}
          placeholder="Short subject line (optional — defaults to first line of instructions)"
          style={{
            width: "100%",
            padding: "10px 12px",
            border: "1px solid var(--border)",
            borderRadius: 6,
            fontSize: 13,
            background: "var(--white)",
            color: "var(--text-1)",
            outline: "none",
          }}
        />
      </div>

      <div style={{ marginBottom: 18 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            marginBottom: 6,
            color: "var(--text-1)",
          }}
        >
          What do you need?
        </div>
        <textarea
          value={newBody}
          onChange={(e) => setNewBody(e.target.value)}
          rows={6}
          placeholder="Write your instructions the way you'd tell a paralegal. We'll handle the rest."
          style={{
            width: "100%",
            padding: 12,
            border: "1px solid var(--border)",
            borderRadius: 6,
            fontSize: 13,
            resize: "vertical",
            fontFamily: "inherit",
            outline: "none",
          }}
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            marginBottom: 6,
            color: "var(--text-1)",
          }}
        >
          Attach files (optional)
        </div>
        <div
          style={{
            border: "1px dashed var(--border)",
            borderRadius: 6,
            padding: 24,
            textAlign: "center",
            color: "var(--text-2)",
            fontSize: 13,
            background: "var(--surface-hover)",
          }}
        >
          Drop files here or click to browse. PDF, JPG, PNG, HEIC.
        </div>
      </div>

      {error && (
        <div
          style={{
            fontSize: 12,
            color: "var(--red)",
            marginBottom: 12,
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: 10,
          justifyContent: "flex-end",
        }}
      >
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={submitting || newBody.trim().length === 0}
        >
          {submitting ? "Sending…" : "Send Instructions →"}
        </Button>
      </div>
    </SlideOverPanel>
  );
}
