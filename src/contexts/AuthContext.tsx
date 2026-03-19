import React, { useState, useEffect, ReactNode } from 'react';
import { User, LoginFormData, RegisterFormData } from '../types/auth';
import { authService } from '../services/authService';
import { AuthContext, AuthContextType } from './authHelpers.ts';

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    if (authService.isAuthenticated()) {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (_error) {
        authService.logout();
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    const initializeAuth = async () => {
      await checkAuth();
    };
    
    initializeAuth();
  }, []);

  const login = async (credentials: LoginFormData) => {
    const response = await authService.login(credentials);
    if (response.user) {
      setUser(response.user);
    }
  };

  const register = async (userData: RegisterFormData) => {
    await authService.register(userData);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;