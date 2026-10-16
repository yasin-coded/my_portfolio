import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export function ProtectedRoute({ children }) {
  const { isOwner, loading } = useAuth();
  const location = useLocation();

  // Prevent UI flash while checking session (SPEC F-2)
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg text-text p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
          <p className="font-mono text-sm text-text-muted">
            $ verifying_credentials...
          </p>
        </div>
      </div>
    );
  }

  // Not logged in or not superuser -> redirect to /login and remember target (SPEC F-3)
  if (!isOwner) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
}

export default ProtectedRoute;
