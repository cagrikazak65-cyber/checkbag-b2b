import { requireAdmin } from "@/lib/auth";
import { formatOrder } from "@/lib/api/format";
import { isOrderStatus } from "@/lib/domain";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req);

  if (error) {
    return error;
  }

  const orders = await prisma.order.findMany({
    include: {
      customer: true,
      items: { include: { product: true } },
    },
    orderBy: { id: "desc" },
  });

  return NextResponse.json({ orders: orders.map(formatOrder) });
}

export async function PATCH(req: NextRequest) {
  const { error } = await requireAdmin(req);

  if (error) {
    return error;
  }

  const body = await req.json().catch(() => ({}));
  const orderId = Number(body.orderId);
  const status = String(body.status ?? "");

  if (!Number.isInteger(orderId) || !isOrderStatus(status)) {
    return NextResponse.json({ error: "Geçersiz sipariş durumu." }, { status: 400 });
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });

  const orders = await prisma.order.findMany({
    include: {
      customer: true,
      items: { include: { product: true } },
    },
    orderBy: { id: "desc" },
  });

  return NextResponse.json({ orders: orders.map(formatOrder) });
}
