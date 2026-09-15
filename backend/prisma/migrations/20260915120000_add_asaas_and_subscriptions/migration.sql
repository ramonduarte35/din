-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'TRIALING', 'PAST_DUE', 'CANCELED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PaymentBillingType" AS ENUM ('PIX', 'CREDIT_CARD', 'BOLETO', 'UNDEFINED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'RECEIVED', 'CONFIRMED', 'OVERDUE', 'REFUNDED', 'CANCELLED');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "asaas_customer_id" TEXT,
ADD COLUMN     "asaas_subscription_id" TEXT,
ADD COLUMN     "subscription_expires_at" TIMESTAMP(3),
ADD COLUMN     "subscription_status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "subscription_payments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "asaas_payment_id" TEXT NOT NULL,
    "asaas_subscription_id" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "net_amount" DECIMAL(12,2),
    "billing_type" "PaymentBillingType" NOT NULL DEFAULT 'UNDEFINED',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "payment_date" TIMESTAMP(3),
    "due_date" TIMESTAMP(3),
    "client_payment_date" TIMESTAMP(3),
    "invoice_url" TEXT,
    "bank_slip_url" TEXT,
    "pix_qr_code" TEXT,
    "pix_copy_paste" TEXT,
    "description" TEXT,
    "raw_payload" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscription_payments_asaas_payment_id_key" ON "subscription_payments"("asaas_payment_id");

-- CreateIndex
CREATE INDEX "subscription_payments_user_id_idx" ON "subscription_payments"("user_id");

-- CreateIndex
CREATE INDEX "subscription_payments_status_idx" ON "subscription_payments"("status");

-- CreateIndex
CREATE INDEX "subscription_payments_created_at_idx" ON "subscription_payments"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "users_asaas_customer_id_key" ON "users"("asaas_customer_id");

-- AddForeignKey
ALTER TABLE "subscription_payments" ADD CONSTRAINT "subscription_payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
