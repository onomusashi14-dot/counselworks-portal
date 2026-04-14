import Card from "../common/Card";
import SectionLabel from "../common/SectionLabel";
import type { TeamMemberApi, WeekSummary } from "../../api/portalApi";

interface TeamCardProps {
  team: TeamMemberApi[];
  weekSummary: WeekSummary;
}

function TeamMemberRow({ member }: { member: TeamMemberApi }) {
  return (
    <div
      style={{
        padding: "14px 0",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 4,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: member.isActive ? "var(--green)" : "var(--text-3)",
          }}
        />
        <span
          style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)" }}
        >
          {member.name}
        </span>
        <span style={{ color: "var(--text-3)", fontSize: 13 }}>·</span>
        <span style={{ fontSize: 13, color: "var(--text-2)" }}>
          {member.role}
        </span>
      </div>
      <div
        style={{
          fontSize: 13,
          color: "var(--text-2)",
          paddingLeft: 14,
        }}
      >
        {member.activitySummary}
        <span style={{ color: "var(--text-3)" }}>
          {" "}
          · Last active: {member.lastActive}
        </span>
      </div>
    </div>
  );
}

export default function TeamCard({ team, weekSummary }: TeamCardProps) {
  const {
    leadsProcessed,
    casesAdvanced,
    documentsCollected,
    draftsDelivered,
  } = weekSummary;

  return (
    <Card style={{ padding: "20px 24px" }}>
      <SectionLabel>Your CounselWorks Team</SectionLabel>
      <div>
        {team.length === 0 ? (
          <div
            style={{
              fontSize: 13,
              color: "var(--text-2)",
              padding: "14px 0",
            }}
          >
            No active team members assigned yet.
          </div>
        ) : (
          team.map((m) => <TeamMemberRow key={m.name} member={m} />)
        )}
      </div>
      <div
        style={{
          marginTop: 14,
          fontSize: 13,
          fontStyle: "italic",
          color: "var(--text-2)",
        }}
      >
        This week: {leadsProcessed} leads processed, {casesAdvanced} cases
        advanced, {documentsCollected} documents collected, {draftsDelivered}{" "}
        drafts delivered.
      </div>
    </Card>
  );
}
