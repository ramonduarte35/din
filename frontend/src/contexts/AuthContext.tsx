import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, loginRequest, registerRequest, getProfileRequest, updateProfileRequest } from '../api/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone_number?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateProfile: (data: { name?: string; phone_number?: string | null }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('@din:user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('@din:token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem('@din:token');
      if (storedToken) {
        try {
          const { user: profile } = await getProfileRequest();
          setUser(profile);
          localStorage.setItem('@din:user', JSON.stringify(profile));
        } catch (error) {
          console.error('Falha ao restaurar sessão:', error);
          logout();
        }
      }
      setIsLoading(false);
    }
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await loginRequest({ email, password });
    setToken(response.token);
    setUser(response.user);
    localStorage.setItem('@din:token', response.token);
    localStorage.setItem('@din:user', JSON.stringify(response.user));
  };

  const register = async (name: string, email: string, password: string, phone_number?: string) => {
    const response = await registerRequest({ name, email, password, phone_number });
    setToken(response.token);
    setUser(response.user);
    localStorage.setItem('@din:token', response.token);
    localStorage.setItem('@din:user', JSON.stringify(response.user));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('@din:token');
    localStorage.removeItem('@din:user');
  };

  const refreshUser = async () => {
    try {
      const { user: profile } = await getProfileRequest();
      setUser(profile);
      localStorage.setItem('@din:user', JSON.stringify(profile));
    } catch (error) {
      console.error('Erro ao recarregar perfil:', error);
    }
  };

  const updateProfile = async (data: { name?: string; phone_number?: string | null }) => {
    const res = await updateProfileRequest(data);
    setUser(res.user);
    localStorage.setItem('@din:user', JSON.stringify(res.user));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
}
