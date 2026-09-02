-- Migration: 20260902143500_seed_default_global_categories
-- Inserção idempotente das categorias globais padrão do sistema (user_id IS NULL)

INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "created_at")
SELECT 'cat-alim-01', NULL, 'Alimentação', 'EXPENSE'::"CategoryType", 'Utensils', '#f97316', NOW()
WHERE NOT EXISTS (SELECT 1 FROM "categories" WHERE "name" = 'Alimentação' AND "user_id" IS NULL);

INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "created_at")
SELECT 'cat-mora-02', NULL, 'Moradia', 'EXPENSE'::"CategoryType", 'Home', '#6366f1', NOW()
WHERE NOT EXISTS (SELECT 1 FROM "categories" WHERE "name" = 'Moradia' AND "user_id" IS NULL);

INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "created_at")
SELECT 'cat-tran-03', NULL, 'Transporte', 'EXPENSE'::"CategoryType", 'Car', '#0ea5e9', NOW()
WHERE NOT EXISTS (SELECT 1 FROM "categories" WHERE "name" = 'Transporte' AND "user_id" IS NULL);

INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "created_at")
SELECT 'cat-saud-04', NULL, 'Saúde', 'EXPENSE'::"CategoryType", 'HeartPulse', '#ec4899', NOW()
WHERE NOT EXISTS (SELECT 1 FROM "categories" WHERE "name" = 'Saúde' AND "user_id" IS NULL);

INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "created_at")
SELECT 'cat-laze-05', NULL, 'Lazer & Cultura', 'EXPENSE'::"CategoryType", 'Gamepad2', '#a855f7', NOW()
WHERE NOT EXISTS (SELECT 1 FROM "categories" WHERE "name" = 'Lazer & Cultura' AND "user_id" IS NULL);

INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "created_at")
SELECT 'cat-educ-06', NULL, 'Educação', 'EXPENSE'::"CategoryType", 'GraduationCap', '#14b8a6', NOW()
WHERE NOT EXISTS (SELECT 1 FROM "categories" WHERE "name" = 'Educação' AND "user_id" IS NULL);

INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "created_at")
SELECT 'cat-vest-07', NULL, 'Vestuário', 'EXPENSE'::"CategoryType", 'ShoppingBag', '#f43f5e', NOW()
WHERE NOT EXISTS (SELECT 1 FROM "categories" WHERE "name" = 'Vestuário' AND "user_id" IS NULL);

INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "created_at")
SELECT 'cat-assi-08', NULL, 'Assinaturas & Serviços', 'EXPENSE'::"CategoryType", 'CreditCard', '#8b5cf6', NOW()
WHERE NOT EXISTS (SELECT 1 FROM "categories" WHERE "name" = 'Assinaturas & Serviços' AND "user_id" IS NULL);

INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "created_at")
SELECT 'cat-outd-09', NULL, 'Outros (Despesas)', 'EXPENSE'::"CategoryType", 'MoreHorizontal', '#64748b', NOW()
WHERE NOT EXISTS (SELECT 1 FROM "categories" WHERE "name" = 'Outros (Despesas)' AND "user_id" IS NULL);

INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "created_at")
SELECT 'cat-sala-10', NULL, 'Salário', 'INCOME'::"CategoryType", 'Briefcase', '#10b981', NOW()
WHERE NOT EXISTS (SELECT 1 FROM "categories" WHERE "name" = 'Salário' AND "user_id" IS NULL);

INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "created_at")
SELECT 'cat-inve-11', NULL, 'Investimentos', 'INCOME'::"CategoryType", 'TrendingUp', '#06b6d4', NOW()
WHERE NOT EXISTS (SELECT 1 FROM "categories" WHERE "name" = 'Investimentos' AND "user_id" IS NULL);

INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "created_at")
SELECT 'cat-free-12', NULL, 'Freelance & Extras', 'INCOME'::"CategoryType", 'Sparkles', '#eab308', NOW()
WHERE NOT EXISTS (SELECT 1 FROM "categories" WHERE "name" = 'Freelance & Extras' AND "user_id" IS NULL);

INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "created_at")
SELECT 'cat-vend-13', NULL, 'Vendas & Reembolsos', 'INCOME'::"CategoryType", 'Receipt', '#22c55e', NOW()
WHERE NOT EXISTS (SELECT 1 FROM "categories" WHERE "name" = 'Vendas & Reembolsos' AND "user_id" IS NULL);

INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "created_at")
SELECT 'cat-outr-14', NULL, 'Outros (Receitas)', 'INCOME'::"CategoryType", 'Wallet', '#84cc16', NOW()
WHERE NOT EXISTS (SELECT 1 FROM "categories" WHERE "name" = 'Outros (Receitas)' AND "user_id" IS NULL);
