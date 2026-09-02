import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { formatCurrency } from '../lib/utils';

interface PrivacyContextData {
  isPrivate: boolean;
  togglePrivacy: () => void;
  maskValue: (value: number | string, formattedFallback?: string) => string;
}

const PrivacyContext = createContext<PrivacyContextData>({} as PrivacyContextData);

const STORAGE_KEY = 'din_privacy_mode';

export const PrivacyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isPrivate, setIsPrivate] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(isPrivate));
    } catch (e) {
      console.error('Falha ao salvar preferência de privacidade no localStorage:', e);
    }
  }, [isPrivate]);

  const togglePrivacy = useCallback(() => {
    setIsPrivate((prev) => !prev);
  }, []);

  const maskValue = useCallback(
    (value: number | string, formattedFallback?: string): string => {
      if (isPrivate) {
        return '••••••';
      }
      if (typeof value === 'number') {
        return formatCurrency(value);
      }
      return formattedFallback || String(value);
    },
    [isPrivate]
  );

  return (
    <PrivacyContext.Provider value={{ isPrivate, togglePrivacy, maskValue }}>
      {children}
    </PrivacyContext.Provider>
  );
};

export function usePrivacy() {
  const context = useContext(PrivacyContext);
  if (!context) {
    throw new Error('usePrivacy deve ser utilizado dentro de um PrivacyProvider');
  }
  return context;
}
