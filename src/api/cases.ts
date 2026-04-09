import { api } from './client';

export interface Case {
  id: string;
  firmId: string;
  matterNumber: string;
  clientName: string;
  caseType: string;
  jurisdiction: string;
  phase: string;
  status: string;
  priority: string;
  readinessScore: number;
  healthSummary: string | null;
  assignedCwUserId: string | null;
  primaryAttorneyId: string | null;
  openedDate: string;
  createdAt: string;
}

export interface ActivityEntry {
  id: string;
  actorType: string;
  actorId: string | null;
  activityType: string;
  description: string;
  createdAt: string;
  metadata: Record<string, unknown> | null;
}

export interface CasesResponse {
  cases: Case[];
  meta: { page: number; limit: number; total: number; pages: number };
}

export const casesApi = {
  list: (firmId: string, params?: { phase?: string; status?: string; priority?: string; page?: number }) => {
    const q = new URLSearchParams();
    if (params?.phase)    q.set('phase',    params.phase);
    if (params?.status)   q.set('status',   params.status);
    if (params?.priority) q.set('priority', params.priority);
    if (params?.page)     q.set('page',     String(params.page));
    const qs = q.toString();
    return api.get<CasesResponse>(`/firms/${firmId}/cases${qs ? `?${qs}` : ''}`);
  },

  get: (firmId: string, caseId: string) =>
    api.get<{ case: Case }>(`/firms/${firmId}/cases/${caseId}`),

  activity: (firmId: string, caseId: string, page = 1) =>
    api.get<{ activity: ActivityEntry[]; meta: { page: number; total: number; pages: number } }>(
      `/firms/${firmId}/cases/${caseId}/activity?page=${page}`
    ),
};
