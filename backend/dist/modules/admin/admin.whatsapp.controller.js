"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminWhatsAppController = exports.AdminWhatsAppController = void 0;
const admin_whatsapp_service_js_1 = require("./admin.whatsapp.service.js");
const admin_whatsapp_schemas_js_1 = require("./admin.whatsapp.schemas.js");
class AdminWhatsAppController {
    async listInstances(request, reply) {
        const instances = await admin_whatsapp_service_js_1.adminWhatsAppService.listInstances();
        return reply.status(200).send({ instances });
    }
    async createInstance(request, reply) {
        const parsed = admin_whatsapp_schemas_js_1.createInstanceSchema.parse(request.body);
        const instance = await admin_whatsapp_service_js_1.adminWhatsAppService.createInstance(parsed);
        return reply.status(201).send({ message: 'Instância criada com sucesso!', instance });
    }
    async getQrCode(request, reply) {
        const { id } = request.params;
        const qrData = await admin_whatsapp_service_js_1.adminWhatsAppService.getQrCode(id);
        return reply.status(200).send(qrData);
    }
    async getInstanceStatus(request, reply) {
        const { id } = request.params;
        const statusData = await admin_whatsapp_service_js_1.adminWhatsAppService.getInstanceStatus(id);
        return reply.status(200).send(statusData);
    }
    async restartInstance(request, reply) {
        const { id } = request.params;
        const result = await admin_whatsapp_service_js_1.adminWhatsAppService.restartInstance(id);
        return reply.status(200).send(result);
    }
    async logoutInstance(request, reply) {
        const { id } = request.params;
        const result = await admin_whatsapp_service_js_1.adminWhatsAppService.logoutInstance(id);
        return reply.status(200).send(result);
    }
    async updateInstance(request, reply) {
        const { id } = request.params;
        const parsed = admin_whatsapp_schemas_js_1.updateInstanceSchema.parse(request.body);
        const updated = await admin_whatsapp_service_js_1.adminWhatsAppService.updateInstance(id, parsed);
        return reply.status(200).send({ message: 'Instância atualizada com sucesso!', instance: updated });
    }
    async deleteInstance(request, reply) {
        const { id } = request.params;
        const result = await admin_whatsapp_service_js_1.adminWhatsAppService.deleteInstance(id);
        return reply.status(200).send(result);
    }
    async getLogs(request, reply) {
        const parsed = admin_whatsapp_schemas_js_1.logsQuerySchema.parse(request.query);
        const logs = await admin_whatsapp_service_js_1.adminWhatsAppService.getLogs(parsed);
        return reply.status(200).send(logs);
    }
    async getEvolutionStatus(request, reply) {
        const status = await admin_whatsapp_service_js_1.adminWhatsAppService.getEvolutionStatus();
        return reply.status(200).send(status);
    }
    async getEvolutionLicense(request, reply) {
        const license = await admin_whatsapp_service_js_1.adminWhatsAppService.getEvolutionLicense();
        return reply.status(200).send(license);
    }
    async testEvolutionConnection(request, reply) {
        const testResult = await admin_whatsapp_service_js_1.adminWhatsAppService.testEvolutionConnection();
        return reply.status(200).send(testResult);
    }
    async activateEvolutionLicense(request, reply) {
        const { code } = request.body;
        if (!code || !code.trim()) {
            return reply.status(400).send({ message: 'O código de autorização (code) é obrigatório.' });
        }
        try {
            const result = await admin_whatsapp_service_js_1.adminWhatsAppService.activateEvolutionLicense(code);
            return reply.status(200).send(result);
        }
        catch (err) {
            return reply.status(400).send({ message: err?.message || 'Falha ao ativar a licença.' });
        }
    }
}
exports.AdminWhatsAppController = AdminWhatsAppController;
exports.adminWhatsAppController = new AdminWhatsAppController();
