interface Item {
  label: string;
  done: boolean;
}

const ITEMS: Item[] = [
  { label: "Client intake memo", done: true },
  { label: "Statute of limitations calendared", done: true },
  { label: "Medical records collected", done: false },
  { label: "Expert retained", done: true },
  { label: "Demand package drafted", done: false },
  { label: "Deposition outlines prepared", done: true },
  { label: "Witness statements collected", done: false },
];

export default function ChecklistView() {
  return (
    <div>
      {ITEMS.map((i, idx) => (
        <div
          key={idx}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 0",
            borderBottom:
              idx === ITEMS.length - 1 ? "none" : "1px solid var(--border)",
            fontSize: 13,
          }}
        >
          <span
            style={{
              width: 16,
              height: 16,
              borderRadius: 3,
              border: "1px solid var(--border)",
              background: i.done ? "var(--green)" : "var(--white)",
              color: "var(--white)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
            }}
          >
            {i.done ? "✓" : ""}
          </span>
          <span
            style={{
              color: i.done ? "var(--text-2)" : "var(--text-1)",
              textDecoration: i.done ? "line-through" : "none",
            }}
          >
            {i.label}
          </span>
        </div>
      ))}
    </div>
  );
}
