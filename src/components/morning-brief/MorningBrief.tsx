import Card from "../common/Card";
import SectionLabel from "../common/SectionLabel";
import StatusDot from "../common/StatusDot";
import Spinner from "../common/Spinner";
import ErrorCard from "../common/ErrorCard";
import AttentionCard from "./AttentionCard";
import TeamCard from "./TeamCard";
import PortfolioTable from "./PortfolioTable";
import { useApi } from "../../hooks/useApi";
import { getMorningBrief } from "../../api/portalApi";

interface MorningBriefProps {
  onOpenCase: (id: string) => void;
}

export default function MorningBrief({ onOpenCase }: MorningBriefProps) {
  const { data, loading, error, refetch } = useApi((signal) =>
    getMorningBrief(signal),
  );

  if (loading && !data) return <Spinner label="Loading morning brief…" />;
  if (error && !data)
    return <ErrorCard message={error} onRetry={refetch} />;
  if (!data) return null;

  const attention = [...data.attentionItems].sort((a, b) =>
    a.severity === "red" && b.severity !== "red"
      ? -1
      : b.severity === "red"
      ? 1
      : 0,
  );

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
          {data.greeting}, James
        </h1>
        <div
          style={{ marginTop: 6, fontSize: 14, color: "var(--text-2)" }}
        >
          Here's your operational briefing for {data.date}.
        </div>
      </div>

      {/* Zone 1 */}
      <div style={{ marginBottom: 32 }}>
        <SectionLabel>Needs Your Attention</SectionLabel>
        {attention.length === 0 ? (
          <Card leftBorderColor="var(--green)">
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: 4,
              }}
            >
              <div style={{ marginTop: 2 }}>
                <StatusDot status="on_track" />
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "var(--text-1)",
                    marginBottom: 4,
                  }}
                >
                  All clear — no attorney action required today.
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--text-2)",
                    lineHeight: 1.5,
                  }}
                >
                  {data.portfolio.length} active case
                  {data.portfolio.length === 1 ? "" : "s"} on track. Your pod
                  is handling open requests and record collection without
                  blockers. Check back later if anything escalates.
                </div>
              </div>
            </div>
          </Card>
        ) : (
          attention.map((item) => (
            <AttentionCard
              key={item.id}
              item={item}
              onOpenCase={onOpenCase}
            />
          ))
        )}
      </div>

      {/* Zone 2 */}
      <div style={{ marginBottom: 32 }}>
        <TeamCard team={data.team} weekSummary={data.weekSummary} />
      </div>

      {/* Zone 3 */}
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <SectionLabel style={{ marginBottom: 0 }}>Case Portfolio</SectionLabel>
        </div>
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <PortfolioTable
            cases={data.portfolio}
            onOpenCase={onOpenCase}
            compact
          />
        </Card>
      </div>
    </div>
  );
}
