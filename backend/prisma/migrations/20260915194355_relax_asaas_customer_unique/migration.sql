-- DropIndex
DROP INDEX "users_asaas_customer_id_key";

-- CreateIndex
CREATE INDEX "users_asaas_customer_id_idx" ON "users"("asaas_customer_id");
