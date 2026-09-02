import { buildApp } from './app.js';
import { env } from './config/env.js';
import { prisma } from './lib/prisma.js';
import { redis } from './lib/redis.js';
import { evolutionClient } from './modules/webhooks/evolution.client.js';

async function autoConnectWhatsAppInstances() {
  try {
    const instances = await prisma.systemWhatsAppNumber.findMany({
      where: { is_active: true },
    });
    for (const inst of instances) {
      try {
        console.log(`📡 [WhatsApp] Verificando e conectando webhook da instância "${inst.instance_name}" no Evolution Go...`);
        await evolutionClient.connectInstance(inst.instance_name);
      } catch (err: any) {
        console.warn(`⚠️ [WhatsApp] Aviso ao conectar instância "${inst.instance_name}":`, err?.message);
      }
    }
  } catch (dbErr: any) {
    console.warn('⚠️ [WhatsApp] Não foi possível verificar instâncias na inicialização:', dbErr?.message);
  }
}

async function bootstrap() {
  const app = buildApp();

  try {
    // Conectar ao Redis
    await redis.connect().catch(() => {
      console.warn('⚠️ [Redis] Modo sem conexão ou aguardando inicialização do container.');
    });

    const address = await app.listen({
      port: env.PORT,
      host: '0.0.0.0',
    });

    console.log(`
🚀 ===============================================
   DIN - SISTEMA INTELIGENTE DE GESTÃO FINANCEIRA
   Servidor rodando em: ${address}
   Documentação API: ${address}/health
   Ambiente: ${env.NODE_ENV}
==================================================
    `);

    // Conectar automaticamente instâncias do WhatsApp em background
    autoConnectWhatsAppInstances();

    // Graceful shutdown
    const signals = ['SIGINT', 'SIGTERM'] as const;
    for (const signal of signals) {
      process.on(signal, async () => {
        console.log(`\n🛑 Recebido ${signal}. Encerrando Din API com segurança...`);
        await app.close();
        await prisma.$disconnect();
        redis.disconnect();
        process.exit(0);
      });
    }
  } catch (err) {
    console.error('❌ Falha fatal ao iniciar o servidor:', err);
    process.exit(1);
  }
}

bootstrap();

