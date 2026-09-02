"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const env_js_1 = require("../config/env.js");
exports.prisma = global.__prisma ||
    new client_1.PrismaClient({
        datasources: {
            db: {
                url: env_js_1.env.DATABASE_URL,
            },
        },
        log: env_js_1.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
if (env_js_1.env.NODE_ENV !== 'production') {
    global.__prisma = exports.prisma;
}
