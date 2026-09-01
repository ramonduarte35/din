"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const users_service_js_1 = require("./users.service.js");
const users_schemas_js_1 = require("./users.schemas.js");
const usersService = new users_service_js_1.UsersService();
class UsersController {
    async getProfile(request, reply) {
        const userId = request.userPayload.userId;
        const profile = await usersService.getProfile(userId);
        return reply.send({ user: profile });
    }
    async updateProfile(request, reply) {
        const userId = request.userPayload.userId;
        const body = users_schemas_js_1.updateProfileSchema.parse(request.body);
        const updated = await usersService.updateProfile(userId, body);
        return reply.send({
            message: 'Perfil atualizado com sucesso!',
            user: updated,
        });
    }
}
exports.UsersController = UsersController;
