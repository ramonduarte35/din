"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountsController = void 0;
const accounts_service_js_1 = require("./accounts.service.js");
const accounts_schemas_js_1 = require("./accounts.schemas.js");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const accountsService = new accounts_service_js_1.AccountsService();
class AccountsController {
    async list(request, reply) {
        const userId = (0, auth_middleware_js_1.getUserId)(request);
        const accounts = await accountsService.list(userId);
        return reply.status(200).send(accounts);
    }
    async getById(request, reply) {
        const userId = (0, auth_middleware_js_1.getUserId)(request);
        const { id } = request.params;
        const account = await accountsService.getById(userId, id);
        return reply.status(200).send(account);
    }
    async create(request, reply) {
        const userId = (0, auth_middleware_js_1.getUserId)(request);
        const body = accounts_schemas_js_1.createAccountSchema.parse(request.body);
        const account = await accountsService.create(userId, body);
        return reply.status(201).send(account);
    }
    async update(request, reply) {
        const userId = (0, auth_middleware_js_1.getUserId)(request);
        const { id } = request.params;
        const body = accounts_schemas_js_1.updateAccountSchema.parse(request.body);
        const updated = await accountsService.update(userId, id, body);
        return reply.status(200).send(updated);
    }
    async delete(request, reply) {
        const userId = (0, auth_middleware_js_1.getUserId)(request);
        const { id } = request.params;
        const result = await accountsService.delete(userId, id);
        return reply.status(200).send(result);
    }
}
exports.AccountsController = AccountsController;
