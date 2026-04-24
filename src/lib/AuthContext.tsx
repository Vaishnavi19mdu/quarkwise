import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { pb } from './pocketbase';

interface AuthContextType {
  user: any;
  isAdmin: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(pb.authStore.record);

  useEffect(() => {
    const unsub = pb.authStore.onChange((_token, record) => {
      setUser(record);
    });
    return () => unsub();
  }, []);

  const logout = () => {
    pb.authStore.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin: user?.role === 'admin', logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};