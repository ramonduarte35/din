import { FastifyInstance } from 'fastify';
import { adminAffiliatesController } from './admin.affiliates.controller.js';
import { requireAdmin, authenticate } from '../../middleware/auth.middleware.js';

export async function adminAffiliatesRoutes(app: FastifyInstance) {
  // Rotas administrativas exigem Role ADMIN
  app.addHook('preHandler', requireAdmin);

  // Listagem com métricas e filtros
  app.get('/', adminAffiliatesController.getAdminBanners);

  // Criar novo banner
  app.post('/', adminAffiliatesController.createBanner);

  // Atualizar banner
  app.put('/:id', adminAffiliatesController.updateBanner);

  // Alternar status ativo/inativo
  app.patch('/:id/toggle', adminAffiliatesController.toggleBanner);

  // Deletar banner
  app.delete('/:id', adminAffiliatesController.deleteBanner);
}

export async function affiliatesRoutes(app: FastifyInstance) {
  // Rotas autenticadas do cliente (usuários FREE recebem banners, PRO recebem lista vazia)
  app.addHook('preHandler', authenticate);

  // Buscar banners ativos para a tela atual
  app.get('/active', adminAffiliatesController.getActiveBanners);

  // Registrar clique em um banner
  app.post('/:id/click', adminAffiliatesController.recordClick);
}
