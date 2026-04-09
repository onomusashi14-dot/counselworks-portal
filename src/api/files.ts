import { api } from './client';

export interface FileRecord {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: string;
  documentType: string;
  status: string;
  reviewStatus: string;
  createdAt: string;
  uploadedBy: string | null;
  linkId: string;
  linkedAt: string;
}

export interface UploadUrlResponse {
  fileId: string;
  uploadUrl: string;
  expiresAt: string;
}

export const filesApi = {
  getUploadUrl: (data: {
    firmId: string;
    entityType: 'case' | 'request' | 'message';
    entityId: string;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    documentType?: string;
  }) => api.post<UploadUrlResponse>('/api/files/upload-url', data),

  confirm: (fileId: string, entityType: string, entityId: string) =>
    api.post<{ file: FileRecord }>(`/api/files/${fileId}/confirm`, { entityType, entityId }),

  getUrl: (fileId: string, intent: 'preview' | 'download' = 'preview') =>
    api.get<{ url: string; expiresAt: string; intent: string }>(`/api/files/${fileId}/url?intent=${intent}`),

  list: (firmId: string, entityType: string, entityId: string) =>
    api.get<{ files: FileRecord[] }>(`/api/files?firmId=${firmId}&entityType=${entityType}&entityId=${entityId}`),

  delete: (fileId: string) =>
    api.delete<{ archived: boolean }>(`/api/files/${fileId}`),
};
