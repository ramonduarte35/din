"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminWhatsAppRoutes = adminWhatsAppRoutes;
const admin_whatsapp_controller_js_1 = require("./admin.whatsapp.controller.js");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
async function adminWhatsAppRoutes(app) {
    // Apply requireAdmin to all admin WhatsApp routes
    app.addHook('preHandler', auth_middleware_js_1.requireAdmin);
    // Instâncias
    app.get('/instances', admin_whatsapp_controller_js_1.adminWhatsAppController.listInstances);
    app.post('/instances', admin_whatsapp_controller_js_1.adminWhatsAppController.createInstance);
    app.get('/instances/:id/qrcode', admin_whatsapp_controller_js_1.adminWhatsAppController.getQrCode);
    app.get('/instances/:id/status', admin_whatsapp_controller_js_1.adminWhatsAppController.getInstanceStatus);
    app.post('/instances/:id/restart', admin_whatsapp_controller_js_1.adminWhatsAppController.restartInstance);
    app.post('/instances/:id/logout', admin_whatsapp_controller_js_1.adminWhatsAppController.logoutInstance);
    app.patch('/instances/:id', admin_whatsapp_controller_js_1.adminWhatsAppController.updateInstance);
    app.delete('/instances/:id', admin_whatsapp_controller_js_1.adminWhatsAppController.deleteInstance);
    // Logs
    app.get('/logs', admin_whatsapp_controller_js_1.adminWhatsAppController.getLogs);
    // Evolution Go Gateway & License
    app.get('/evolution/status', admin_whatsapp_controller_js_1.adminWhatsAppController.getEvolutionStatus);
    app.get('/evolution/license', admin_whatsapp_controller_js_1.adminWhatsAppController.getEvolutionLicense);
    app.post('/evolution/test', admin_whatsapp_controller_js_1.adminWhatsAppController.testEvolutionConnection);
    app.post('/evolution/activate', admin_whatsapp_controller_js_1.adminWhatsAppController.activateEvolutionLicense);
}
