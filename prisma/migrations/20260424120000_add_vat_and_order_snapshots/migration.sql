-- Add VAT support to products and order snapshots.
ALTER TABLE "Product" ADD COLUMN "vatRate" INTEGER NOT NULL DEFAULT 20;

ALTER TABLE "Order" ADD COLUMN "subtotalCents" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN "totalVatCents" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "OrderItem" ADD COLUMN "productNameSnapshot" TEXT NOT NULL DEFAULT '';
ALTER TABLE "OrderItem" ADD COLUMN "productCategorySnapshot" TEXT NOT NULL DEFAULT '';
ALTER TABLE "OrderItem" ADD COLUMN "vatRate" INTEGER NOT NULL DEFAULT 20;
ALTER TABLE "OrderItem" ADD COLUMN "vatAmountCents" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "OrderItem" ADD COLUMN "lineSubtotalCents" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "OrderItem" ADD COLUMN "lineTotalCents" INTEGER NOT NULL DEFAULT 0;

-- Preserve existing order totals by treating legacy orders as VAT-free snapshots.
UPDATE "Order"
SET
  "subtotalCents" = "totalAmountCents",
  "totalVatCents" = 0
WHERE "subtotalCents" = 0 AND "totalVatCents" = 0;

UPDATE "OrderItem"
SET
  "productNameSnapshot" = COALESCE(
    (SELECT "name" FROM "Product" WHERE "Product"."id" = "OrderItem"."productId"),
    ''
  ),
  "productCategorySnapshot" = COALESCE(
    (SELECT "category" FROM "Product" WHERE "Product"."id" = "OrderItem"."productId"),
    ''
  ),
  "vatRate" = 0,
  "vatAmountCents" = 0,
  "lineSubtotalCents" = "priceCents" * "quantity",
  "lineTotalCents" = "priceCents" * "quantity";
