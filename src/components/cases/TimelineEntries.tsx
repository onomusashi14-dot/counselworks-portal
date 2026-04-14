interface Entry {
  date: string;
  type: "human" | "system";
  actor?: string;
  desc: string;
}

const ENTRIES: Entry[] = [
  {
    date: "April 9, 2026 · 4:30 PM",
    type: "human",
    actor: "Maria Santos",
    desc: "Added HR investigation notes to case file. Prepared deposition outline draft for attorney review.",
  },
  {
    date: "April 8, 2026 · 3:45 PM",
    type: "system",
    desc: "Escalation logged — Metro Transit records office manager notified. Next touchpoint Apr 11.",
  },
  {
    date: "April 7, 2026 · 1:40 PM",
    type: "human",
    actor: "Ana Cruz",
    desc: "QA reviewed deposition outline. Score: 96. Delivered to Drafts Inbox.",
  },
  {
    date: "April 6, 2026 · 9:22 AM",
    type: "human",
    actor: "James Mitchell",
    desc: "Requested deposition outline for HR director.",
  },
  {
    date: "April 5, 2026 · 10:02 AM",
    type: "system",
    desc: "Employment records received from Pacific Holdings. Filed under Evidence.",
  },
];

export default function TimelineEntries() {
  return (
    <div>
      {ENTRIES.map((e, i) => (
        <div
          key={i}
          style={{
            padding: "12px 14px",
            marginBottom: 10,
            borderLeft: `2px ${
              e.type === "system" ? "dashed" : "solid"
            } var(--border)`,
            background:
              e.type === "system"
                ? "var(--surface-system-message)"
                : "var(--white)",
            fontStyle: e.type === "system" ? "italic" : "normal",
            color: e.type === "system" ? "var(--text-2)" : "var(--text-1)",
            fontSize: 13,
            lineHeight: 1.6,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "var(--text-3)",
              marginBottom: 4,
            }}
          >
            {e.date} {e.actor ? `· ${e.actor}` : "· System"}
          </div>
          {e.desc}
        </div>
      ))}
    </div>
  );
}
