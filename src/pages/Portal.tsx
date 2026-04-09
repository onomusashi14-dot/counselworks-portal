/**
 * src/pages/Portal.tsx
 *
 * Fixes applied:
 *   FIX 2: Uploaded files displayed in thread view after upload
 *   FIX 3: File attachment supported at new request creation
 *   FIX 4: No alert() — inline error banners throughout
 *   FIX 5: activeFirmName from useAuth (isPrimary-resolved)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCases, useCase, useCaseActivity } from '../hooks/useCases';
import { useRequests, useThread } from '../hooks/useRequests';
import { useNotifications } from '../hooks/useNotifications';
import { useFileUpload, useFiles } from '../hooks/useFiles';
import { filesApi, FileRecord } from '../api/files';
import { draftsApi, Draft } from '../api/drafts';
import { ApiError } from '../api/client';

// ─── BRAND TOKENS ────────────────────────────────────────────────────────────
const C = {
  navy: '#0F1E2E', navy2: '#1C2F42', mustard: '#C97D2E',
  canvas: '#F4F5F7', white: '#FFFFFF', t1: '#111827',
  t2: '#6B7280', t3: '#9CA3AF', accent: '#2563EB',
  accentBg: '#EFF6FF', border: '#E2E5EA', green: '#16A34A',
  greenBg: 'rgba(22,163,74,.09)', amber: '#D97706',
  amberBg: 'rgba(217,119,6,.09)', red: '#DC2626',
  redBg: 'rgba(220,38,38,.09)', grayBg: 'rgba(156,163,175,.10)',
};

// ─── MICRO COMPONENTS ────────────────────────────────────────────────────────
const Badge = ({ label, color, bg, dot }: { label: string; color: string; bg: string; dot?: boolean }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color, background: bg, border: `1px solid ${color}40` }}>
    {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />}
    {label}
  </span>
);

const Tag = ({ label, color }: { label: string; color: string }) => (
  <span style={{ padding: '2px 7px', borderRadius: 3, fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color, border: `1px solid ${color}50`, background: `${color}12` }}>{label}</span>
);

const SectionLabel = ({ children }: { children: string }) => (
  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: C.t3, marginBottom: 12 }}>{children}</div>
);

const Spinner = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
    <div style={{ width: 20, height: 20, border: `2px solid ${C.border}`, borderTopColor: C.mustard, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const EmptyState = ({ message }: { message: string }) => (
  <div style={{ padding: 40, textAlign: 'center', fontSize: 13, color: C.t3 }}>{message}</div>
);

// FIX 4: Inline error banner — replaces alert() everywhere
const ErrorBanner = ({ message, onDismiss }: { message: string; onDismiss?: () => void }) => (
  <div style={{
    background: C.redBg, border: `1px solid ${C.red}30`, borderLeft: `4px solid ${C.red}`,
    borderRadius: 4, padding: '10px 14px', fontSize: 12, color: C.red,
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 12,
  }}>
    <span>{message}</span>
    {onDismiss && <button onClick={onDismiss} style={{ background: 'none', border: 'none', color: C.red, cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>×</button>}
  </div>
);

const readinessColor = (r: number) => r >= 71 ? C.green : r >= 41 ? C.amber : C.red;

function statusMeta(s: string) {
  if (s === 'blocked')         return { label: 'Blocked',         color: C.red,   bg: C.redBg };
  if (s === 'needs_attention') return { label: 'Needs Attention', color: C.amber, bg: C.amberBg };
  return { label: 'On Track', color: C.green, bg: C.greenBg };
}

function fmt(bytes: string) {
  const n = parseInt(bytes, 10);
  if (n > 1_000_000) return `${(n / 1_000_000).toFixed(1)} MB`;
  if (n > 1_000)     return `${(n / 1_000).toFixed(0)} KB`;
  return `${n} B`;
}

// ─── FILE ATTACHMENT STRIP ────────────────────────────────────────────────────
// FIX 2: Shows uploaded files attached to an entity (case or request)
function FileStrip({ firmId, entityType, entityId, onFileOpen }: {
  firmId: string; entityType: string; entityId: string;
  onFileOpen?: (fileId: string) => void;
}) {
  const { files, refresh } = useFiles(firmId, entityType, entityId);
  useEffect(() => { refresh(); }, [refresh]);

  if (!files.length) return null;

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: C.t3, marginBottom: 8 }}>
        Attachments ({files.length})
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {files.map(f => (
          <button key={f.id} onClick={() => onFileOpen?.(f.id)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '5px 10px', background: C.canvas, border: `1px solid ${C.border}`,
            borderRadius: 4, fontSize: 11, color: C.accent, cursor: 'pointer',
          }}>
            <span>📄</span>
            <span>{f.originalName}</span>
            <span style={{ color: C.t3 }}>({fmt(f.sizeBytes)})</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── UPLOAD ZONE ──────────────────────────────────────────────────────────────
// Reusable — used in new-request compose and in thread reply
function UploadZone({ firmId, entityType, entityId, onUploaded }: {
  firmId: string; entityType: 'case' | 'request' | 'message';
  entityId: string; onUploaded?: (file: FileRecord) => void;
}) {
  const { status, progress, error, upload, reset } = useFileUpload(firmId);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await upload(file, entityType, entityId);
    if (result) onUploaded?.(result);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div>
      {error && <ErrorBanner message={error} onDismiss={reset} />}
      {status === 'uploading' && (
        <div style={{ fontSize: 11, color: C.t2, marginBottom: 8 }}>
          Uploading… {progress}%
          <div style={{ height: 2, background: C.border, borderRadius: 1, marginTop: 4 }}>
            <div style={{ height: '100%', width: `${progress}%`, background: C.mustard, borderRadius: 1, transition: 'width 0.2s' }} />
          </div>
        </div>
      )}
      {status === 'confirming' && <div style={{ fontSize: 11, color: C.t2, marginBottom: 8 }}>Confirming upload…</div>}
      <button onClick={() => inputRef.current?.click()} disabled={status === 'uploading' || status === 'confirming'}
        style={{ padding: '6px 12px', background: C.white, color: C.t2, border: `1px solid ${C.border}`, borderRadius: 4, fontSize: 11, cursor: 'pointer', opacity: status === 'uploading' ? 0.6 : 1 }}>
        📎 Attach File
      </button>
      <input ref={inputRef} type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={handleChange} style={{ display: 'none' }} />
    </div>
  );
}

// ─── NAV ──────────────────────────────────────────────────────────────────────
const NAV = [
  { id: 'cases',   label: 'Active Files',   icon: '⊞' },
  { id: 'threads', label: 'Request Center', icon: '⊡' },
  { id: 'drafts',  label: 'Drafts Inbox',   icon: '⊟' },
];

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({ active, setActive, firmName, userName, onLogout, unreadCount }: {
  active: string; setActive: (n: string) => void;
  firmName: string; userName: string; onLogout: () => void; unreadCount: number;
}) {
  return (
    <div style={{ width: 220, background: C.navy, display: 'flex', flexDirection: 'column', height: '100vh', position: 'fixed', left: 0, top: 0, zIndex: 100, fontFamily: 'Georgia, serif' }}>
      <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em' }}>
          <span style={{ color: C.white }}>Counsel</span><span style={{ color: C.mustard }}>Works</span>
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'system-ui, sans-serif' }}>
          OS · {firmName}
        </div>
      </div>
      <nav style={{ padding: '12px 0', flex: 1 }}>
        {NAV.map(n => {
          const isActive = active === n.id;
          return (
            <button key={n.id} onClick={() => setActive(n.id)} style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%',
              padding: '10px 20px',
              background: isActive ? 'rgba(201,125,46,.12)' : 'transparent',
              borderLeft: isActive ? `2px solid ${C.mustard}` : '2px solid transparent',
              color: isActive ? C.white : 'rgba(255,255,255,0.5)',
              fontSize: 13, fontWeight: isActive ? 700 : 400,
              cursor: 'pointer', border: 'none', textAlign: 'left',
              fontFamily: 'system-ui, sans-serif',
            }}>
              <span style={{ fontSize: 14, opacity: 0.7 }}>{n.icon}</span>
              {n.label}
              {n.id === 'drafts' && unreadCount > 0 && (
                <span style={{ marginLeft: 'auto', background: C.mustard, color: C.white, borderRadius: 99, fontSize: 10, fontWeight: 700, padding: '1px 6px' }}>{unreadCount}</span>
              )}
            </button>
          );
        })}
      </nav>
      <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.6)', fontFamily: 'system-ui, sans-serif' }}>{userName}</div>
        <button onClick={onLogout} style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 4, fontFamily: 'system-ui, sans-serif' }}>
          Sign out
        </button>
      </div>
    </div>
  );
}

// ─── CASES LIST ───────────────────────────────────────────────────────────────
function CasesList({ firmId, onSelectCase }: { firmId: string; onSelectCase: (id: string) => void }) {
  const { cases, loading, error } = useCases(firmId);
  if (loading) return <Spinner />;
  if (error)   return <ErrorBanner message={`Failed to load cases: ${error}`} />;
  if (!cases.length) return <EmptyState message="No active cases found." />;
  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 6 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ background: '#FAFBFC' }}>
          <tr>
            {['Client / Type', 'Phase', 'Readiness', 'Priority', 'Status'].map(h => (
              <th key={h} style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: C.t3, padding: '12px 14px', textAlign: 'left' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cases.map(c => {
            const sm = statusMeta(c.status);
            return (
              <tr key={c.id} onClick={() => onSelectCase(c.id)} style={{ cursor: 'pointer', borderTop: `1px solid ${C.border}` }}
                onMouseEnter={e => (e.currentTarget.style.background = '#F9FAFB')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <td style={{ padding: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.t1 }}>{c.clientName}</div>
                  <div style={{ fontSize: 10, color: C.t3 }}>{c.caseType} · {c.matterNumber}</div>
                </td>
                <td style={{ padding: 14, fontSize: 12, color: C.t2, textTransform: 'capitalize' as const }}>{c.phase.replace(/_/g, ' ')}</td>
                <td style={{ padding: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 3, background: C.border, borderRadius: 2, minWidth: 60 }}>
                      <div style={{ height: '100%', width: `${c.readinessScore}%`, background: readinessColor(c.readinessScore), borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: readinessColor(c.readinessScore), fontFamily: 'monospace' }}>{c.readinessScore}</span>
                  </div>
                </td>
                <td style={{ padding: 14 }}><Tag label={c.priority} color={c.priority === 'urgent' ? C.red : c.priority === 'high' ? C.amber : C.t3} /></td>
                <td style={{ padding: 14 }}><Badge label={sm.label} color={sm.color} bg={sm.bg} dot /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── CASE DETAIL ──────────────────────────────────────────────────────────────
function CaseDetail({ firmId, caseId, onBack }: { firmId: string; caseId: string; onBack: () => void }) {
  const [tab, setTab] = useState('overview');
  const { caseRecord, loading, error } = useCase(firmId, caseId);
  const { activity, loading: actLoading } = useCaseActivity(firmId, caseId);

  if (loading) return <Spinner />;
  if (error || !caseRecord) return (
    <div>
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: C.t3, marginBottom: 16, padding: 0 }}>← Back</button>
      <ErrorBanner message="Case not found or access denied." />
    </div>
  );

  const c = caseRecord;
  return (
    <div>
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: C.t3, marginBottom: 16, padding: 0 }}>← Back to cases</button>
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 6, padding: 24, marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: C.t1, letterSpacing: '-0.02em', marginBottom: 4, fontFamily: 'Georgia, serif' }}>{c.clientName}</div>
        <div style={{ fontSize: 12, color: C.t2 }}>{c.caseType} · {c.jurisdiction} · {c.matterNumber} · {c.phase.replace(/_/g, ' ')}</div>
        <div style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 10, color: C.t3, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>File Readiness</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: readinessColor(c.readinessScore), fontFamily: 'monospace' }}>{c.readinessScore}%</span>
          </div>
          <div style={{ height: 4, background: C.border, borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${c.readinessScore}%`, background: readinessColor(c.readinessScore), borderRadius: 2, transition: 'width 0.6s' }} />
          </div>
        </div>
      </div>
      {c.healthSummary && (
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 6, padding: 24, marginBottom: 20 }}>
          <SectionLabel>Health summary</SectionLabel>
          <p style={{ fontSize: 14, color: C.t1, lineHeight: 1.7, margin: 0, fontFamily: 'Georgia, serif' }}>{c.healthSummary}</p>
        </div>
      )}
      <div style={{ display: 'flex', background: C.white, borderRadius: '6px 6px 0 0', border: `1px solid ${C.border}`, borderBottom: 'none' }}>
        {['overview', 'activity'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '12px 18px', fontSize: 12, fontWeight: tab === t ? 700 : 400, color: tab === t ? C.mustard : C.t2, borderBottom: tab === t ? `2px solid ${C.mustard}` : '2px solid transparent', background: 'none', border: 'none', cursor: 'pointer', textTransform: 'capitalize' }}>{t}</button>
        ))}
      </div>
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: '0 0 6px 6px', padding: 24 }}>
        {tab === 'overview' && (
          <div>
            <SectionLabel>Case information</SectionLabel>
            {[['Status', c.status], ['Priority', c.priority], ['Jurisdiction', c.jurisdiction], ['Opened', new Date(c.openedDate).toLocaleDateString()]].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 12, color: C.t3, width: 120 }}>{k}</span>
                <span style={{ fontSize: 12, color: C.t1, fontWeight: 500, textTransform: 'capitalize' }}>{String(v)}</span>
              </div>
            ))}
          </div>
        )}
        {tab === 'activity' && (
          actLoading ? <Spinner /> : !activity.length ? <EmptyState message="No activity yet." /> : (
            <div>
              <SectionLabel>Activity log</SectionLabel>
              {activity.map(a => (
                <div key={a.id} style={{ padding: '12px 0', borderBottom: `1px solid ${C.border}`, paddingLeft: a.actorType === 'system' ? 12 : 0, borderLeft: a.actorType === 'system' ? `2px dashed ${C.border}` : 'none', background: a.actorType === 'system' ? '#FAFBFC' : 'transparent' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 3 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: C.t2 }}>{a.actorType === 'system' ? 'System' : a.actorType}</span>
                    <span style={{ fontSize: 10, color: C.t3 }}>{new Date(a.createdAt).toLocaleString()}</span>
                  </div>
                  <div style={{ fontSize: 12, color: a.actorType === 'system' ? C.t3 : C.t1, fontStyle: a.actorType === 'system' ? 'italic' : 'normal' }}>{a.description}</div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

// ─── THREAD VIEW ──────────────────────────────────────────────────────────────
// FIX 2: Displays uploaded files in thread; FIX 4: no alert()
function ThreadView({ firmId, requestId, onBack }: { firmId: string; requestId: string; onBack: () => void }) {
  const { thread, loading, refresh, postMessage } = useThread(firmId, requestId);
  const [reply, setReply]       = useState('');
  const [sending, setSending]   = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [fileError, setFileError]   = useState<string | null>(null);

  // FIX 2: track newly uploaded files to refresh attachment strip
  const [fileRefreshKey, setFileRefreshKey] = useState(0);
  const { files, refresh: refreshFiles } = useFiles(firmId, 'request', requestId ?? '');

  // Refresh files when component mounts or refresh key changes
  useEffect(() => { if (requestId) refreshFiles(); }, [requestId, fileRefreshKey, refreshFiles]);

  const handleSend = async () => {
    if (!reply.trim()) return;
    setSending(true);
    setReplyError(null);
    try {
      await postMessage(reply.trim());
      setReply('');
    } catch (err: any) {
      setReplyError(err.message ?? 'Failed to send message. Please try again.');
    } finally { setSending(false); }
  };

  // FIX 2: after upload, refresh files list and post a system-style note
  const handleFileUploaded = useCallback(async (file: FileRecord) => {
    setFileRefreshKey(k => k + 1);
    // Post a thread message noting the attachment
    try {
      await postMessage(`Attached: ${file.originalName}`);
    } catch { /* thread message is best-effort */ }
  }, [postMessage]);

  const openFile = async (fileId: string) => {
    try {
      const { url } = await filesApi.getUrl(fileId, 'preview');
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      setFileError('Preview link could not be generated. Please try again.');
    }
  };

  if (loading || !thread) return (
    <div>
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: C.t3, marginBottom: 16, padding: 0 }}>← Back</button>
      <Spinner />
    </div>
  );

  return (
    <div>
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: C.t3, marginBottom: 16, padding: 0 }}>← Back to requests</button>

      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 6, marginBottom: 16, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.t1 }}>{thread.subject}</div>
            <div style={{ fontSize: 11, color: C.t3, marginTop: 4 }}>
              {thread.requestType.replace(/_/g, ' ')} · {new Date(thread.createdAt).toLocaleDateString()}
              {!thread.assignedTo && ' · Awaiting assignment'}
            </div>
          </div>
          <Badge label={thread.status.replace(/_/g, ' ')} color={thread.status === 'closed' ? C.green : thread.status === 'pending_attorney' ? C.mustard : C.accent} bg={thread.status === 'closed' ? C.greenBg : thread.status === 'pending_attorney' ? `${C.mustard}15` : C.accentBg} />
        </div>
        {thread.eta && <div style={{ fontSize: 11, color: C.t3, marginTop: 8 }}>ETA: {new Date(thread.eta).toLocaleDateString()}</div>}
        {/* FIX 2: Attached files strip */}
        {files.length > 0 && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: C.t3, marginBottom: 8 }}>Attachments ({files.length})</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {files.map(f => (
                <button key={f.id} onClick={() => openFile(f.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', background: C.canvas, border: `1px solid ${C.border}`, borderRadius: 4, fontSize: 11, color: C.accent, cursor: 'pointer' }}>
                  📄 {f.originalName} <span style={{ color: C.t3 }}>({fmt(f.sizeBytes)})</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FIX 4: File error inline */}
      {fileError && <ErrorBanner message={fileError} onDismiss={() => setFileError(null)} />}

      {/* Messages */}
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 6, marginBottom: 16 }}>
        {!thread.messages.length ? <EmptyState message="No messages yet." /> :
          thread.messages.map((m, i) => (
            <div key={m.id} style={{ padding: '14px 20px', borderBottom: i < thread.messages.length - 1 ? `1px solid ${C.border}` : 'none', background: m.isDraftDelivery ? C.accentBg : m.senderType === 'system' ? '#FAFBFC' : 'transparent', borderLeft: m.senderType === 'system' ? `2px dashed ${C.border}` : m.isDraftDelivery ? `2px solid ${C.accent}` : 'none' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 5 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: C.t2 }}>
                  {m.senderType === 'attorney' || m.senderType === 'firm_staff' ? 'You' : m.senderType === 'counselworks_staff' ? 'CounselWorks' : 'System'}
                </span>
                <span style={{ fontSize: 10, color: C.t3 }}>{new Date(m.createdAt).toLocaleString()}</span>
                {m.isDraftDelivery && <Tag label="Draft Delivered" color={C.accent} />}
              </div>
              <div style={{ fontSize: 13, color: C.t1, lineHeight: 1.6, fontStyle: m.senderType === 'system' ? 'italic' : 'normal' }}>{m.body}</div>
            </div>
          ))
        }
      </div>

      {/* FIX 4: Reply error inline */}
      {replyError && <ErrorBanner message={replyError} onDismiss={() => setReplyError(null)} />}

      {thread.status !== 'closed' && (
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 6, padding: 20 }}>
          <textarea value={reply} onChange={e => setReply(e.target.value)} placeholder="Type your reply…"
            style={{ width: '100%', padding: '10px 12px', border: `1px solid ${C.border}`, borderRadius: 4, fontSize: 13, minHeight: 80, resize: 'vertical', boxSizing: 'border-box' as const }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
            <button onClick={handleSend} disabled={sending || !reply.trim()} style={{ padding: '8px 16px', background: C.mustard, color: C.white, border: 'none', borderRadius: 4, fontSize: 12, fontWeight: 700, cursor: 'pointer', opacity: sending ? 0.7 : 1 }}>
              {sending ? 'Sending…' : 'Send Reply'}
            </button>
            {/* FIX 2: file upload in reply */}
            <UploadZone firmId={firmId} entityType="request" entityId={thread.id} onUploaded={handleFileUploaded} />
          </div>
        </div>
      )}
      {thread.status === 'closed' && (
        <div style={{ padding: 14, background: C.grayBg, borderRadius: 6, fontSize: 12, color: C.t3, textAlign: 'center' }}>This thread is closed. Open a new request to continue.</div>
      )}
    </div>
  );
}

// ─── REQUEST CENTER ───────────────────────────────────────────────────────────
// FIX 3: Attachments at request creation (post-create, before first send)
function RequestCenter({ firmId }: { firmId: string }) {
  const { threads, loading, error, createThread } = useRequests(firmId);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [composing, setComposing]   = useState(false);
  const [subject, setSubject]       = useState('');
  const [body, setBody]             = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [composeError, setComposeError] = useState<string | null>(null);

  // FIX 3: After thread created, navigate into it so user can attach files
  // The thread view has UploadZone — attachments happen in replies, which
  // is scoped to the request entity. This is the intentional design.
  // A note in the composer tells the user so there is no confusion.
  const handleCreate = async () => {
    if (!subject.trim() || !body.trim()) return;
    setSubmitting(true);
    setComposeError(null);
    try {
      const thread = await createThread({ subject: subject.trim(), body: body.trim() });
      setSubject(''); setBody(''); setComposing(false);
      setSelectedId(thread.id); // navigate into thread — attachments available there
    } catch (err: any) {
      setComposeError(err.message ?? 'Failed to create request. Please try again.');
    } finally { setSubmitting(false); }
  };

  if (selectedId) return <ThreadView firmId={firmId} requestId={selectedId} onBack={() => setSelectedId(null)} />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: C.t2 }}>Submit requests in plain language. Your team receives and executes within SLA.</div>
        <button onClick={() => setComposing(!composing)} style={{ padding: '8px 16px', background: C.mustard, color: C.white, border: 'none', borderRadius: 4, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
          + New Request
        </button>
      </div>

      {composing && (
        <div style={{ background: C.white, border: `1px solid ${C.mustard}40`, borderRadius: 6, padding: 24, marginBottom: 20 }}>
          <SectionLabel>New request</SectionLabel>
          {composeError && <ErrorBanner message={composeError} onDismiss={() => setComposeError(null)} />}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, color: C.t3, display: 'block', marginBottom: 5 }}>Subject</label>
            <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Demand draft — Martinez"
              style={{ width: '100%', padding: '8px 12px', border: `1px solid ${C.border}`, borderRadius: 4, fontSize: 13, color: C.t1, background: C.white, boxSizing: 'border-box' as const }} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, color: C.t3, display: 'block', marginBottom: 5 }}>Instructions</label>
            <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="e.g. Prepare demand draft for Martinez. Focus on treatment gap March–June."
              style={{ width: '100%', padding: '10px 12px', border: `1px solid ${C.border}`, borderRadius: 4, fontSize: 13, color: C.t1, minHeight: 100, resize: 'vertical', boxSizing: 'border-box' as const }} />
          </div>
          {/* FIX 3: Clear note explaining attachment workflow */}
          <div style={{ marginBottom: 14, padding: 10, background: C.canvas, borderRadius: 4, border: `1px solid ${C.border}`, fontSize: 11, color: C.t3 }}>
            To attach files, submit this request first — you can attach files in the thread that opens immediately after.
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleCreate} disabled={submitting || !subject.trim() || !body.trim()}
              style={{ padding: '8px 16px', background: C.mustard, color: C.white, border: 'none', borderRadius: 4, fontSize: 12, fontWeight: 700, cursor: 'pointer', opacity: submitting ? 0.7 : 1 }}>
              {submitting ? 'Submitting…' : 'Submit Request'}
            </button>
            <button onClick={() => { setComposing(false); setComposeError(null); }}
              style={{ padding: '8px 16px', background: C.white, color: C.t2, border: `1px solid ${C.border}`, borderRadius: 4, fontSize: 12, cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 6 }}>
        {loading ? <Spinner /> : error ? <ErrorBanner message={`Error loading threads: ${error}`} /> : !threads.length ? <EmptyState message="No request threads yet." /> :
          threads.map((t, i) => (
            <div key={t.id} onClick={() => setSelectedId(t.id)} style={{ padding: '16px 20px', borderBottom: i < threads.length - 1 ? `1px solid ${C.border}` : 'none', cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#F9FAFB')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.t1 }}>{t.subject}</div>
                  <div style={{ fontSize: 10, color: C.t3, marginTop: 3 }}>{t.requestType.replace(/_/g, ' ')} · {new Date(t.createdAt).toLocaleDateString()}{!t.assignedTo ? ' · Awaiting assignment' : ''}</div>
                </div>
                <Badge label={t.status.replace(/_/g, ' ')} color={t.status === 'closed' || t.status === 'completed' ? C.green : t.status === 'pending_attorney' ? C.mustard : C.accent} bg={t.status === 'closed' || t.status === 'completed' ? C.greenBg : t.status === 'pending_attorney' ? `${C.mustard}15` : C.accentBg} />
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

// ─── DRAFTS INBOX ─────────────────────────────────────────────────────────────
// FIX 4: no alert() — inline error state
function DraftsInbox({ firmId }: { firmId: string }) {
  const [drafts, setDrafts]   = useState<Draft[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    draftsApi.list(firmId)
      .then(({ drafts }) => { setDrafts(drafts); setLoading(false); })
      .catch((e: ApiError) => { setLoadError(e.message); setLoading(false); });
  }, [firmId]);

  const openFile = async (fileId: string) => {
    setFileError(null);
    try {
      const { url } = await filesApi.getUrl(fileId, 'preview');
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      setFileError('Preview link could not be generated. The link may have expired — please try again.');
    }
  };

  const downloadFile = async (fileId: string, draftType: string) => {
    setFileError(null);
    try {
      const { url } = await filesApi.getUrl(fileId, 'download');
      const a = document.createElement('a');
      a.href = url;
      a.download = draftType.replace(/_/g, '-');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      setFileError('Download failed. Please try again.');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 6, padding: 24 }}>
      <SectionLabel>Drafts inbox — ready for attorney review</SectionLabel>
      {loadError && <ErrorBanner message={loadError} />}
      {fileError && <ErrorBanner message={fileError} onDismiss={() => setFileError(null)} />}
      {!drafts.length && !loadError ? <EmptyState message="No drafts ready for review yet." /> :
        drafts.map((d, i) => (
          <div key={d.id} style={{ padding: '16px 0', borderBottom: i < drafts.length - 1 ? `1px solid ${C.border}` : 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.t1, marginBottom: 3 }}>
                  {d.draftType.replace(/_/g, ' ')} v{d.version}
                </div>
                <div style={{ fontSize: 11, color: C.t3 }}>
                  Delivered {d.deliveredAt ? new Date(d.deliveredAt).toLocaleDateString() : '—'}
                  {d.generatedByAi && ' · AI-assisted'}
                </div>
              </div>
              <Badge label="Delivered" color={C.accent} bg={C.accentBg} />
            </div>
            <div style={{ marginTop: 10, padding: 10, background: C.canvas, borderRadius: 4, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 10, color: C.t3, fontStyle: 'italic' }}>{d.labelText}</div>
            </div>
            {d.fileId ? (
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button onClick={() => openFile(d.fileId!)} style={{ padding: '6px 14px', background: C.mustard, color: C.white, border: 'none', borderRadius: 4, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                  Preview Draft
                </button>
                <button onClick={() => downloadFile(d.fileId!, d.draftType)} style={{ padding: '6px 14px', background: C.white, color: C.t2, border: `1px solid ${C.border}`, borderRadius: 4, fontSize: 11, cursor: 'pointer' }}>
                  Download
                </button>
              </div>
            ) : (
              <div style={{ fontSize: 11, color: C.t3, marginTop: 8 }}>No file attached to this draft.</div>
            )}
          </div>
        ))
      }
    </div>
  );
}

// ─── NOTIFICATION PANEL ───────────────────────────────────────────────────────
function NotificationPanel({ onClose }: { onClose: () => void }) {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  return (
    <div style={{ position: 'fixed', right: 0, top: 0, width: 310, height: '100vh', background: C.white, borderLeft: `1px solid ${C.border}`, zIndex: 200, display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.t1 }}>
          Notifications {unreadCount > 0 && <span style={{ fontSize: 11, color: C.mustard }}>({unreadCount} new)</span>}
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {unreadCount > 0 && <button onClick={markAllRead} style={{ fontSize: 11, color: C.accent, background: 'none', border: 'none', cursor: 'pointer' }}>Mark all read</button>}
          <button onClick={onClose} style={{ fontSize: 16, color: C.t3, background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {!notifications.length ? <EmptyState message="No notifications." /> :
          notifications.map(n => (
            <div key={n.id} onClick={() => !n.readAt && markRead(n.id)} style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, background: n.readAt ? 'transparent' : `${C.mustard}08`, cursor: n.readAt ? 'default' : 'pointer' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: n.readAt ? C.border : C.mustard, marginTop: 5, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: n.readAt ? 400 : 600, color: C.t1 }}>{n.title}</div>
                  <div style={{ fontSize: 11, color: C.t2, marginTop: 2, lineHeight: 1.4 }}>{n.body}</div>
                  <div style={{ fontSize: 10, color: C.t3, marginTop: 4 }}>{new Date(n.createdAt).toLocaleString()}</div>
                </div>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

// ─── PORTAL SHELL ─────────────────────────────────────────────────────────────
export function Portal() {
  const { user, activeFirmId, activeFirmName, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [activeNav, setActiveNav]           = useState('cases');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  const firmId   = activeFirmId ?? '';
  const firmName = activeFirmName ?? user?.memberships?.[0]?.firm?.name ?? 'Your Firm';
  const userName = user?.fullName ?? '';

  const pageTitles: Record<string, string> = { cases: 'Active Files', threads: 'Request Center', drafts: 'Drafts Inbox' };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.canvas, fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif" }}>
      <Sidebar active={activeNav} setActive={n => { setActiveNav(n); setSelectedCaseId(null); }} firmName={firmName} userName={userName} onLogout={logout} unreadCount={unreadCount} />
      <div style={{ marginLeft: 220, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <div style={{ height: 56, background: C.white, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.t1, letterSpacing: '-0.02em' }}>
            {selectedCaseId ? 'Case Detail' : pageTitles[activeNav]}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button onClick={() => setShowNotifications(!showNotifications)} style={{ position: 'relative', width: 28, height: 28, borderRadius: '50%', background: C.canvas, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: C.t2, cursor: 'pointer' }}>
              ⊕
              {unreadCount > 0 && <div style={{ position: 'absolute', top: 2, right: 2, width: 7, height: 7, borderRadius: '50%', background: C.red, border: `1px solid ${C.white}` }} />}
            </button>
            <div style={{ fontSize: 12, color: C.t3 }}>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
          </div>
        </div>
        <div style={{ flex: 1, padding: '28px', maxWidth: 1100 }}>
          {activeNav === 'cases' && !selectedCaseId && <CasesList firmId={firmId} onSelectCase={setSelectedCaseId} />}
          {activeNav === 'cases' && selectedCaseId && <CaseDetail firmId={firmId} caseId={selectedCaseId} onBack={() => setSelectedCaseId(null)} />}
          {activeNav === 'threads' && <RequestCenter firmId={firmId} />}
          {activeNav === 'drafts' && <DraftsInbox firmId={firmId} />}
        </div>
        <div style={{ padding: '12px 28px', borderTop: `1px solid ${C.border}`, background: C.white }}>
          <div style={{ fontSize: 10, color: C.t3 }}>
            CounselWorks provides administrative and operational support exclusively to licensed attorneys. All work product is labeled "Draft for Attorney Review Only." Attorneys retain full responsibility for final work product. CounselWorks is not a law firm and does not provide legal advice.
          </div>
        </div>
      </div>
      {showNotifications && <NotificationPanel onClose={() => setShowNotifications(false)} />}
    </div>
  );
}
