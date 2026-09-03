import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  loginRequest,
  registerRequest,
  googleLoginRequest,
  getAuthConfigRequest,
  getProfileRequest,
  updateProfileRequest,
} from '../api/auth';


interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  googleClientId: string;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone_number?: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateProfile: (data: { name?: string; phone_number?: string | null; theme?: string }) => Promise<void>;
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
  const [googleClientId, setGoogleClientId] = useState<string>(
    import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
  );

  useEffect(() => {
    // Busca clientId em runtime caso não tenha sido embutido no build
    async function loadConfig() {
      try {
        const config = await getAuthConfigRequest();
        if (config.googleClientId) {
          setGoogleClientId(config.googleClientId);
        }
      } catch (err) {
        // Ignora caso API esteja inacessível no momento
      }
    }
    loadConfig();

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

  const loginWithGoogle = async (idToken: string) => {
    const response = await googleLoginRequest(idToken);
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

  const updateProfile = async (data: { name?: string; phone_number?: string | null; theme?: string }) => {
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
        googleClientId,
        login,
        register,
        loginWithGoogle,
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
