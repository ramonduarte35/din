import { FastifyRequest, FastifyReply } from 'fastify';
import { adminAffiliatesService } from './admin.affiliates.service.js';
import {
  createAffiliateBannerSchema,
  updateAffiliateBannerSchema,
  queryAffiliateBannersSchema,
} from './admin.affiliates.schemas.js';

export class AdminAffiliatesController {
  /**
   * GET /api/v1/admin/affiliates
   */
  async getAdminBanners(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = queryAffiliateBannersSchema.parse(request.query);
      const result = await adminAffiliatesService.listAdminBanners(query);
      return reply.send(result);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message || 'Erro ao listar banners' });
    }
  }

  /**
   * POST /api/v1/admin/affiliates
   */
  async createBanner(request: FastifyRequest, reply: FastifyReply) {
    try {
      const input = createAffiliateBannerSchema.parse(request.body);
      const banner = await adminAffiliatesService.createBanner(input);
      return reply.status(201).send({ message: 'Banner criado com sucesso', banner });
    } catch (error: any) {
      return reply.status(400).send({ error: error.message || 'Erro ao criar banner' });
    }
  }

  /**
   * PUT /api/v1/admin/affiliates/:id
   */
  async updateBanner(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const { id } = request.params;
      const input = updateAffiliateBannerSchema.parse(request.body);
      const banner = await adminAffiliatesService.updateBanner(id, input);
      return reply.send({ message: 'Banner atualizado com sucesso', banner });
    } catch (error: any) {
      return reply.status(400).send({ error: error.message || 'Erro ao atualizar banner' });
    }
  }

  /**
   * PATCH /api/v1/admin/affiliates/:id/toggle
   */
  async toggleBanner(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const { id } = request.params;
      const banner = await adminAffiliatesService.toggleBanner(id);
      return reply.send({ message: `Banner ${banner.is_active ? 'ativado' : 'desativado'} com sucesso`, banner });
    } catch (error: any) {
      return reply.status(400).send({ error: error.message || 'Erro ao alterar status do banner' });
    }
  }

  /**
   * DELETE /api/v1/admin/affiliates/:id
   */
  async deleteBanner(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const { id } = request.params;
      await adminAffiliatesService.deleteBanner(id);
      return reply.send({ message: 'Banner removido com sucesso' });
    } catch (error: any) {
      return reply.status(400).send({ error: error.message || 'Erro ao remover banner' });
    }
  }

  /**
   * GET /api/v1/affiliates/active
   * Rota para obter banners no app (retorna [] para PRO)
   */
  async getActiveBanners(request: FastifyRequest<{ Querystring: { placement?: string } }>, reply: FastifyReply) {
    try {
      const user = request.user as any;
      const userTier = user?.subscription_tier || 'FREE';
      const { placement } = request.query;

      const banners = await adminAffiliatesService.getActiveBanners(userTier, placement);
      return reply.send({ banners });
    } catch (error: any) {
      return reply.status(400).send({ error: error.message || 'Erro ao obter banners' });
    }
  }

  /**
   * POST /api/v1/affiliates/:id/click
   * Rota para registrar métrica de clique
   */
  async recordClick(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const { id } = request.params;
      const result = await adminAffiliatesService.recordClick(id);
      return reply.send(result);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message || 'Erro ao registrar clique' });
    }
  }
}

export const adminAffiliatesController = new AdminAffiliatesController();
