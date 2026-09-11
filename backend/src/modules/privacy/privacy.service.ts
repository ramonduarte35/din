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

import { createHash, randomBytes } from 'node:crypto';
import { prisma } from '../../lib/prisma.js';
import type { FastifyRequest } from 'fastify';

// ─────────────────────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────────────────────

export interface AnonymizeResult {
  userId:       string;
  anonymizedAt: Date;
  /** Entidades preservadas por obrigação legal (fiscal / auditoria) */
  dataRetained: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers de anonimização
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Gera hash SHA-256 determinístico de um valor.
 * NÃO usar para senhas (use bcrypt). Uso: e-mail, telefone, CPF.
 */
function hashPii(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

/**
 * E-mail anonimizado baseado no hash do userId.
 *
 * PROBLEMA: email tem UNIQUE constraint em users.
 * SOLUÇÃO:  usar hash do user_id (não do email) — garante unicidade estável
 *           mesmo que o mesmo e-mail existisse em dois tenants hipotéticos.
 */
function buildAnonEmail(userId: string): string {
  const hash = hashPii(userId);
  return `excluido-${hash.slice(0, 12)}@anonymized.local`;
}

function buildAnonPhone(userId: string): string {
  const hash = hashPii(userId);
  return `+00${hash.slice(0, 10)}`;
}

function buildAnonTelegramId(userId: string): string {
  const hash = hashPii(userId);
  return `deleted_${hash.slice(0, 8)}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// PrivacyService
// ─────────────────────────────────────────────────────────────────────────────

export class PrivacyService {
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
  async anonymizeUser(
    userId:  string,
    actorId: string,
    request?: Pick<FastifyRequest, 'ip' | 'headers'>
  ): Promise<AnonymizeResult> {
    const now = new Date();

    // ① Capturar snapshot antes de modificar (hash do e-mail para diff — não o valor real)
    const userBefore = await prisma.user.findUniqueOrThrow({
      where:  { id: userId },
      select: { id: true, name: true, email: true, phone_number: true, telegram_id: true },
    });

    const anonEmail    = buildAnonEmail(userId);
    const anonPhone    = buildAnonPhone(userId);
    const anonTelegram = buildAnonTelegramId(userId);
    // Gera um hash inutilizável para substituir a senha
    const dummyPwHash  = randomBytes(64).toString('hex');

    // ② Transação atômica
    await prisma.$transaction(async (tx) => {
      // Anonimizar dados PII do usuário
      await tx.user.update({
        where: { id: userId },
        data: {
          name:              'Usuário Removido',
          email:             anonEmail,
          password_hash:     dummyPwHash,
          phone_number:      userBefore.phone_number ? anonPhone    : undefined,
          telegram_id:       userBefore.telegram_id  ? anonTelegram : undefined,
          telegram_username: null,
          avatar_url:        null,
          google_id:         null,
        },
      });

      // Revogar todos os consentimentos ativos via novo INSERT (append-only)
      const activeConsents = await tx.userConsent.findMany({
        where: { userId, withdrawnAt: null },
      });

      if (activeConsents.length > 0) {
        await tx.userConsent.createMany({
          data: activeConsents.map((c) => ({
            userId,
            termId:      c.termId,
            version:     c.version,
            ipAddress:   request?.ip ?? '0.0.0.0',
            userAgent:   (request?.headers?.['user-agent'] as string | undefined) ?? 'SYSTEM',
            withdrawnAt: now,
            optInTypes:  { essential: false, analytics: false, marketing: false },
          })),
        });
      }

      // Audit log — diff contém hash do e-mail original (não o valor real)
      await tx.auditLog.create({
        data: {
          userId,
          actorId,
          actorRole:   actorId === userId ? 'USER' : 'ADMIN',
          action:      'USER_ANONYMIZED',
          resource:    'users',
          resourceId:  userId,
          ipAddress:   request?.ip ?? null,
          userAgent:   (request?.headers?.['user-agent'] as string | undefined) ?? null,
          diffPayload: {
            before: {
              name:     userBefore.name,
              // Armazena apenas prefixo do hash — nunca o e-mail real
              emailHash: `[SHA256:${hashPii(userBefore.email).slice(0, 8)}...]`,
            },
            after: {
              name:  'Usuário Removido',
              email: '[ANONYMIZED]',
            },
            anonymizedAt: now.toISOString(),
          },
        },
      });
    });

    return {
      userId,
      anonymizedAt: now,
      dataRetained: ['transactions', 'bills', 'audit_logs'],
    };
  }

  /**
   * Exporta todos os dados do usuário para atender ao direito de portabilidade.
   * Exclui campos de sistema internos (hashes de senha, tokens OAuth).
   *
   * @param userId - UUID do usuário
   * @returns Objeto JSON completo com todos os dados do usuário
   */
  async exportUserData(userId: string): Promise<Record<string, unknown>> {
    const [
      user,
      transactions,
      bills,
      accounts,
      categories,
      goals,
      budgets,
      consents,
    ] = await Promise.all([
      prisma.user.findUnique({
        where:  { id: userId },
        select: {
          id: true, name: true, email: true,
          phone_number: true, subscription_tier: true,
          created_at: true,
          // Omitir: password_hash, google_id (token OAuth), telegram_id
        },
      }),
      prisma.transaction.findMany({
        where:  { user_id: userId },
        select: {
          id: true, description: true, amount: true,
          type: true, date: true, origin: true, created_at: true,
        },
        orderBy: { date: 'desc' },
      }),
      prisma.bill.findMany({
        where:  { user_id: userId },
        select: {
          id: true, description: true, amount: true,
          due_date: true, status: true, created_at: true,
        },
        orderBy: { due_date: 'desc' },
      }),
      prisma.account.findMany({
        where:  { user_id: userId },
        select: { id: true, name: true, type: true, created_at: true },
      }),
      prisma.category.findMany({
        where:  { user_id: userId },
        select: { id: true, name: true, type: true, created_at: true },
      }),
      prisma.goal.findMany({
        where:  { user_id: userId },
        select: {
          id: true, title: true, target_amount: true,
          current_amount: true, deadline: true, is_completed: true,
        },
      }),
      prisma.budget.findMany({
        where:  { user_id: userId },
        select: { id: true, amount: true, month: true, year: true },
      }),
      prisma.userConsent.findMany({
        where:   { userId },
        select:  { version: true, consentedAt: true, withdrawnAt: true, optInTypes: true },
        orderBy: { consentedAt: 'desc' },
      }),
    ]);

    return {
      exportedAt:    new Date().toISOString(),
      formatVersion: 'LGPD-Export-v1',
      legalBasis:    'LGPD Art. 18, V — Direito de Portabilidade',
      user,
      financialData: { accounts, transactions, bills },
      planning:      { categories, goals, budgets },
      privacyData:   { consents },
    };
  }

  /**
   * Registra um evento de auditoria genérico.
   */
  async createAuditLog(params: {
    userId?:      string | null;
    actorId?:     string | null;
    actorRole?:   string;
    action:       string;
    resource:     string;
    resourceId?:  string | null;
    diffPayload?: Record<string, unknown>;
    ipAddress?:   string | null;
    userAgent?:   string | null;
  }): Promise<void> {
    // Prisma createInput não aceita null em campos string opcionais — converter para undefined
    await prisma.auditLog.create({
      data: {
        userId:      params.userId      ?? undefined,
        actorId:     params.actorId     ?? undefined,
        actorRole:   params.actorRole,
        action:      params.action,
        resource:    params.resource,
        resourceId:  params.resourceId  ?? undefined,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        diffPayload: params.diffPayload as any,
        ipAddress:   params.ipAddress   ?? undefined,
        userAgent:   params.userAgent   ?? undefined,
      },
    });
  }
}

export const privacyService = new PrivacyService();
