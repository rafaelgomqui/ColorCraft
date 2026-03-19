import { createContext, useContext } from 'react';
import { User, LoginFormData, RegisterFormData } from '../types/auth';

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginFormData) => Promise<void>;
  register: (userData: RegisterFormData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => { throw new Error('AuthContext must be used within an AuthProvider'); },
  register: async () => { throw new Error('AuthContext must be used within an AuthProvider'); },
  logout: () => { throw new Error('AuthContext must be used within an AuthProvider'); },
  isAuthenticated: false,
});

export const useAuth = (): AuthContextType => {
  return useContext(AuthContext);
};