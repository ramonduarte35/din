"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountsRoutes = accountsRoutes;
const accounts_controller_js_1 = require("./accounts.controller.js");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const accountsController = new accounts_controller_js_1.AccountsController();
async function accountsRoutes(app) {
    // Todas as rotas de contas requerem autenticação do usuário
    app.addHook('onRequest', auth_middleware_js_1.authenticate);
    app.get('/', accountsController.list);
    app.get('/:id', accountsController.getById);
    app.post('/', accountsController.create);
    app.put('/:id', accountsController.update);
    app.delete('/:id', accountsController.delete);
}
