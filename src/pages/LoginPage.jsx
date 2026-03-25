import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import './auth.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card glass-panel">
        <div className="auth-title">
          <div className="auth-logo-icon" />
          <div>
            <h1 className="text-gradient">Finance Tracker</h1>
            <p className="auth-subtitle">Sign in to sync your transactions.</p>
          </div>
        </div>

        <form className="auth-form" onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {error ? <div className="auth-error">{error}</div> : null}

          <button className="submit-btn" disabled={loading} type="submit">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="auth-footer">
            <span>New here?</span>
            <Link to="/register">Create an account</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

