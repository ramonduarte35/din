"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemNumbersController = void 0;
const system_numbers_service_js_1 = require("./system-numbers.service.js");
const systemNumbersService = new system_numbers_service_js_1.SystemNumbersService();
class SystemNumbersController {
    async list(request, reply) {
        const numbers = await systemNumbersService.listActiveNumbers();
        return reply.send({ system_numbers: numbers });
    }
}
exports.SystemNumbersController = SystemNumbersController;
