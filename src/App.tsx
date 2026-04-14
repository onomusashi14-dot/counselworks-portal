import { useMemo, useState } from "react";
import PageShell from "./components/layout/PageShell";
import { type NavKey } from "./components/layout/Sidebar";
import MorningBrief from "./components/morning-brief/MorningBrief";
import ActiveFiles from "./components/cases/ActiveFiles";
import CaseDetail from "./components/cases/CaseDetail";
import RequestCenter from "./components/requests/RequestCenter";
import DraftsInbox from "./components/drafts/DraftsInbox";
import Documents from "./components/documents/Documents";
import { useApi } from "./hooks/useApi";
import { getMorningBrief } from "./api/portalApi";
import type { HealthStatus } from "./data/mockData";

export default function App() {
  const [page, setPage] = useState<NavKey>("morning");
  const [openCaseId, setOpenCaseId] = useState<string | null>(null);

  // One shared fetch drives the sidebar counts. Individual pages fetch
  // their own data so switching tabs doesn't wait on this query.
  const { data: brief } = useApi((signal) => getMorningBrief(signal));

  const counts = useMemo(() => {
    const base: Record<HealthStatus, number> = {
      on_track: 0,
      needs_attention: 0,
      blocked: 0,
    };
    (brief?.portfolio ?? []).forEach((c) => {
      base[c.healthStatus] = (base[c.healthStatus] || 0) + 1;
    });
    return base;
  }, [brief]);

  const onNavigate = (key: NavKey) => {
    setPage(key);
    setOpenCaseId(null);
  };

  const onOpenCase = (id: string) => {
    setOpenCaseId(id);
    setPage("active");
  };

  let content;
  if (openCaseId) {
    content = (
      <CaseDetail
        caseId={openCaseId}
        onBack={() => setOpenCaseId(null)}
      />
    );
  } else if (page === "morning") {
    content = <MorningBrief onOpenCase={onOpenCase} />;
  } else if (page === "active") {
    content = (
      <ActiveFiles onOpenCase={onOpenCase} onNavigate={onNavigate} />
    );
  } else if (page === "requests") {
    content = <RequestCenter />;
  } else if (page === "drafts") {
    content = <DraftsInbox />;
  } else if (page === "documents") {
    content = <Documents />;
  }

  return (
    <PageShell
      current={page}
      onNavigate={onNavigate}
      counts={counts}
      countsLoaded={!!brief}
    >
      {content}
    </PageShell>
  );
}
