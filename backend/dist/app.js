"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildApp = buildApp;
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const env_js_1 = require("./config/env.js");
const error_handler_js_1 = require("./middleware/error-handler.js");
const auth_routes_js_1 = require("./modules/auth/auth.routes.js");
const users_routes_js_1 = require("./modules/users/users.routes.js");
const categories_routes_js_1 = require("./modules/categories/categories.routes.js");
const system_numbers_routes_js_1 = require("./modules/system-numbers/system-numbers.routes.js");
const transactions_routes_js_1 = require("./modules/transactions/transactions.routes.js");
const accounts_routes_js_1 = require("./modules/accounts/accounts.routes.js");
const webhooks_routes_js_1 = require("./modules/webhooks/webhooks.routes.js");
const admin_whatsapp_routes_js_1 = require("./modules/admin/admin.whatsapp.routes.js");
function buildApp() {
    const app = (0, fastify_1.default)({
        logger: {
            level: env_js_1.env.NODE_ENV === 'development' ? 'info' : 'warn',
        },
    });
    // Plugins globais
    app.register(cors_1.default, {
        origin: true,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    });
    app.register(jwt_1.default, {
        secret: env_js_1.env.JWT_SECRET,
        sign: {
            expiresIn: '7d',
        },
    });
    // Error Handler Global
    app.setErrorHandler(error_handler_js_1.errorHandler);
    // Healthcheck
    app.get('/health', async () => {
        return {
            status: 'ok',
            service: 'Din Financial Backend API',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        };
    });
    // Registro de Rotas com prefixo /api/v1
    app.register(async (v1) => {
        v1.register(auth_routes_js_1.authRoutes, { prefix: '/auth' });
        v1.register(users_routes_js_1.usersRoutes, { prefix: '/users' });
        v1.register(categories_routes_js_1.categoriesRoutes, { prefix: '/categories' });
        v1.register(accounts_routes_js_1.accountsRoutes, { prefix: '/accounts' });
        v1.register(system_numbers_routes_js_1.systemNumbersRoutes, { prefix: '/system-numbers' });
        v1.register(transactions_routes_js_1.transactionsRoutes, { prefix: '/transactions' });
        v1.register(webhooks_routes_js_1.webhooksRoutes, { prefix: '/webhooks' });
        v1.register(admin_whatsapp_routes_js_1.adminWhatsAppRoutes, { prefix: '/admin/whatsapp' });
    }, { prefix: '/api/v1' });
    return app;
}
