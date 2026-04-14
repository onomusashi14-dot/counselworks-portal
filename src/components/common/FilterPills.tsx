interface Option {
  value: string;
  label: string;
}

interface FilterPillsProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
}

export default function FilterPills({
  options,
  value,
  onChange,
}: FilterPillsProps) {
  return (
    <div
      style={{
        display: "inline-flex",
        background: "var(--white)",
        border: "1px solid var(--border)",
        borderRadius: 6,
        padding: 3,
        gap: 2,
      }}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            style={{
              padding: "6px 12px",
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 600,
              border: "none",
              background: active ? "var(--navy)" : "transparent",
              color: active ? "var(--white)" : "var(--text-2)",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
