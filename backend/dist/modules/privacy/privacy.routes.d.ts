/**
 * @file privacy.routes.ts
 * @description Endpoints REST para Direitos do Titular (DSR — Data Subject Requests).
 * Conformidade: LGPD Art. 18 — Direitos dos titulares de dados.
 *
 * Rotas:
 *  GET  /privacy/consents         — Lista consentimentos do usuário
 *  POST /privacy/consents         — Registra novo consentimento
 *  POST /privacy/export-data      — Solicita exportação de dados (portabilidade)
 *  GET  /privacy/export-data/:id  — Verifica status do job de exportação
 *  POST /privacy/forget-me        — Solicita anonimização (esquecimento)
 */
import type { FastifyInstance } from 'fastify';
export declare function privacyRoutes(app: FastifyInstance): Promise<void>;
