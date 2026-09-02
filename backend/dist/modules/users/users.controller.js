"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const users_service_js_1 = require("./users.service.js");
const users_schemas_js_1 = require("./users.schemas.js");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const usersService = new users_service_js_1.UsersService();
class UsersController {
    async getProfile(request, reply) {
        const userId = (0, auth_middleware_js_1.getUserId)(request);
        const profile = await usersService.getProfile(userId);
        return reply.send({ user: profile });
    }
    async updateProfile(request, reply) {
        const userId = (0, auth_middleware_js_1.getUserId)(request);
        const body = users_schemas_js_1.updateProfileSchema.parse(request.body);
        const updated = await usersService.updateProfile(userId, body);
        return reply.send({
            message: 'Perfil atualizado com sucesso!',
            user: updated,
        });
    }
    async changePassword(request, reply) {
        const userId = (0, auth_middleware_js_1.getUserId)(request);
        const body = users_schemas_js_1.changePasswordSchema.parse(request.body);
        const result = await usersService.changePassword(userId, body);
        return reply.send(result);
    }
}
exports.UsersController = UsersController;
