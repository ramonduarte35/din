"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.budgetsRoutes = budgetsRoutes;
const budgets_controller_js_1 = require("./budgets.controller.js");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const budgetsController = new budgets_controller_js_1.BudgetsController();
async function budgetsRoutes(app) {
    app.addHook('preHandler', auth_middleware_js_1.authenticate);
    app.get('/', budgetsController.list);
    app.post('/', budgetsController.upsert);
    app.post('/copy-previous', budgetsController.copyPrevious);
    app.put('/:id', budgetsController.update);
    app.delete('/:id', budgetsController.delete);
}
