import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

interface AuthState {
  isAuthenticated?: boolean;
  loading?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const auth = useAuth() as AuthState | undefined;
  const isAuthenticated = auth?.isAuthenticated ?? false;
  const loading = auth?.loading ?? false;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 via-pink-400 to-blue-500">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;