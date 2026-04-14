/**
 * portalApi.ts — typed fetch wrapper for the CounselWorks portal backend.
 *
 * In development, requests go to `/api/*` and Vite's dev proxy rewrites them
 * to http://localhost:4000/firms/{FIRM_A_ID}/portal/*. In production, the
 * prefix resolves to the full Railway API URL via src/config.ts.
 *
 * The response shapes here intentionally mirror the types exported from
 * src/data/mockData.ts so that page components can switch from mocks to the
 * API with minimal code churn.
 */
import type {
  Case,
  RequestThread,
  Draft,
  DocumentItem,
  AttentionItem,
} from '../data/mockData';
import { API_BASE } from '../config';

// ─── COMMON RESPONSE TYPES ────────────────────────────────────────────────────

export interface TeamMemberApi {
  name: string;
  role: string;
  activitySummary: string;
  lastActive: string;
  isActive: boolean;
}

export interface WeekSummary {
  leadsProcessed: number;
  casesAdvanced: number;
  documentsCollected: number;
  draftsDelivered: number;
}

export interface MorningBriefResponse {
  greeting: string;
  date: string;
  attentionItems: AttentionItem[];
  team: TeamMemberApi[];
  weekSummary: WeekSummary;
  portfolio: Case[];
}

export interface CasesResponse {
  cases: Case[];
}

export interface ChecklistItemApi {
  id: string;
  label: string;
  status: string;
  required: boolean;
  dueAt: string | null;
  checklistType: string;
}

export interface TimelineEntry {
  id: string;
  activityType: string;
  description: string;
  actorType: string;
  createdAt: string;
  when: string;
}

export interface EscalationStepApi {
  label: string;
  dueAt: string;
  offsetDays: number;
  state: 'done' | 'current' | 'pending';
}

export interface EscalationApi {
  id: string;
  provider: string;
  recordType: string;
  requestedAt: string;
  status: string;
  steps: EscalationStepApi[];
}

export interface CaseDetailResponse {
  case: Case;
  checklist: ChecklistItemApi[];
  documents: DocumentItem[];
  drafts: Draft[];
  threads: RequestThread[];
  timeline: TimelineEntry[];
  escalations: EscalationApi[];
}

export interface ThreadsResponse {
  threads: RequestThread[];
}

export interface ThreadResponse {
  thread: RequestThread;
}

export interface DraftsResponse {
  drafts: Draft[];
}

export interface DocumentsResponse {
  documents: DocumentItem[];
}

export interface CreateThreadBody {
  subject: string;
  body: string;
  caseId?: string;
  requestType?:
    | 'draft_request'
    | 'status_update'
    | 'document_chase'
    | 'records_summary'
    | 'chronology'
    | 'general';
}

export interface CreateThreadResponse {
  threadId: string;
}

export interface CreateMessageResponse {
  messageId: string;
}

// ─── ERROR HANDLING ───────────────────────────────────────────────────────────

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

// ─── CORE FETCHER ─────────────────────────────────────────────────────────────

async function request<T>(
  path: string,
  init: RequestInit = {},
  signal?: AbortSignal,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
    signal,
    ...init,
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    let code: string | undefined;
    try {
      const body = await res.json();
      if (body?.error?.message) message = body.error.message;
      if (body?.error?.code) code = body.error.code;
    } catch {
      // swallow — response was not JSON
    }
    throw new ApiError(message, res.status, code);
  }

  // 204 No Content
  if (res.status === 204) return undefined as unknown as T;
  return (await res.json()) as T;
}

// ─── ENDPOINTS ────────────────────────────────────────────────────────────────

export function getMorningBrief(signal?: AbortSignal) {
  return request<MorningBriefResponse>('/morning-brief', {}, signal);
}

export function getCases(signal?: AbortSignal) {
  return request<CasesResponse>('/cases', {}, signal);
}

export function getCase(caseId: string, signal?: AbortSignal) {
  return request<CaseDetailResponse>(
    `/cases/${encodeURIComponent(caseId)}`,
    {},
    signal,
  );
}

export function getThreads(signal?: AbortSignal) {
  return request<ThreadsResponse>('/threads', {}, signal);
}

export function getThread(threadId: string, signal?: AbortSignal) {
  return request<ThreadResponse>(
    `/threads/${encodeURIComponent(threadId)}`,
    {},
    signal,
  );
}

export function createThread(body: CreateThreadBody, signal?: AbortSignal) {
  return request<CreateThreadResponse>(
    '/threads',
    { method: 'POST', body: JSON.stringify(body) },
    signal,
  );
}

export function replyToThread(
  threadId: string,
  body: string,
  signal?: AbortSignal,
) {
  return request<CreateMessageResponse>(
    `/threads/${encodeURIComponent(threadId)}/messages`,
    { method: 'POST', body: JSON.stringify({ body }) },
    signal,
  );
}

export function getDrafts(signal?: AbortSignal) {
  return request<DraftsResponse>('/drafts', {}, signal);
}

export function getDocuments(signal?: AbortSignal) {
  return request<DocumentsResponse>('/documents', {}, signal);
}
