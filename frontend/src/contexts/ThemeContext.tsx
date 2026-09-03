import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export type ThemeId =
  | 'dark'
  | 'classic'
  | 'emerald'
  | 'midnight'
  | 'minimalist'
  | 'rose'
  | 'purple'
  | 'light';

export interface ThemeOption {
  id: ThemeId;
  name: string;
  description: string;
  badge?: string;
  accentColor: string;
  mode: 'dark' | 'light';
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
    description: 'Verde Esmeralda & Deep Navy (Padrão)',
    badge: 'Padrão',
    accentColor: '#10b981',
    mode: 'dark',
    preview: {
      bg: '#080d1a',
      card: '#0f172a',
      accent: '#10b981',
      secondary: '#14b8a6',
    },
  },
  {
    id: 'classic',
    name: 'Smart Classic',
    description: 'Azul Executivo & Fundo Claro',
    badge: 'Executivo',
    accentColor: '#1E40AF',
    mode: 'light',
    preview: {
      bg: '#F8FAFC',
      card: '#FFFFFF',
      accent: '#1E40AF',
      secondary: '#3B82F6',
    },
  },
  {
    id: 'emerald',
    name: 'Emerald Growth',
    description: 'Verde Esmeralda Fresco & Superfície Clara',
    badge: 'Crescimento',
    accentColor: '#047857',
    mode: 'light',
    preview: {
      bg: '#F2F7F4',
      card: '#FFFFFF',
      accent: '#047857',
      secondary: '#10B981',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight Executive',
    description: 'Ciano Cyber & Índigo Noturno Profundo',
    badge: 'Cyber Dark',
    accentColor: '#38BDF8',
    mode: 'dark',
    preview: {
      bg: '#0B0F19',
      card: '#1E293B',
      accent: '#38BDF8',
      secondary: '#818CF8',
    },
  },
  {
    id: 'minimalist',
    name: 'Monochrome Minimalist',
    description: 'Monocromático Sofisticado & Detalhes Âmbar',
    badge: 'Minimalista',
    accentColor: '#18181B',
    mode: 'light',
    preview: {
      bg: '#FAFAFA',
      card: '#FFFFFF',
      accent: '#18181B',
      secondary: '#D97706',
    },
  },
  {
    id: 'rose',
    name: 'Rosa Glamour',
    description: 'Sunset Rose & Velvet Berry',
    badge: 'Elegante',
    accentColor: '#f43f5e',
    mode: 'dark',
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
    mode: 'dark',
    preview: {
      bg: '#090616',
      card: '#130c29',
      accent: '#8b5cf6',
      secondary: '#a855f7',
    },
  },
];

const VALID_THEME_IDS: ThemeId[] = [
  'dark',
  'classic',
  'emerald',
  'midnight',
  'minimalist',
  'rose',
  'purple',
  'light',
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
    if (savedTheme && VALID_THEME_IDS.includes(savedTheme)) {
      return savedTheme;
    }
    return 'dark';
  });

  // Aplica o tema na tag <html> e controla a classe .dark / .light
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);

    const isLightMode = ['classic', 'emerald', 'minimalist', 'light'].includes(theme);

    if (isLightMode) {
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
    if (user?.theme && VALID_THEME_IDS.includes(user.theme as ThemeId)) {
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
