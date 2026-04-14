import { useMemo, useState } from "react";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import LoginPage from "./components/auth/LoginPage";
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

function Portal() {
  const { user, logout } = useAuth();
  const [page, setPage] = useState<NavKey>("morning");
  const [openCaseId, setOpenCaseId] = useState<string | null>(null);

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
      userName={user?.fullName ?? undefined}
      userRole={undefined}
      onLogout={logout}
    >
      {content}
    </PageShell>
  );
}

function AppContent() {
  const { user, loading, login } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--canvas)",
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            border: "3px solid var(--border)",
            borderTopColor: "var(--mustard)",
            borderRadius: "50%",
            animation: "cw-spin 0.6s linear infinite",
          }}
        />
        <style>{`@keyframes cw-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={login} />;
  }

  return <Portal />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
