-- CreateTable
CREATE TABLE "terms" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content_url" TEXT NOT NULL,
    "published_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "terms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_consents" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "term_id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "ip_address" TEXT NOT NULL,
    "user_agent" TEXT NOT NULL,
    "consented_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "withdrawn_at" TIMESTAMP(3),
    "opt_in_types" JSONB NOT NULL DEFAULT '{"essential":true,"analytics":false,"marketing":false}',

    CONSTRAINT "user_consents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "actor_id" TEXT,
    "actor_role" TEXT NOT NULL DEFAULT 'USER',
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resource_id" TEXT,
    "diff_payload" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "terms_version_key" ON "terms"("version");

-- CreateIndex
CREATE INDEX "user_consents_user_id_idx" ON "user_consents"("user_id");

-- CreateIndex
CREATE INDEX "user_consents_consented_at_idx" ON "user_consents"("consented_at" DESC);

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_actor_id_idx" ON "audit_logs"("actor_id");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_resource_resource_id_idx" ON "audit_logs"("resource", "resource_id");

-- AddForeignKey
ALTER TABLE "user_consents" ADD CONSTRAINT "user_consents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_consents" ADD CONSTRAINT "user_consents_term_id_fkey" FOREIGN KEY ("term_id") REFERENCES "terms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ================================================================
-- LGPD Additions: pgcrypto, índice único de termo ativo e triggers
-- append-only para user_consents e audit_logs
-- ================================================================

-- Habilitar extensão pgcrypto para gen_random_bytes() e digest()
-- usadas na função de anonimização SQL.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Garante que apenas 1 termo seja o ativo simultaneamente.
-- Índice parcial: só indexa registros com is_active = true.
CREATE UNIQUE INDEX "terms_one_active_idx" ON "terms" ("is_active")
  WHERE "is_active" = true;

-- ----------------------------------------------------------------
-- TRIGGER: bloqueia UPDATE e DELETE em user_consents (append-only)
-- Revogação de consentimento deve ser feita via novo INSERT com
-- withdrawn_at preenchido — nunca alterando o registro original.
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_block_consent_mutation()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION
    'user_consents é append-only (LGPD). Use INSERT com withdrawn_at para revogar consentimento. Operação bloqueada: %', TG_OP
    USING ERRCODE = '55000';
END;
$$;

CREATE TRIGGER trg_block_consent_update
  BEFORE UPDATE ON "user_consents"
  FOR EACH ROW EXECUTE FUNCTION fn_block_consent_mutation();

CREATE TRIGGER trg_block_consent_delete
  BEFORE DELETE ON "user_consents"
  FOR EACH ROW EXECUTE FUNCTION fn_block_consent_mutation();

-- ----------------------------------------------------------------
-- TRIGGER: bloqueia UPDATE e DELETE em audit_logs (append-only)
-- Logs de auditoria são imutáveis por design e requisito LGPD.
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_block_audit_mutation()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION
    'audit_logs é append-only (LGPD). Operação proibida: %', TG_OP
    USING ERRCODE = '55000';
END;
$$;

CREATE TRIGGER trg_audit_no_update
  BEFORE UPDATE ON "audit_logs"
  FOR EACH ROW EXECUTE FUNCTION fn_block_audit_mutation();

CREATE TRIGGER trg_audit_no_delete
  BEFORE DELETE ON "audit_logs"
  FOR EACH ROW EXECUTE FUNCTION fn_block_audit_mutation();
