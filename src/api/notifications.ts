import { api } from './client';

export interface Notification {
  id: string;
  firmId: string | null;
  type: string;
  title: string;
  body: string;
  entityType: string | null;
  entityId: string | null;
  readAt: string | null;
  createdAt: string;
}

export const notificationsApi = {
  list: (params?: { unread?: boolean; page?: number }) => {
    const q = new URLSearchParams();
    if (params?.unread) q.set('unread', 'true');
    if (params?.page)   q.set('page',  String(params.page));
    const qs = q.toString();
    return api.get<{ notifications: Notification[]; meta: { total: number; unreadCount: number } }>(
      `/notifications${qs ? `?${qs}` : ''}`
    );
  },

  markRead: (id: string) =>
    api.patch<{ notification?: { id: string; readAt: string }; alreadyRead?: boolean }>(`/notifications/${id}/read`),

  markAllRead: () =>
    api.patch<{ updated: number }>('/notifications/read-all'),
};
