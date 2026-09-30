import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('sampark_token'));
  const [loading, setLoading] = useState(true);

  // Restore session
  useEffect(() => {
    async function checkAuth() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          logout();
        }
      } catch (err) {
        console.warn('Auth verification error:', err);
        // Fallback for offline demo
        const storedUser = localStorage.getItem('sampark_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [token]);

  const requestOtp = async (phone, language = 'hi', channel = 'sms') => {
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, language, channel })
    });
    return await res.json();
  };

  const loginWithOtp = async (phone, otp, language = 'hi', name = '') => {
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp, language, name })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('sampark_token', data.token);
      localStorage.setItem('sampark_user', JSON.stringify(data.user));
      return { success: true };
    }
    return { success: false, error: data.error || 'Login failed' };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('sampark_token');
    localStorage.removeItem('sampark_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, requestOtp, loginWithOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
