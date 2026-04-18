import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../services/api';
import type { AuthResponse } from '../types/api';

interface AuthCtx {
  user: AuthResponse | null;
  loading: boolean;
  login:    (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  logout:   () => Promise<void>;
}

const AuthContext = createContext<AuthCtx>({} as AuthCtx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<AuthResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem('user');
      if (stored) setUser(JSON.parse(stored));
      setLoading(false);
    })();
  }, []);

  const persist = async (auth: AuthResponse) => {
    await AsyncStorage.setItem('token', auth.token);
    await AsyncStorage.setItem('user', JSON.stringify(auth));
    setUser(auth);
  };

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    await persist(res.data.data);
  };

  const register = async (firstName: string, lastName: string, email: string, password: string) => {
    const res = await authApi.register(firstName, lastName, email, password);
    await persist(res.data.data);
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['token', 'user']);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
