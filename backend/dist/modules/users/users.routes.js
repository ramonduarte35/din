"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRoutes = usersRoutes;
const users_controller_js_1 = require("./users.controller.js");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const usersController = new users_controller_js_1.UsersController();
async function usersRoutes(app) {
    app.get('/me', { preHandler: [auth_middleware_js_1.authenticate] }, usersController.getProfile);
    app.put('/profile', { preHandler: [auth_middleware_js_1.authenticate] }, usersController.updateProfile);
    app.post('/change-password', { preHandler: [auth_middleware_js_1.authenticate] }, usersController.changePassword);
    app.post('/telegram/link-code', { preHandler: [auth_middleware_js_1.authenticate] }, usersController.generateTelegramLinkCode);
    app.post('/telegram/unlink', { preHandler: [auth_middleware_js_1.authenticate] }, usersController.unlinkTelegram);
}
