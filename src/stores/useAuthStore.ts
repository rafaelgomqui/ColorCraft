import { create } from 'zustand';
import api from '../api/client';

interface User {
  id: string;
  nombre: string;
  correo: string;
  usuario: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  login: (user, token) => {
    localStorage.setItem('token', token);
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
  checkAuth: async () => {
    try {
      if (!localStorage.getItem('token')) throw new Error();
      const response = await api.get('/auth/me');
      set({ user: response.data.user, loading: false });
    } catch {
      localStorage.removeItem('token');
      set({ user: null, token: null, loading: false });
    }
  }
}));
