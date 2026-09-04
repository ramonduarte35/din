"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.billsRoutes = billsRoutes;
const bills_controller_js_1 = require("./bills.controller.js");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const controller = new bills_controller_js_1.BillsController();
async function billsRoutes(app) {
    // Todas as rotas de contas a pagar exigem autenticação do usuário
    app.addHook('onRequest', auth_middleware_js_1.authenticate);
    app.post('/', controller.create.bind(controller));
    app.get('/', controller.list.bind(controller));
    app.get('/summary', controller.getSummary.bind(controller));
    app.post('/notify-due', controller.notifyDue.bind(controller));
    app.post('/admin/notify-all', { preHandler: [auth_middleware_js_1.requireAdmin] }, controller.adminNotifyAll.bind(controller));
    app.get('/:id', controller.getById.bind(controller));
    app.put('/:id', controller.update.bind(controller));
    app.delete('/:id', controller.delete.bind(controller));
    app.post('/:id/pay', controller.pay.bind(controller));
    app.post('/:id/unpay', controller.unpay.bind(controller));
}
