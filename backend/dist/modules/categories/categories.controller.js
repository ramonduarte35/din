"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesController = void 0;
const categories_service_js_1 = require("./categories.service.js");
const categories_schemas_js_1 = require("./categories.schemas.js");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const categoriesService = new categories_service_js_1.CategoriesService();
class CategoriesController {
    async list(request, reply) {
        const userId = (0, auth_middleware_js_1.getUserId)(request);
        const categories = await categoriesService.listCategories(userId);
        return reply.send({ categories });
    }
    async create(request, reply) {
        const userId = (0, auth_middleware_js_1.getUserId)(request);
        const body = categories_schemas_js_1.createCategorySchema.parse(request.body);
        const category = await categoriesService.createCategory(userId, body);
        return reply.status(201).send({ category });
    }
    async delete(request, reply) {
        const userId = (0, auth_middleware_js_1.getUserId)(request);
        const result = await categoriesService.deleteCategory(userId, request.params.id);
        return reply.send(result);
    }
}
exports.CategoriesController = CategoriesController;
