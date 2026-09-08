-- AlterTable
ALTER TABLE "bills" ADD COLUMN "installment_number" INTEGER,
ADD COLUMN "total_installments" INTEGER,
ADD COLUMN "group_id" TEXT;

-- CreateIndex
CREATE INDEX "bills_user_id_group_id_idx" ON "bills"("user_id", "group_id");
