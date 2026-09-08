import React, { useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface AdSenseBannerProps {
  slotId?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'in-feed';
  className?: string;
  style?: React.CSSProperties;
}

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

export const AdSenseBanner: React.FC<AdSenseBannerProps> = ({
  slotId,
  format = 'auto',
  className = '',
  style,
}) => {
  const { user } = useAuth();
  const adRef = useRef<HTMLModElement | null>(null);
  const isLoaded = useRef(false);

  const clientId = import.meta.env.VITE_ADSENSE_CLIENT_ID || 'ca-pub-0000000000000000';
  const isProduction = import.meta.env.PROD && !clientId.includes('0000000000000000');

  // Em produção com AdSense ativo, assinantes PRO navegam 100% livres de anúncios
  if (isProduction && user?.subscription_tier === 'PRO') {
    return null;
  }

  useEffect(() => {
    if (!isProduction) return;

    try {
      if (adRef.current && !isLoaded.current) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        isLoaded.current = true;
      }
    } catch (err) {
      console.warn('[AdSense] Falha ao carregar bloco de anúncio:', err);
    }
  }, [isProduction]);

  // Se não estiver em produção ou clientId for de teste, renderiza placeholder sutil no ambiente de desenvolvimento
  if (!isProduction) {
    return (
      <div
        className={`my-3 p-3 rounded-2xl border border-dashed border-border/80 bg-card/40 backdrop-blur-sm flex flex-col items-center justify-center text-center transition-all ${className}`}
        style={style}
      >
        <span className="text-[10px] uppercase font-bold tracking-widest text-din-muted/70 mb-1">
          Espaço Patrocinado • Google AdSense
        </span>
        <div className="flex items-center gap-2 text-xs text-din-muted">
          <span className="w-2 h-2 rounded-full bg-emerald-500/60 animate-pulse" />
          <span>Anúncio sutil nativo ({format})</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`my-3 overflow-hidden rounded-2xl bg-card/30 text-center ${className}`} style={style}>
      <div className="text-[9px] uppercase font-semibold tracking-wider text-din-muted/60 py-1">
        Publicidade
      </div>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', ...(style || {}) }}
        data-ad-client={clientId}
        data-ad-slot={slotId || '1234567890'}
        data-ad-format={format === 'in-feed' ? 'fluid' : format}
        data-full-width-responsive="true"
      />
    </div>
  );
};
