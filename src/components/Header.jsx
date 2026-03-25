import './Header.css';
import { useAuth } from '../auth/AuthContext';

export const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="header glass-panel">
      <div className="logo">
        <div className="logo-icon"></div>
        <h1 className="text-gradient">Finance Tracker</h1>
      </div>
      <div className="user-profile">
        <div className="avatar" aria-hidden="true">
          {(user?.email || '?').slice(0, 1).toUpperCase()}
        </div>
        <div className="user-meta">
          <div className="user-email">{user?.email || ''}</div>
          <button className="logout-btn" type="button" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};
