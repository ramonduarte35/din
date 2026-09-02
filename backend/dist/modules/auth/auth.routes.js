"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = authRoutes;
const auth_controller_js_1 = require("./auth.controller.js");
const authController = new auth_controller_js_1.AuthController();
async function authRoutes(app) {
    app.post('/register', authController.register);
    app.post('/login', authController.login);
    app.post('/google', authController.googleLogin);
    app.get('/config', authController.getConfig);
}
