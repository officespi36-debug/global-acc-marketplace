import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('accglobal_token') || '');
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      if (!localStorage.getItem('accglobal_token')) {
        // Auto initialize as Demo Buyer on first visit for zero-friction testing!
        await switchDemo('buyer');
        return;
      }
      const data = await api.getMe();
      if (data.success) {
        setUser(data.user);
      }
    } catch (err) {
      console.warn('Auth check error, falling back to buyer demo:', err.message);
      await switchDemo('buyer');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    if (data.success) {
      localStorage.setItem('accglobal_token', data.token);
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const register = async (name, email, password, role) => {
    const data = await api.register(name, email, password, role);
    if (data.success) {
      localStorage.setItem('accglobal_token', data.token);
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  // 1-Click Demo Switcher
  const switchDemo = async (role) => {
    setLoading(true);
    try {
      const data = await api.demoLogin(role);
      if (data.success) {
        localStorage.setItem('accglobal_token', data.token);
        setToken(data.token);
        setUser(data.user);
      }
    } catch (err) {
      console.error('Demo login failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('accglobal_token');
    setToken('');
    setUser(null);
    // Re-login as buyer for seamless preview
    switchDemo('buyer');
  };

  const refreshUser = async () => {
    try {
      const data = await api.getMe();
      if (data.success) setUser(data.user);
    } catch (e) {
      // ignore
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      switchDemo,
      logout,
      refreshUser,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      isSeller: user?.role === 'seller' || user?.role === 'admin',
      isBuyer: user?.role === 'buyer'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
