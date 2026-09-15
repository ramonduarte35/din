"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.receivablesRoutes = receivablesRoutes;
const receivables_controller_js_1 = require("./receivables.controller.js");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const controller = new receivables_controller_js_1.ReceivablesController();
async function receivablesRoutes(app) {
    app.addHook('onRequest', auth_middleware_js_1.authenticate);
    app.post('/', controller.create.bind(controller));
    app.get('/', controller.list.bind(controller));
    app.get('/summary', controller.getSummary.bind(controller));
    app.get('/:id', controller.getById.bind(controller));
    app.put('/:id', controller.update.bind(controller));
    app.delete('/:id', controller.delete.bind(controller));
    app.post('/:id/receive', controller.receive.bind(controller));
    app.post('/:id/unreceive', controller.unreceive.bind(controller));
}
