/**
 * @file privacy.service.ts
 * @description Serviço LGPD para direitos do titular (DSR - Data Subject Requests).
 *
 * Implementa:
 * - Anonimização de PII (direito ao esquecimento — LGPD Art. 18, VI)
 * - Exportação de dados pessoais (direito de portabilidade — LGPD Art. 18, V)
 *
 * Dados financeiros (transactions, bills) são PRESERVADOS por obrigação fiscal
 * (art. 195 do CTN — retenção mínima de 5 anos).
 */
import type { FastifyRequest } from 'fastify';
export interface AnonymizeResult {
    userId: string;
    anonymizedAt: Date;
    /** Entidades preservadas por obrigação legal (fiscal / auditoria) */
    dataRetained: string[];
}
export declare class PrivacyService {
    /**
     * Anonimiza todos os dados PII de um usuário em transação atômica.
     *
     * O processo:
     * 1. Captura snapshot dos dados antes da alteração (para diff de auditoria)
     * 2. Substitui nome, e-mail, telefone, telegram_id e dados de autenticação
     * 3. Insere registros de revogação de consentimento (append-only)
     * 4. Registra no audit_log com diff mascarado
     *
     * @param userId  - UUID do usuário a ser anonimizado
     * @param actorId - Quem disparou (pode ser o próprio usuário ou admin)
     * @param request - Request Fastify opcional para capturar IP/UA no audit log
     */
    anonymizeUser(userId: string, actorId: string, request?: Pick<FastifyRequest, 'ip' | 'headers'>): Promise<AnonymizeResult>;
    /**
     * Exporta todos os dados do usuário para atender ao direito de portabilidade.
     * Exclui campos de sistema internos (hashes de senha, tokens OAuth).
     *
     * @param userId - UUID do usuário
     * @returns Objeto JSON completo com todos os dados do usuário
     */
    exportUserData(userId: string): Promise<Record<string, unknown>>;
    /**
     * Registra um evento de auditoria genérico.
     */
    createAuditLog(params: {
        userId?: string | null;
        actorId?: string | null;
        actorRole?: string;
        action: string;
        resource: string;
        resourceId?: string | null;
        diffPayload?: Record<string, unknown>;
        ipAddress?: string | null;
        userAgent?: string | null;
    }): Promise<void>;
}
export declare const privacyService: PrivacyService;
