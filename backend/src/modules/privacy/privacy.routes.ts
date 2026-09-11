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

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z }                from 'zod';
import { prisma }           from '../../lib/prisma.js';
import { privacyService }   from './privacy.service.js';
import { authenticate, getUserId } from '../../middleware/auth.middleware.js';

// ─────────────────────────────────────────────────────────────────────────────
// Schemas de validação (Zod)
// ─────────────────────────────────────────────────────────────────────────────

const forgetMeBodySchema = z.object({
  /** O usuário deve digitar literalmente "CONFIRMAR_EXCLUSAO" para confirmar. */
  confirmation: z.literal('CONFIRMAR_EXCLUSAO', {
    errorMap: () => ({
      message: 'Para confirmar a exclusão, envie o campo "confirmation" com o valor exato: CONFIRMAR_EXCLUSAO',
    }),
  }),
  reason: z.string().max(500).optional(),
});

const consentBodySchema = z.object({
  termId: z.string().uuid({ message: 'termId deve ser um UUID válido.' }),
  optInTypes: z.object({
    essential: z.literal(true, {
      errorMap: () => ({ message: 'O consentimento essencial é obrigatório e não pode ser recusado.' }),
    }),
    analytics: z.boolean(),
    marketing: z.boolean(),
  }),
});

// ─────────────────────────────────────────────────────────────────────────────
// Store em memória para jobs DSR (produção: substituir por tabela dsr_requests)
// ─────────────────────────────────────────────────────────────────────────────

type DsrStatus = 'PROCESSING' | 'COMPLETED' | 'FAILED';

interface DsrJob {
  userId:    string;
  type:      'EXPORT' | 'FORGET_ME';
  status:    DsrStatus;
  createdAt: Date;
}

const dsrJobs = new Map<string, DsrJob>();

// ─────────────────────────────────────────────────────────────────────────────
// Rotas
// ─────────────────────────────────────────────────────────────────────────────

export async function privacyRoutes(app: FastifyInstance): Promise<void> {

  // ─── GET /privacy/consents ─────────────────────────────────────────────────
  // Retorna histórico de consentimentos do usuário autenticado.
  app.get(
    '/consents',
    { preHandler: [authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = getUserId(request);

      const [consents, activeTerm] = await Promise.all([
        prisma.userConsent.findMany({
          where:   { userId },
          orderBy: { consentedAt: 'desc' },
          include: {
            term: { select: { version: true, title: true, contentUrl: true } },
          },
        }),
        prisma.terms.findFirst({ where: { isActive: true } }),
      ]);

      return reply.send({
        activeTerm,
        consents: consents.map((c) => ({
          id:          c.id,
          version:     c.version,
          term:        c.term,
          consentedAt: c.consentedAt,
          withdrawnAt: c.withdrawnAt,
          isActive:    c.withdrawnAt === null,
          optInTypes:  c.optInTypes,
        })),
      });
    }
  );

  // ─── POST /privacy/consents ────────────────────────────────────────────────
  // Registra novo consentimento (append-only por design e trigger do banco).
  app.post(
    '/consents',
    { preHandler: [authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = getUserId(request);
      const parsed = consentBodySchema.safeParse(request.body);

      if (!parsed.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Payload de consentimento inválido.',
          details: parsed.error.flatten(),
        });
      }

      const { termId, optInTypes } = parsed.data;

      // Verificar se o termo existe
      const term = await prisma.terms.findUnique({ where: { id: termId } });
      if (!term) {
        return reply.status(404).send({ error: 'Termo não encontrado.' });
      }

      const consent = await prisma.userConsent.create({
        data: {
          userId,
          termId,
          version:   term.version,
          ipAddress: request.ip ?? '0.0.0.0',
          userAgent: (request.headers['user-agent'] as string | undefined) ?? 'unknown',
          optInTypes,
        },
      });

      // Audit log
      await privacyService.createAuditLog({
        userId,
        actorId:   userId,
        actorRole: 'USER',
        action:    'CONSENT_RECORDED',
        resource:  'user_consents',
        resourceId: consent.id,
        diffPayload: { optInTypes, version: term.version },
        ipAddress:  request.ip,
        userAgent:  request.headers['user-agent'] as string | undefined,
      });

      return reply.status(201).send({ consent });
    }
  );

  // ─── POST /privacy/export-data ─────────────────────────────────────────────
  // Dispara job assíncrono de extração completa dos dados (portabilidade).
  // LGPD Art. 18, V: prazo de resposta de até 15 dias.
  app.post(
    '/export-data',
    { preHandler: [authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = getUserId(request);
      const jobId  = `dsr-export-${userId}-${Date.now()}`;

      // Audit log da solicitação
      await privacyService.createAuditLog({
        userId,
        actorId:   userId,
        actorRole: 'USER',
        action:    'DATA_EXPORT_REQUESTED',
        resource:  'users',
        resourceId: userId,
        ipAddress:  request.ip,
        userAgent:  request.headers['user-agent'] as string | undefined,
      });

      dsrJobs.set(jobId, { userId, type: 'EXPORT', status: 'PROCESSING', createdAt: new Date() });

      // Processar assincronamente (em produção: usar BullMQ/Redis)
      setImmediate(async () => {
        try {
          await privacyService.exportUserData(userId);
          // Em produção: salvar JSON em storage seguro e enviar link por e-mail
          dsrJobs.set(jobId, { userId, type: 'EXPORT', status: 'COMPLETED', createdAt: new Date() });
          app.log.info({ jobId, userId }, '[Privacy] Data export completed');
        } catch (err) {
          dsrJobs.set(jobId, { userId, type: 'EXPORT', status: 'FAILED', createdAt: new Date() });
          app.log.error({ jobId, err }, '[Privacy] Data export failed');
        }
      });

      return reply.status(202).send({
        jobId,
        status:           'PROCESSING',
        message:          'Sua solicitação de exportação foi recebida. Você receberá os dados em seu e-mail em até 72 horas.',
        estimatedDelivery:'72 horas',
        legalDeadline:    '15 dias úteis (LGPD Art. 18, §3º)',
        statusUrl:        `/api/v1/privacy/export-data/status/${jobId}`,
      });
    }
  );

  // ─── GET /privacy/export-data/status/:jobId ───────────────────────────────
  interface StatusParams { Params: { jobId: string } }
  app.get<StatusParams>(
    '/export-data/status/:jobId',
    { preHandler: [authenticate] },
    async (request, reply) => {
      const userId = getUserId(request);
      const job    = dsrJobs.get(request.params.jobId);

      if (!job || job.userId !== userId) {
        return reply.status(404).send({ error: 'Job não encontrado.' });
      }

      return reply.send(job);
    }
  );

  // ─── POST /privacy/forget-me ───────────────────────────────────────────────
  // Dispara anonimização completa (direito ao esquecimento — LGPD Art. 18, VI).
  app.post(
    '/forget-me',
    { preHandler: [authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = getUserId(request);

      // Validação com Zod
      const parsed = forgetMeBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: parsed.error.errors[0]?.message ?? 'Confirmação inválida.',
          details: parsed.error.flatten(),
        });
      }

      // Idempotência: verificar se já existe job em andamento
      const existingJob = [...dsrJobs.entries()].find(
        ([key, job]) =>
          key.startsWith(`dsr-forget-${userId}`) && job.status === 'PROCESSING'
      );

      if (existingJob) {
        return reply.status(409).send({
          statusCode: 409,
          error: 'Conflict',
          message: 'Já existe uma solicitação de exclusão em processamento.',
          jobId: existingJob[0],
        });
      }

      const jobId = `dsr-forget-${userId}-${Date.now()}`;
      dsrJobs.set(jobId, { userId, type: 'FORGET_ME', status: 'PROCESSING', createdAt: new Date() });

      // Audit log da solicitação (ANTES de executar)
      await privacyService.createAuditLog({
        userId,
        actorId:   userId,
        actorRole: 'USER',
        action:    'FORGET_ME_REQUESTED',
        resource:  'users',
        resourceId: userId,
        diffPayload: { reason: parsed.data.reason ?? null },
        ipAddress:   request.ip,
        userAgent:   request.headers['user-agent'] as string | undefined,
      });

      // Processar assincronamente
      setImmediate(async () => {
        try {
          await privacyService.anonymizeUser(userId, userId, request);
          dsrJobs.set(jobId, { userId, type: 'FORGET_ME', status: 'COMPLETED', createdAt: new Date() });
          app.log.info({ jobId, userId }, '[Privacy] User anonymized (forget-me)');
        } catch (err) {
          dsrJobs.set(jobId, { userId, type: 'FORGET_ME', status: 'FAILED', createdAt: new Date() });
          app.log.error({ jobId, err }, '[Privacy] Forget-me failed');
        }
      });

      return reply.status(202).send({
        jobId,
        status:  'PROCESSING',
        message: [
          'Sua solicitação de exclusão foi recebida.',
          'Seus dados pessoais (nome, e-mail, telefone) serão anonimizados permanentemente.',
          'Dados financeiros (transações, boletos) são retidos por 5 anos por exigência fiscal (art. 195, CTN).',
          'Você será desconectado automaticamente.',
        ].join(' '),
        retainedData:   ['transactions', 'bills'],
        logoutRequired: true,
      });
    }
  );
}
