-- CreateIndex
CREATE INDEX IF NOT EXISTS "bills_user_id_status_due_date_idx" ON "bills"("user_id", "status", "due_date");
