import { api } from './client';

export interface RequestThread {
  id: string;
  firmId: string;
  caseId: string | null;
  createdBy: string;
  assignedTo: string | null;
  subject: string;
  requestType: string;
  status: string;
  slaDueAt: string | null;
  eta: string | null;
  createdAt: string;
  closedAt: string | null;
}

export interface RequestMessage {
  id: string;
  senderId: string | null;
  senderType: string;
  body: string;
  isDraftDelivery: boolean;
  createdAt: string;
}

export interface ThreadDetail extends RequestThread {
  messages: RequestMessage[];
}

export const requestsApi = {
  list: (firmId: string, params?: { status?: string; page?: number }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.page)   q.set('page',   String(params.page));
    const qs = q.toString();
    return api.get<{ requests: RequestThread[]; meta: { total: number; pages: number } }>(
      `/firms/${firmId}/requests${qs ? `?${qs}` : ''}`
    );
  },

  get: (firmId: string, requestId: string) =>
    api.get<{ request: ThreadDetail }>(`/firms/${firmId}/requests/${requestId}`),

  create: (firmId: string, data: { subject: string; requestType?: string; caseId?: string; body: string }) =>
    api.post<{ request: RequestThread }>(`/firms/${firmId}/requests`, data),

  postMessage: (firmId: string, requestId: string, data: { body: string; isDraftDelivery?: boolean }) =>
    api.post<{ message: RequestMessage }>(`/firms/${firmId}/requests/${requestId}/messages`, data),

  update: (firmId: string, requestId: string, data: { status?: string; assignedTo?: string | null; eta?: string | null }) =>
    api.patch<{ request: RequestThread }>(`/firms/${firmId}/requests/${requestId}`, data),
};
