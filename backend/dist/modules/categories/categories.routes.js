"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoriesRoutes = categoriesRoutes;
const categories_controller_js_1 = require("./categories.controller.js");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const categoriesController = new categories_controller_js_1.CategoriesController();
async function categoriesRoutes(app) {
    app.addHook('preHandler', auth_middleware_js_1.authenticate);
    app.get('/', categoriesController.list);
    app.post('/', categoriesController.create);
    app.put('/:id', categoriesController.update);
    app.delete('/:id', categoriesController.delete);
}
