import { api, setTokens, clearTokens } from './client';

export interface User {
  id: string;
  email: string;
  fullName: string;
  memberships: Array<{ firmId: string; role: string; isPrimary: boolean; firm: { id: string; name: string; slug: string } }>;
}

interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  login: async (email: string, password: string): Promise<{ user: User }> => {
    const data = await api.post<LoginResponse>('/auth/login', { email, password });
    // Store tokens in memory for subsequent Bearer auth
    if (data.accessToken && data.refreshToken) {
      setTokens(data.accessToken, data.refreshToken);
    }
    return { user: data.user };
  },

  logout: async () => {
    try {
      await api.post<{ message: string }>('/auth/logout');
    } catch {
      // Ignore — clear tokens regardless
    }
    clearTokens();
  },

  me: () => api.get<{ user: User }>('/auth/me'),

  refresh: () => api.post<{ message: string }>('/auth/refresh'),
};
