import React, { useEffect, useState } from 'react';
import { ExternalLink, Sparkles, Tag, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  AffiliateBanner,
  fetchActiveAffiliateBanners,
  recordAffiliateBannerClick,
} from '../../api/affiliates';

interface AffiliateBannerCardProps {
  placement?: 'DASHBOARD' | 'TRANSACTIONS' | 'BILLS' | 'GLOBAL';
  className?: string;
  onLoaded?: (hasBanner: boolean) => void;
}

export const AffiliateBannerCard: React.FC<AffiliateBannerCardProps> = ({
  placement = 'DASHBOARD',
  className = '',
  onLoaded,
}) => {
  const { user } = useAuth();
  const [banners, setBanners] = useState<AffiliateBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Assinantes PRO NUNCA veem banners de afiliados nem anúncios
  if (user?.subscription_tier === 'PRO') {
    return null;
  }

  useEffect(() => {
    let isMounted = true;

    async function loadBanners() {
      try {
        const data = await fetchActiveAffiliateBanners(placement);
        if (isMounted) {
          setBanners(data);
          onLoaded?.(data.length > 0);
        }
      } catch (err) {
        console.warn('[AffiliateBanner] Erro ao carregar banner:', err);
        if (isMounted) onLoaded?.(false);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadBanners();

    return () => {
      isMounted = false;
    };
  }, [placement]);

  if (isLoading || banners.length === 0) {
    return null;
  }

  // Se houver mais de um banner ativo para esta posição, escolhemos o primeiro ou por ordem
  const banner = banners[0];

  const handleClick = () => {
    recordAffiliateBannerClick(banner.id);
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/30 via-card/80 to-card/90 p-4 shadow-sm backdrop-blur-sm transition-all hover:border-emerald-500/40 ${className}`}
    >
      {/* Selo superior discreto de recomendação */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5">
          <span className="flex h-5 items-center gap-1 rounded-md bg-emerald-500/15 px-2 text-[10px] font-semibold text-emerald-400">
            <Sparkles className="h-3 w-3" />
            {banner.badge_text || 'Parceiro Recomendado'}
          </span>
          <span className="text-[10px] font-medium text-din-muted/70">
            Oferta Especial
          </span>
        </div>

        <span className="text-[9px] uppercase tracking-wider text-din-muted/50">
          Patrocinado
        </span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Lado Esquerdo: Imagem + Conteúdo */}
        <div className="flex items-start gap-3">
          {banner.image_url ? (
            <img
              src={banner.image_url}
              alt={banner.title}
              className="h-11 w-11 shrink-0 rounded-xl object-cover border border-border/60 bg-card"
              onError={(e) => {
                // Fallback se a imagem falhar
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Tag className="h-5 w-5" />
            </div>
          )}

          <div className="flex flex-col">
            <h4 className="text-sm font-semibold text-foreground leading-tight">
              {banner.title}
            </h4>
            {banner.description && (
              <p className="mt-1 text-xs text-din-muted leading-relaxed line-clamp-2">
                {banner.description}
              </p>
            )}
          </div>
        </div>

        {/* Lado Direito: Botão CTA com Touch Target mínimo de 44px */}
        <a
          href={banner.target_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 text-xs font-semibold text-white shadow-md shadow-emerald-500/20 transition-all hover:bg-emerald-600 active:scale-95 sm:self-center"
        >
          <span>{banner.cta_text || 'Acessar Oferta'}</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
};
