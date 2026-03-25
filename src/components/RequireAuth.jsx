import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function RequireAuth({ children }) {
  const { user, authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="app-container" style={{ paddingTop: '4rem' }}>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          Loading...
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return children;
}

