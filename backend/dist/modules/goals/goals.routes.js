"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.goalsRoutes = goalsRoutes;
const goals_controller_js_1 = require("./goals.controller.js");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const goalsController = new goals_controller_js_1.GoalsController();
async function goalsRoutes(app) {
    app.addHook('preHandler', auth_middleware_js_1.authenticate);
    app.get('/', goalsController.list);
    app.post('/', goalsController.create);
    app.put('/:id', goalsController.update);
    app.post('/:id/deposit', goalsController.deposit);
    app.delete('/:id', goalsController.delete);
}
