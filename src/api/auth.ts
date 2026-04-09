import { api } from './client';

export interface User {
  id: string;
  email: string;
  fullName: string;
  memberships: Array<{ firmId: string; role: string; isPrimary: boolean; firm: { id: string; name: string; slug: string } }>;
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ user: User }>('/auth/login', { email, password }),

  logout: () => api.post<{ message: string }>('/auth/logout'),

  me: () => api.get<{ user: User }>('/auth/me'),

  refresh: () => api.post<{ message: string }>('/auth/refresh'),
};
