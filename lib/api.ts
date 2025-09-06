import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Session {
  sessionId: string;
  userId: string;
  deviceId: string;
  createdAt: string;
  lastSeen: string;
  active: boolean;
  deviceInfo?: string;
}

export interface LoginResponse {
  status: 'ok' | 'limit_reached';
  sessionId?: string;
  activeSessions?: Session[];
}

export interface ValidationResponse {
  valid: boolean;
  reason?: string;
}

export const sessionAPI = {
  login: async (userId: string, deviceId: string): Promise<LoginResponse> => {
    const response = await api.post('/sessions/login', { userId, deviceId });
    return response.data;
  },

  logout: async (sessionId: string): Promise<{ status: string }> => {
    const response = await api.post('/sessions/logout', { sessionId });
    return response.data;
  },

  validate: async (sessionId: string): Promise<ValidationResponse> => {
    const response = await api.get(`/sessions/validate?sessionId=${sessionId}`);
    return response.data;
  },

  getActiveSessions: async (userId: string): Promise<{ sessions: Session[] }> => {
    const response = await api.get(`/sessions/active?userId=${userId}`);
    return response.data;
  },

  forceLogout: async (sessionId: string): Promise<{ status: string }> => {
    const response = await api.post('/sessions/force-logout', { sessionId });
    return response.data;
  }
};