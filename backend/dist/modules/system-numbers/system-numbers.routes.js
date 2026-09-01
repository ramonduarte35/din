"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.systemNumbersRoutes = systemNumbersRoutes;
const system_numbers_controller_js_1 = require("./system-numbers.controller.js");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const systemNumbersController = new system_numbers_controller_js_1.SystemNumbersController();
async function systemNumbersRoutes(app) {
    app.addHook('preHandler', auth_middleware_js_1.authenticate);
    app.get('/', systemNumbersController.list);
}
