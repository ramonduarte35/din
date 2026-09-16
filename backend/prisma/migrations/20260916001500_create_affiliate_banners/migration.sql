-- CreateTable
CREATE TABLE "affiliate_banners" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "image_url" TEXT,
    "badge_text" TEXT,
    "cta_text" TEXT NOT NULL DEFAULT 'Saiba Mais',
    "target_url" TEXT NOT NULL,
    "placement" TEXT NOT NULL DEFAULT 'DASHBOARD',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "views_count" INTEGER NOT NULL DEFAULT 0,
    "clicks_count" INTEGER NOT NULL DEFAULT 0,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "affiliate_banners_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "affiliate_banners_is_active_placement_idx" ON "affiliate_banners"("is_active", "placement");

-- CreateIndex
CREATE INDEX "affiliate_banners_display_order_idx" ON "affiliate_banners"("display_order");
