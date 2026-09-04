-- CreateIndex
CREATE INDEX "transactions_user_id_category_id_idx" ON "transactions"("user_id", "category_id");

-- CreateIndex
CREATE INDEX "transactions_user_id_origin_idx" ON "transactions"("user_id", "origin");

-- CreateIndex
CREATE INDEX "transactions_user_id_category_id_date_idx" ON "transactions"("user_id", "category_id", "date");
