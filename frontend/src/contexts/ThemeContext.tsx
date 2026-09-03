import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export type ThemeId = 'dark' | 'rose' | 'light' | 'purple';

export interface ThemeOption {
  id: ThemeId;
  name: string;
  description: string;
  badge?: string;
  accentColor: string;
  preview: {
    bg: string;
    card: string;
    accent: string;
    secondary: string;
  };
}

export const AVAILABLE_THEMES: ThemeOption[] = [
  {
    id: 'dark',
    name: 'Escuro Padrão',
    description: 'Verde Esmeralda & Deep Navy/Slate',
    badge: 'Padrão Din',
    accentColor: '#10b981',
    preview: {
      bg: '#080d1a',
      card: '#0f172a',
      accent: '#10b981',
      secondary: '#14b8a6',
    },
  },
  {
    id: 'rose',
    name: 'Rosa Glamour',
    description: 'Sunset Rose & Pink Velvet',
    badge: 'Elegante',
    accentColor: '#f43f5e',
    preview: {
      bg: '#0f0714',
      card: '#190d24',
      accent: '#f43f5e',
      secondary: '#ec4899',
    },
  },
  {
    id: 'purple',
    name: 'Roxo Neon',
    description: 'Cyber Violet & Mystic Purple',
    badge: 'Futurista',
    accentColor: '#8b5cf6',
    preview: {
      bg: '#090616',
      card: '#130c29',
      accent: '#8b5cf6',
      secondary: '#a855f7',
    },
  },
  {
    id: 'light',
    name: 'Branco Clean',
    description: 'Branco Pérola & Modern Slate',
    badge: 'Claro & Nítido',
    accentColor: '#059669',
    preview: {
      bg: '#f8fafc',
      card: '#ffffff',
      accent: '#059669',
      secondary: '#0284c7',
    },
  },
];

interface ThemeContextType {
  theme: ThemeId;
  setTheme: (newTheme: ThemeId, syncBackend?: boolean) => Promise<void>;
  themes: ThemeOption[];
  currentThemeConfig: ThemeOption;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user, updateProfile } = useAuth();

  const [theme, setThemeState] = useState<ThemeId>(() => {
    const savedTheme = localStorage.getItem('@din:theme') as ThemeId | null;
    if (savedTheme && ['dark', 'rose', 'light', 'purple'].includes(savedTheme)) {
      return savedTheme;
    }
    return 'dark';
  });

  // Aplica o tema na tag <html> e controla a classe .dark
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);

    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }

    localStorage.setItem('@din:theme', theme);
  }, [theme]);

  // Sincroniza com o tema salvo no perfil do usuário ao carregar
  useEffect(() => {
    if (user?.theme && ['dark', 'rose', 'light', 'purple'].includes(user.theme)) {
      const userTheme = user.theme as ThemeId;
      if (userTheme !== theme) {
        setThemeState(userTheme);
      }
    }
  }, [user?.theme]);

  const setTheme = async (newTheme: ThemeId, syncBackend: boolean = true) => {
    setThemeState(newTheme);
    localStorage.setItem('@din:theme', newTheme);

    // Se usuário estiver autenticado e optou por sincronizar, envia ao backend
    if (syncBackend && user && user.theme !== newTheme) {
      try {
        await updateProfile({ theme: newTheme });
      } catch (err) {
        console.error('Falha ao sincronizar tema com a conta:', err);
      }
    }
  };

  const currentThemeConfig =
    AVAILABLE_THEMES.find((t) => t.id === theme) || AVAILABLE_THEMES[0];

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        themes: AVAILABLE_THEMES,
        currentThemeConfig,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser utilizado dentro de um ThemeProvider');
  }
  return context;
}
