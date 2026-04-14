import type { ThreadMessage } from "../../data/mockData";

interface MessageRowProps {
  msg: ThreadMessage;
}

export default function MessageRow({ msg }: MessageRowProps) {
  if (msg.senderType === "system") {
    return (
      <div
        style={{
          border: "1px dashed var(--border)",
          background: "var(--surface-system-message)",
          padding: "12px 16px",
          borderRadius: 6,
          marginBottom: 14,
          fontStyle: "italic",
          fontSize: 13,
          color: "var(--text-2)",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            marginBottom: 4,
            fontStyle: "normal",
          }}
        >
          System{" "}
          <span style={{ color: "var(--text-3)", fontWeight: 400 }}>
            · {msg.timestamp}
          </span>
        </div>
        {msg.body}
      </div>
    );
  }
  return (
    <div
      style={{
        border: "1px solid var(--border)",
        background: "var(--white)",
        padding: "14px 16px",
        borderRadius: 6,
        marginBottom: 14,
      }}
    >
      <div style={{ fontSize: 12, marginBottom: 6 }}>
        <span style={{ fontWeight: 700, color: "var(--text-1)" }}>
          {msg.senderName}
        </span>
        <span style={{ color: "var(--text-2)" }}> · {msg.senderRole}</span>
        <span style={{ color: "var(--text-3)" }}> · {msg.timestamp}</span>
      </div>
      <div
        style={{
          fontSize: 13,
          lineHeight: 1.65,
          color: "var(--text-1)",
        }}
      >
        {msg.body}
      </div>
    </div>
  );
}
