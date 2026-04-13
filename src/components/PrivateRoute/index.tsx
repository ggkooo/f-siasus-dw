import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { type ReactNode } from 'react';

export default function PrivateRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-sm text-gray-500">
        Validando sessão...
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}
