"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_js_1 = require("./auth.service.js");
const auth_schemas_js_1 = require("./auth.schemas.js");
const authService = new auth_service_js_1.AuthService();
class AuthController {
    async register(request, reply) {
        const body = auth_schemas_js_1.registerSchema.parse(request.body);
        const user = await authService.register(body);
        const token = await reply.jwtSign({
            userId: user.id,
            email: user.email,
        });
        return reply.status(201).send({
            message: 'Usuário cadastrado com sucesso!',
            user,
            token,
        });
    }
    async login(request, reply) {
        const body = auth_schemas_js_1.loginSchema.parse(request.body);
        const user = await authService.login(body);
        const token = await reply.jwtSign({
            userId: user.id,
            email: user.email,
        });
        return reply.status(200).send({
            message: 'Login realizado com sucesso!',
            user,
            token,
        });
    }
}
exports.AuthController = AuthController;
