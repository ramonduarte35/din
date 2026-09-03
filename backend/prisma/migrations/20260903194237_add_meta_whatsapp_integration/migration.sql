-- CreateEnum
CREATE TYPE "WhatsAppProviderType" AS ENUM ('EVOLUTION', 'META_OFFICIAL');

-- CreateTable
CREATE TABLE "whatsapp_integration_configs" (
    "id" TEXT NOT NULL,
    "active_provider" "WhatsAppProviderType" NOT NULL DEFAULT 'EVOLUTION',
    "meta_phone_number_id" TEXT,
    "meta_waba_id" TEXT,
    "meta_access_token" TEXT,
    "meta_verify_token" TEXT,
    "meta_app_secret" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_integration_configs_pkey" PRIMARY KEY ("id")
);
