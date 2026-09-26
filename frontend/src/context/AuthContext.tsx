import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { farmerApi, type Farmer } from '../lib/api';

interface AuthContextValue {
  farmer: Farmer | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  role: 'farmer' | 'officer' | null;
  login: (phone: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [role] = useState<'farmer' | 'officer' | null>('farmer');

  // Restore session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('kf_token');
    const savedFarmer = localStorage.getItem('kf_farmer');
    if (savedToken && savedFarmer) {
      setToken(savedToken);
      setFarmer(JSON.parse(savedFarmer));
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (phone: string) => {
    const res = await farmerApi.login({ phone });
    const { token: t, farmer: f } = res.data.data;
    localStorage.setItem('kf_token', t);
    localStorage.setItem('kf_farmer', JSON.stringify(f));
    setToken(t);
    setFarmer(f);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('kf_token');
    localStorage.removeItem('kf_farmer');
    setToken(null);
    setFarmer(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        farmer,
        token,
        isLoading,
        isAuthenticated: !!token,
        role,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
