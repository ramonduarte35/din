"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionsController = exports.SubscriptionsController = void 0;
const subscriptions_service_js_1 = require("./subscriptions.service.js");
const subscriptions_schemas_js_1 = require("./subscriptions.schemas.js");
class SubscriptionsController {
    async getMySubscription(request, reply) {
        try {
            const user = request.user;
            const data = await subscriptions_service_js_1.subscriptionsService.getMySubscription(user.id);
            return reply.send(data);
        }
        catch (err) {
            request.log.error(err, 'Erro ao buscar assinatura do usuário');
            return reply.status(500).send({ error: err.message || 'Erro ao carregar dados da assinatura' });
        }
    }
    async getPlans(_request, reply) {
        const plans = subscriptions_service_js_1.subscriptionsService.getAvailablePlans();
        return reply.send({ plans });
    }
    async createCheckout(request, reply) {
        try {
            const user = request.user;
            const parsed = subscriptions_schemas_js_1.checkoutSchema.safeParse(request.body);
            if (!parsed.success) {
                return reply.status(400).send({
                    error: 'Dados de checkout inválidos',
                    details: parsed.error.format(),
                });
            }
            const result = await subscriptions_service_js_1.subscriptionsService.createCheckout(user.id, parsed.data);
            return reply.status(201).send(result);
        }
        catch (err) {
            request.log.error(err, 'Erro ao gerar checkout Asaas');
            return reply.status(500).send({ error: err.message || 'Erro ao gerar cobrança' });
        }
    }
}
exports.SubscriptionsController = SubscriptionsController;
exports.subscriptionsController = new SubscriptionsController();
