import { FastifyInstance } from 'fastify';
import { adminWhatsAppController } from './admin.whatsapp.controller.js';
import { requireAdmin } from '../../middleware/auth.middleware.js';

export async function adminWhatsAppRoutes(app: FastifyInstance) {
  // Apply requireAdmin to all admin WhatsApp routes
  app.addHook('preHandler', requireAdmin);

  // Instâncias
  app.get('/instances', adminWhatsAppController.listInstances);
  app.post('/instances', adminWhatsAppController.createInstance);
  app.get('/instances/:id/qrcode', adminWhatsAppController.getQrCode);
  app.get('/instances/:id/status', adminWhatsAppController.getInstanceStatus);
  app.post('/instances/:id/restart', adminWhatsAppController.restartInstance);
  app.post('/instances/:id/logout', adminWhatsAppController.logoutInstance);
  app.patch('/instances/:id', adminWhatsAppController.updateInstance);
  app.delete('/instances/:id', adminWhatsAppController.deleteInstance);

  // Logs
  app.get('/logs', adminWhatsAppController.getLogs);

  // Evolution Go Gateway & License
  app.get('/evolution/status', adminWhatsAppController.getEvolutionStatus);
  app.get('/evolution/license', adminWhatsAppController.getEvolutionLicense);
  app.post('/evolution/test', adminWhatsAppController.testEvolutionConnection);
}

