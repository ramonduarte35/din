"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminSubscriptionsController = exports.AdminSubscriptionsController = void 0;
const admin_subscriptions_service_js_1 = require("./admin.subscriptions.service.js");
const admin_subscriptions_schemas_js_1 = require("./admin.subscriptions.schemas.js");
class AdminSubscriptionsController {
    async getOverview(request, reply) {
        try {
            const data = await admin_subscriptions_service_js_1.adminSubscriptionsService.getOverview();
            return reply.send(data);
        }
        catch (err) {
            request.log.error(err, 'Erro ao buscar overview de assinaturas');
            return reply.status(500).send({ error: err.message || 'Erro ao carregar dados' });
        }
    }
    async getUsers(request, reply) {
        try {
            const parsed = admin_subscriptions_schemas_js_1.queryUsersSubscriptionSchema.safeParse(request.query);
            if (!parsed.success) {
                return reply.status(400).send({
                    error: 'Parâmetros de busca inválidos',
                    details: parsed.error.format(),
                });
            }
            const data = await admin_subscriptions_service_js_1.adminSubscriptionsService.getUsers(parsed.data);
            return reply.send(data);
        }
        catch (err) {
            request.log.error(err, 'Erro ao buscar usuários de assinaturas');
            return reply.status(500).send({ error: err.message || 'Erro ao listar usuários' });
        }
    }
    async manageUserSubscription(request, reply) {
        try {
            const { id: targetUserId } = request.params;
            const adminUser = request.user;
            const parsed = admin_subscriptions_schemas_js_1.manageUserSubscriptionSchema.safeParse(request.body);
            if (!parsed.success) {
                return reply.status(400).send({
                    error: 'Dados de gerenciamento inválidos',
                    details: parsed.error.format(),
                });
            }
            const updated = await admin_subscriptions_service_js_1.adminSubscriptionsService.manageUserSubscription(targetUserId, parsed.data, adminUser.id);
            return reply.send({
                success: true,
                message: 'Plano do usuário atualizado com sucesso',
                user: updated,
            });
        }
        catch (err) {
            request.log.error(err, 'Erro ao gerenciar assinatura do usuário');
            return reply.status(500).send({ error: err.message || 'Erro ao atualizar plano' });
        }
    }
    async getPayments(request, reply) {
        try {
            const query = request.query;
            const page = query.page ? parseInt(query.page, 10) : 1;
            const limit = query.limit ? parseInt(query.limit, 10) : 20;
            const status = query.status;
            const data = await admin_subscriptions_service_js_1.adminSubscriptionsService.getPayments(page, limit, status);
            return reply.send(data);
        }
        catch (err) {
            request.log.error(err, 'Erro ao buscar histórico de pagamentos Asaas');
            return reply.status(500).send({ error: err.message || 'Erro ao listar pagamentos' });
        }
    }
}
exports.AdminSubscriptionsController = AdminSubscriptionsController;
exports.adminSubscriptionsController = new AdminSubscriptionsController();
