"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionsRoutes = transactionsRoutes;
const transactions_controller_js_1 = require("./transactions.controller.js");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const transactionsController = new transactions_controller_js_1.TransactionsController();
async function transactionsRoutes(app) {
    app.addHook('preHandler', auth_middleware_js_1.authenticate);
    app.get('/', transactionsController.list);
    app.post('/', transactionsController.create);
    app.post('/transfer', transactionsController.transfer);
    app.get('/summary', transactionsController.summary);
    app.put('/:id', transactionsController.update);
    app.delete('/:id', transactionsController.delete);
}
