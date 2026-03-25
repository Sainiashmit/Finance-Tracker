/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('auth-token');
    } catch {
      return null;
    }
  });
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadMe() {
      if (!token) {
        setUser(null);
        setAuthLoading(false);
        return;
      }

      try {
        // While we validate the token, keep the auth gate in "loading"
        // to avoid redirecting back to `/login` during the short gap.
        setAuthLoading(true);

        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Invalid token');
        const data = await res.json();
        if (!cancelled) setUser(data.user);
      } catch {
        try {
          localStorage.removeItem('auth-token');
        } catch {
          // ignore
        }
        if (!cancelled) setUser(null);
        setToken(null);
      } finally {
        if (!cancelled) setAuthLoading(false);
      }
    }

    loadMe();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = useCallback(async (email, password) => {
    setAuthLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const msg = await res.json().catch(() => ({}));
        throw new Error(msg.error || 'Login failed');
      }

      const data = await res.json();
      setToken(data.token);
      setUser(null);
      try {
        localStorage.setItem('auth-token', data.token);
      } catch {
        // ignore
      }
      return data;
    } catch (e) {
      setAuthLoading(false);
      throw e;
    }
  }, []);

  const register = useCallback(async (email, password) => {
    setAuthLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const msg = await res.json().catch(() => ({}));
        throw new Error(msg.error || 'Register failed');
      }

      const data = await res.json();
      setToken(data.token);
      setUser(null);
      try {
        localStorage.setItem('auth-token', data.token);
      } catch {
        // ignore
      }
      return data;
    } catch (e) {
      setAuthLoading(false);
      throw e;
    }
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem('auth-token');
    } catch {
      // ignore
    }
    setToken(null);
    setUser(null);
    setAuthLoading(false);
    navigate('/login', { replace: true });
  }, [navigate]);

  const value = useMemo(
    () => ({
      token,
      user,
      authLoading,
      login,
      register,
      logout,
      isAuthed: Boolean(user),
    }),
    [token, user, authLoading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

