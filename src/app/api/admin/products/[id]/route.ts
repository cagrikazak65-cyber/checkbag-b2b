import { requireAdmin } from "@/lib/auth";
import { prismaErrorResponse } from "@/lib/api/errors";
import { formatProduct, parsePriceCents } from "@/lib/api/format";
import { parseRecordStatus, parseStockType } from "@/lib/domain";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type Context = { params: Promise<{ id: string }> };

function productData(body: Record<string, unknown>) {
  const stockType = parseStockType(body.stockType);

  return {
    name: String(body.name ?? "").trim(),
    category: String(body.category ?? "").trim(),
    price: String(body.price ?? "").trim(),
    priceCents: parsePriceCents(String(body.price ?? "")),
    stockType,
    stockQuantity: stockType === "quantity" ? Number(body.stockQuantity ?? 0) : null,
    description: String(body.description ?? "").trim(),
    image: String(body.image ?? ""),
    status: parseRecordStatus(body.status),
  };
}

async function getId(context: Context) {
  const params = await context.params;
  return Number(params.id);
}

export async function GET(req: NextRequest, context: Context) {
  const { error } = await requireAdmin(req);

  if (error) {
    return error;
  }

  const id = await getId(context);

  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Geçersiz ürün." }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) {
    return NextResponse.json({ error: "Ürün bulunamadı." }, { status: 404 });
  }

  return NextResponse.json({ product: formatProduct(product) });
}

export async function PUT(req: NextRequest, context: Context) {
  const { error } = await requireAdmin(req);

  if (error) {
    return error;
  }

  const id = await getId(context);
  const data = productData(await req.json().catch(() => ({})));

  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Geçersiz ürün." }, { status: 400 });
  }

  if (!data.name || !data.category || !data.price || !data.description) {
    return NextResponse.json({ error: "Lütfen gerekli alanları doldurun." }, { status: 400 });
  }

  if (data.priceCents <= 0) {
    return NextResponse.json({ error: "Lütfen geçerli bir fiyat girin." }, { status: 400 });
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
    const product = await prisma.product.update({ where: { id }, data });
    return NextResponse.json({ product: formatProduct(product) });
  } catch (caught) {
    const response = prismaErrorResponse(caught);
    if (response) return response;
    throw caught;
  }
}

export async function DELETE(req: NextRequest, context: Context) {
  const { error } = await requireAdmin(req);

  if (error) {
    return error;
  }

  const id = await getId(context);

  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Geçersiz ürün." }, { status: 400 });
  }

  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (caught) {
    const response = prismaErrorResponse(caught);
    if (response) return response;
    throw caught;
  }
}
