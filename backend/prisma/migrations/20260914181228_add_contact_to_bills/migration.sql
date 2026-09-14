-- AlterTable
ALTER TABLE "bills" ADD COLUMN     "contact_id" TEXT;

-- CreateIndex
CREATE INDEX "bills_user_id_contact_id_idx" ON "bills"("user_id", "contact_id");

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
