import { api } from './client';

export interface Draft {
  id: string;
  caseId: string;
  requestId: string | null;
  fileId: string | null;
  draftType: string;
  version: number;
  status: string;
  labelText: string;
  generatedByAi: boolean;
  reviewedBy: string | null;
  approvedBy: string | null;
  notes: string | null;
  createdAt: string;
  deliveredAt: string | null;
}

export const draftsApi = {
  list: (firmId: string, page = 1) =>
    api.get<{ drafts: Draft[]; meta: { total: number; pages: number } }>(`/firms/${firmId}/drafts?page=${page}`),

  get: (firmId: string, draftId: string) =>
    api.get<{ draft: Draft }>(`/firms/${firmId}/drafts/${draftId}`),
};
