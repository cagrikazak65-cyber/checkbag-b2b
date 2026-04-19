import { requireCustomer } from "@/lib/auth";
import { formatOrder, formatPriceFromCents } from "@/lib/api/format";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const PAYMENT_METHODS = [
  "EFT / Havale",
  "Nakit",
  "Kredi Kartı",
  "Açık Hesap / Vade",
] as const;

export async function GET(req: NextRequest) {
  const { user, error } = await requireCustomer(req);

  if (error) {
    return error;
  }

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { customerId: user.customerId! },
    include: {
      customer: true,
      items: { include: { product: true } },
    },
    orderBy: { id: "desc" },
  });

  return NextResponse.json({ orders: orders.map(formatOrder) });
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireCustomer(req);

  if (error) {
    return error;
  }

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const paymentMethod = String(body.paymentMethod ?? "EFT / Havale").trim();
  const note = String(body.note ?? "").trim();

  if (!PAYMENT_METHODS.includes(paymentMethod as (typeof PAYMENT_METHODS)[number])) {
    return NextResponse.json({ error: "Geçersiz ödeme yöntemi." }, { status: 400 });
  }

  if (!note) {
    return NextResponse.json({ error: "Lütfen sipariş notu alanını doldurun." }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const cartItems = await tx.cartItem.findMany({
        where: { customerId: user.customerId! },
        include: { product: true },
      });

      if (cartItems.length === 0) {
        throw new Error("EMPTY_CART");
      }

      for (const item of cartItems) {
        if (item.product.status !== "Aktif") {
          throw new Error(`INACTIVE:${item.product.name}`);
        }

        if (item.product.priceCents <= 0) {
          throw new Error(`PRICE:${item.product.name}`);
        }

        if (!Number.isInteger(item.quantity) || item.quantity < 1) {
          throw new Error(`QUANTITY:${item.product.name}`);
        }

        if (
          item.product.stockType === "quantity" &&
          item.product.stockQuantity !== null &&
          item.quantity > item.product.stockQuantity
        ) {
          throw new Error(`STOCK:${item.product.name}`);
        }
      }

      const totalAmount = cartItems.reduce(
        (sum, item) => sum + item.product.priceCents * item.quantity,
        0
      );

      if (totalAmount <= 0) {
        throw new Error("INVALID_TOTAL");
      }

      const order = await tx.order.create({
        data: {
          customerId: user.customerId!,
          paymentMethod,
          note,
          totalAmount: formatPriceFromCents(totalAmount),
          totalAmountCents: totalAmount,
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
              priceCents: item.product.priceCents,
            })),
          },
        },
        include: {
          customer: true,
          items: { include: { product: true } },
        },
      });

      for (const item of cartItems) {
        if (item.product.stockType === "quantity" && item.product.stockQuantity !== null) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stockQuantity: Math.max(0, item.product.stockQuantity - item.quantity) },
          });
        }
      }

      await tx.cartItem.deleteMany({ where: { customerId: user.customerId! } });

      return formatOrder(order);
    });

    return NextResponse.json({ order: result }, { status: 201 });
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : "";

    if (message === "EMPTY_CART") {
      return NextResponse.json({ error: "Sepetiniz şu anda boş." }, { status: 400 });
    }

    if (message.startsWith("STOCK:")) {
      return NextResponse.json(
        { error: `${message.replace("STOCK:", "")} için yeterli stok yok.` },
        { status: 400 }
      );
    }

    if (message.startsWith("INACTIVE:")) {
      return NextResponse.json(
        { error: `${message.replace("INACTIVE:", "")} artık satışta değil. Lütfen sepetten çıkarın.` },
        { status: 400 }
      );
    }

    if (message.startsWith("PRICE:")) {
      return NextResponse.json(
        { error: `${message.replace("PRICE:", "")} için geçerli fiyat bulunamadı.` },
        { status: 400 }
      );
    }

    if (message.startsWith("QUANTITY:")) {
      return NextResponse.json(
        { error: `${message.replace("QUANTITY:", "")} için geçersiz adet var.` },
        { status: 400 }
      );
    }

    if (message === "INVALID_TOTAL") {
      return NextResponse.json({ error: "Sipariş toplamı geçersiz." }, { status: 400 });
    }

    throw caught;
  }
}
