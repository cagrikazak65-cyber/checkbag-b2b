import { requireAdmin } from "@/lib/auth";
import { prismaErrorResponse } from "@/lib/api/errors";
import { formatProduct, parsePriceCents } from "@/lib/api/format";
import { parseRecordStatus, parseStockType, parseVatRate } from "@/lib/domain";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

function productData(body: Record<string, unknown>) {
  const stockType = parseStockType(body.stockType);

  return {
    name: String(body.name ?? "").trim(),
    category: String(body.category ?? "").trim(),
    price: String(body.price ?? "").trim(),
    priceCents: parsePriceCents(String(body.price ?? "")),
    vatRate: parseVatRate(body.vatRate),
    stockType,
    stockQuantity: stockType === "quantity" ? Number(body.stockQuantity ?? 0) : null,
    description: String(body.description ?? "").trim(),
    image: String(body.image ?? ""),
    status: parseRecordStatus(body.status),
  };
}

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req);

  if (error) {
    return error;
  }

  const products = await prisma.product.findMany({ orderBy: { id: "desc" } });
  return NextResponse.json({ products: products.map(formatProduct) });
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin(req);

  if (error) {
    return error;
  }

  const data = productData(await req.json().catch(() => ({})));

  if (!data.name || !data.category || !data.price || !data.description) {
    return NextResponse.json({ error: "Lütfen gerekli alanları doldurun." }, { status: 400 });
  }

  if (data.priceCents <= 0) {
    return NextResponse.json({ error: "Lütfen geçerli bir fiyat girin." }, { status: 400 });
  }

  if (!Number.isInteger(data.vatRate) || data.vatRate < 0 || data.vatRate > 100) {
    return NextResponse.json({ error: "KDV oranı 0 ile 100 arasında olmalıdır." }, { status: 400 });
  }

  if (
    data.stockType === "quantity" &&
    (data.stockQuantity === null ||
      !Number.isInteger(data.stockQuantity) ||
      data.stockQuantity < 0)
  ) {
    return NextResponse.json({ error: "Stok adedi 0 veya daha büyük olmalıdır." }, { status: 400 });
  }

  try {
    const product = await prisma.product.create({ data });
    return NextResponse.json({ product: formatProduct(product) }, { status: 201 });
  } catch (caught) {
    const response = prismaErrorResponse(caught);
    if (response) return response;
    throw caught;
  }
}
