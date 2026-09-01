"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
const ioredis_1 = require("ioredis");
const env_js_1 = require("../config/env.js");
exports.redis = new ioredis_1.Redis(env_js_1.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    lazyConnect: true,
});
exports.redis.on('error', (err) => {
    console.warn('⚠️ [Redis] Aviso de conexão:', err.message);
});
exports.redis.on('connect', () => {
    console.log('⚡ [Redis] Conectado com sucesso.');
});
