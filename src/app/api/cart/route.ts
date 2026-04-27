import { requireCustomer } from "@/lib/auth";
import { prismaErrorResponse } from "@/lib/api/errors";
import { formatCartItem } from "@/lib/api/format";
import { prisma } from "@/lib/prisma";
import { calculateOrderPricing } from "@/lib/pricing";
import { NextRequest, NextResponse } from "next/server";

async function readBody(req: NextRequest) {
  return req.json().catch(() => ({}));
}

async function getCart(customerId: number) {
  const items = await prisma.cartItem.findMany({
    where: { customerId },
    include: { product: true },
    orderBy: { createdAt: "asc" },
  });

  return items.map(formatCartItem);
}

function getCartSummary(cartItems: Awaited<ReturnType<typeof getCart>>) {
  const totals = calculateOrderPricing(
    cartItems.map((item) => ({
      quantity: item.quantity,
      unitPriceCents: item.priceCents,
      vatRate: item.vatRate,
      lineSubtotalCents: item.lineSubtotal,
      vatAmountCents: item.vatAmount,
      lineTotalCents: item.lineTotal,
    }))
  );

  return {
    subtotal: totals.subtotalCents,
    totalVat: totals.totalVatCents,
    grandTotal: totals.grandTotalCents,
  };
}

export async function GET(req: NextRequest) {
  const { user, error } = await requireCustomer(req);

  if (error || !user) {
    return error;
  }

  const cartItems = await getCart(user.customerId!);
  return NextResponse.json({ cartItems, ...getCartSummary(cartItems) });
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireCustomer(req);

  if (error || !user) {
    return error;
  }

  const body = await readBody(req);
  const productId = Number(body.productId);
  const quantity = Number(body.quantity ?? 1);

  if (!Number.isInteger(productId) || !Number.isInteger(quantity) || quantity < 1) {
    return NextResponse.json({ error: "Geçersiz ürün veya adet." }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });

  if (!product || product.status !== "Aktif") {
    return NextResponse.json({ error: "Ürün bulunamadı." }, { status: 404 });
  }

  const existing = await prisma.cartItem.findUnique({
    where: {
      customerId_productId: {
        customerId: user.customerId!,
        productId,
      },
    },
  });

  const newQuantity = (existing?.quantity ?? 0) + quantity;

  if (
    product.stockType === "quantity" &&
    product.stockQuantity !== null &&
    newQuantity > product.stockQuantity
  ) {
    return NextResponse.json({ error: "Sepetteki toplam adet stoktan fazla olamaz." }, { status: 400 });
  }

  await prisma.cartItem.upsert({
    where: {
      customerId_productId: {
        customerId: user.customerId!,
        productId,
      },
    },
    update: { quantity: newQuantity },
    create: {
      customerId: user.customerId!,
      productId,
      quantity,
    },
  });

  const cartItems = await getCart(user.customerId!);
  return NextResponse.json({ cartItems, ...getCartSummary(cartItems) });
}

export async function PATCH(req: NextRequest) {
  const { user, error } = await requireCustomer(req);

  if (error || !user) {
    return error;
  }

  const body = await readBody(req);
  const productId = Number(body.productId);
  const quantity = Number(body.quantity);

  if (!Number.isInteger(productId) || !Number.isInteger(quantity) || quantity < 1) {
    return NextResponse.json({ error: "Geçersiz ürün veya adet." }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });

  if (!product || product.status !== "Aktif") {
    return NextResponse.json({ error: "Ürün bulunamadı." }, { status: 404 });
  }

  if (
    product.stockType === "quantity" &&
    product.stockQuantity !== null &&
    quantity > product.stockQuantity
  ) {
    return NextResponse.json({ error: "Stok miktarından fazla adet giremezsiniz." }, { status: 400 });
  }

  try {
    await prisma.cartItem.update({
      where: {
        customerId_productId: {
          customerId: user.customerId!,
          productId,
        },
      },
      data: { quantity },
    });
  } catch (caught) {
    const response = prismaErrorResponse(caught);
    if (response) return response;
    throw caught;
  }

  const cartItems = await getCart(user.customerId!);
  return NextResponse.json({ cartItems, ...getCartSummary(cartItems) });
}

export async function DELETE(req: NextRequest) {
  const { user, error } = await requireCustomer(req);

  if (error || !user) {
    return error;
  }

  const body = await readBody(req);
  const productId = Number(body.productId);

  if (Number.isInteger(productId)) {
    await prisma.cartItem.deleteMany({
      where: { customerId: user.customerId!, productId },
    });
  } else {
    await prisma.cartItem.deleteMany({
      where: { customerId: user.customerId! },
    });
  }

  const cartItems = await getCart(user.customerId!);
  return NextResponse.json({ cartItems, ...getCartSummary(cartItems) });
}
