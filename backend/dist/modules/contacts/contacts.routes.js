"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactsRoutes = contactsRoutes;
const contacts_controller_js_1 = require("./contacts.controller.js");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const controller = new contacts_controller_js_1.ContactsController();
async function contactsRoutes(app) {
    app.addHook('onRequest', auth_middleware_js_1.authenticate);
    app.post('/', controller.create.bind(controller));
    app.get('/', controller.list.bind(controller));
    app.get('/:id', controller.getById.bind(controller));
    app.put('/:id', controller.update.bind(controller));
    app.delete('/:id', controller.delete.bind(controller));
}
