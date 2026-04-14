import { useState } from "react";
import Card from "../common/Card";
import FilterPills from "../common/FilterPills";
import Spinner from "../common/Spinner";
import ErrorCard from "../common/ErrorCard";
import DocTable from "./DocTable";
import MissingItemsAlert from "./MissingItemsAlert";
import { useApi } from "../../hooks/useApi";
import { getDocuments } from "../../api/portalApi";

export default function Documents() {
  const { data, loading, error, refetch } = useApi((signal) =>
    getDocuments(signal),
  );
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");

  if (loading && !data) return <Spinner label="Loading documents…" />;
  if (error && !data) return <ErrorCard message={error} onRetry={refetch} />;

  const documents = data?.documents ?? [];

  const filtered = documents
    .filter((d) => (category === "all" ? true : d.category === category))
    .filter((d) => {
      if (status === "all") return true;
      if (status === "received") return d.actionState === "received";
      if (status === "pending") return d.actionState === "pending_review";
      if (status === "missing") return d.actionState.startsWith("missing");
      if (status === "used") return d.actionState === "used_in_draft";
      return true;
    })
    .filter((d) =>
      search
        ? d.name.toLowerCase().includes(search.toLowerCase()) ||
          d.caseName.toLowerCase().includes(search.toLowerCase())
        : true
    );

  const missing = documents.filter((d) => d.actionState.startsWith("missing"));

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
          Documents
        </h1>
        <div style={{ marginTop: 6, fontSize: 14, color: "var(--text-2)" }}>
          {documents.length} documents ·{" "}
          <span
            style={{
              color: missing.length > 0 ? "var(--red)" : "var(--text-2)",
            }}
          >
            {missing.length} missing items
          </span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 16,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder="Search documents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: 260,
            padding: "8px 12px",
            border: "1px solid var(--border)",
            borderRadius: 6,
            fontSize: 13,
            background: "var(--white)",
            outline: "none",
          }}
        />
        <FilterPills
          options={[
            { value: "all", label: "All" },
            { value: "pleading", label: "Pleading" },
            { value: "medical", label: "Medical" },
            { value: "billing", label: "Billing" },
            { value: "evidence", label: "Evidence" },
            { value: "correspondence", label: "Correspondence" },
            { value: "court_order", label: "Court Order" },
          ]}
          value={category}
          onChange={setCategory}
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{
            padding: "8px 12px",
            border: "1px solid var(--border)",
            borderRadius: 6,
            fontSize: 13,
            background: "var(--white)",
          }}
        >
          <option value="all">All Statuses</option>
          <option value="received">Received</option>
          <option value="pending">Pending Review</option>
          <option value="missing">Missing</option>
          <option value="used">Used in Draft</option>
        </select>
      </div>

      <MissingItemsAlert missing={missing} />

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <DocTable docs={filtered} />
      </Card>
    </div>
  );
}
