"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_js_1 = require("./app.js");
const env_js_1 = require("./config/env.js");
const prisma_js_1 = require("./lib/prisma.js");
const redis_js_1 = require("./lib/redis.js");
async function bootstrap() {
    const app = (0, app_js_1.buildApp)();
    try {
        // Conectar ao Redis
        await redis_js_1.redis.connect().catch(() => {
            console.warn('⚠️ [Redis] Modo sem conexão ou aguardando inicialização do container.');
        });
        const address = await app.listen({
            port: env_js_1.env.PORT,
            host: '0.0.0.0',
        });
        console.log(`
🚀 ===============================================
   DIN - SISTEMA INTELIGENTE DE GESTÃO FINANCEIRA
   Servidor rodando em: ${address}
   Documentação API: ${address}/health
   Ambiente: ${env_js_1.env.NODE_ENV}
==================================================
    `);
        // Graceful shutdown
        const signals = ['SIGINT', 'SIGTERM'];
        for (const signal of signals) {
            process.on(signal, async () => {
                console.log(`\n🛑 Recebido ${signal}. Encerrando Din API com segurança...`);
                await app.close();
                await prisma_js_1.prisma.$disconnect();
                redis_js_1.redis.disconnect();
                process.exit(0);
            });
        }
    }
    catch (err) {
        console.error('❌ Falha fatal ao iniciar o servidor:', err);
        process.exit(1);
    }
}
bootstrap();
