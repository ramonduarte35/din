import { prisma } from '../../lib/prisma.js';
import {
  CreateAffiliateBannerInput,
  UpdateAffiliateBannerInput,
  QueryAffiliateBannersInput,
} from './admin.affiliates.schemas.js';

export class AdminAffiliatesService {
  /**
   * Lista todos os banners no painel administrativo com cálculo de métricas de conversão
   */
  async listAdminBanners(query?: QueryAffiliateBannersInput) {
    const where: any = {};

    if (query?.placement && query.placement !== 'ALL') {
      where.placement = query.placement;
    }

    if (query?.is_active && query.is_active !== 'ALL') {
      where.is_active = query.is_active === 'TRUE';
    }

    const banners = await prisma.affiliateBanner.findMany({
      where,
      orderBy: [{ display_order: 'asc' }, { created_at: 'desc' }],
    });

    const bannersWithMetrics = banners.map((b: any) => {
      const ctr = b.views_count > 0 ? Number(((b.clicks_count / b.views_count) * 100).toFixed(2)) : 0;
      return {
        ...b,
        ctr_percent: ctr,
      };
    });

    const totalViews = banners.reduce((acc: number, b: any) => acc + b.views_count, 0);
    const totalClicks = banners.reduce((acc: number, b: any) => acc + b.clicks_count, 0);
    const overallCtr = totalViews > 0 ? Number(((totalClicks / totalViews) * 100).toFixed(2)) : 0;

    return {
      banners: bannersWithMetrics,
      metrics: {
        total_banners: banners.length,
        active_banners: banners.filter((b: any) => b.is_active).length,
        total_views: totalViews,
        total_clicks: totalClicks,
        overall_ctr: overallCtr,
      },
    };
  }

  /**
   * Retorna os banners ativos para exibição no aplicativo.
   * IMPORTANTE: Assinantes do plano PRO NUNCA recebem banners.
   */
  async getActiveBanners(userTier: string, placement?: string) {
    if (userTier === 'PRO') {
      return [];
    }

    const where: any = {
      is_active: true,
    };

    if (placement && placement !== 'GLOBAL') {
      where.OR = [{ placement }, { placement: 'GLOBAL' }];
    }

    const banners = await prisma.affiliateBanner.findMany({
      where,
      orderBy: [{ display_order: 'asc' }, { created_at: 'desc' }],
    });

    // Incrementar visualizações em lote de forma assíncrona (sem travar o response)
    if (banners.length > 0) {
      const ids = banners.map((b: any) => b.id);
      prisma.affiliateBanner
        .updateMany({
          where: { id: { in: ids } },
          data: { views_count: { increment: 1 } },
        })
        .catch((err: any) => console.warn('⚠️ [Affiliates] Falha ao registrar views:', err));
    }

    return banners;
  }

  /**
   * Cria um novo banner de afiliado
   */
  async createBanner(data: CreateAffiliateBannerInput) {
    return await prisma.affiliateBanner.create({
      data: {
        title: data.title,
        description: data.description || null,
        image_url: data.image_url || null,
        badge_text: data.badge_text || null,
        cta_text: data.cta_text || 'Saiba Mais',
        target_url: data.target_url,
        placement: data.placement || 'DASHBOARD',
        is_active: data.is_active ?? true,
        display_order: data.display_order ?? 0,
      },
    });
  }

  /**
   * Atualiza um banner existente
   */
  async updateBanner(id: string, data: UpdateAffiliateBannerInput) {
    const existing = await prisma.affiliateBanner.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Banner não encontrado.');
    }

    return await prisma.affiliateBanner.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description || null }),
        ...(data.image_url !== undefined && { image_url: data.image_url || null }),
        ...(data.badge_text !== undefined && { badge_text: data.badge_text || null }),
        ...(data.cta_text !== undefined && { cta_text: data.cta_text }),
        ...(data.target_url !== undefined && { target_url: data.target_url }),
        ...(data.placement !== undefined && { placement: data.placement }),
        ...(data.is_active !== undefined && { is_active: data.is_active }),
        ...(data.display_order !== undefined && { display_order: data.display_order }),
      },
    });
  }

  /**
   * Alterna o status ativo/inativo de um banner
   */
  async toggleBanner(id: string) {
    const existing = await prisma.affiliateBanner.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Banner não encontrado.');
    }

    return await prisma.affiliateBanner.update({
      where: { id },
      data: { is_active: !existing.is_active },
    });
  }

  /**
   * Remove um banner
   */
  async deleteBanner(id: string) {
    const existing = await prisma.affiliateBanner.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Banner não encontrado.');
    }

    return await prisma.affiliateBanner.delete({
      where: { id },
    });
  }

  /**
   * Registra um clique no banner de forma atômica
   */
  async recordClick(id: string) {
    const banner = await prisma.affiliateBanner.findUnique({ where: { id } });
    if (!banner) {
      throw new Error('Banner não encontrado.');
    }

    return await prisma.affiliateBanner.update({
      where: { id },
      data: { clicks_count: { increment: 1 } },
      select: { id: true, target_url: true, clicks_count: true },
    });
  }
}

export const adminAffiliatesService = new AdminAffiliatesService();
