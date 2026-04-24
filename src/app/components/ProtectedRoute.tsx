import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
          <p className="text-indigo-300 text-sm">Loading TIma...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user is logged in but hasn't set a PIN, redirect to set-pin
  // (unless they are already on the set-pin page)
  if (profile && !profile.has_pin && window.location.pathname !== '/set-pin' && !window.location.pathname.includes('/set-pin')) {
    return <Navigate to="/set-pin" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
