-- AlterEnum
ALTER TYPE "TransactionOrigin" ADD VALUE 'TELEGRAM_TEXT';
ALTER TYPE "TransactionOrigin" ADD VALUE 'TELEGRAM_AUDIO';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "telegram_id" TEXT,
ADD COLUMN     "telegram_username" TEXT;

-- AlterTable
ALTER TABLE "whatsapp_integration_configs" ADD COLUMN     "telegram_bot_token" TEXT,
ADD COLUMN     "telegram_bot_username" TEXT,
ADD COLUMN     "telegram_is_active" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "telegram_webhook_secret" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_telegram_id_key" ON "users"("telegram_id");
