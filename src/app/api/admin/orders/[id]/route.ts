import { requireAdmin } from "@/lib/auth";
import { formatOrder } from "@/lib/api/format";
import { isOrderStatus } from "@/lib/domain";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type Context = { params: Promise<{ id: string }> };

async function getId(context: Context) {
  const params = await context.params;
  return Number(params.id);
}

async function findOrder(id: number) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      items: { include: { product: true } },
    },
  });
}

export async function GET(req: NextRequest, context: Context) {
  const { error } = await requireAdmin(req);

  if (error) {
    return error;
  }

  const id = await getId(context);

  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Geçersiz sipariş." }, { status: 400 });
  }

  const order = await findOrder(id);

  if (!order) {
    return NextResponse.json({ error: "Sipariş bulunamadı." }, { status: 404 });
  }

  return NextResponse.json({ order: formatOrder(order) });
}

export async function PATCH(req: NextRequest, context: Context) {
  const { error } = await requireAdmin(req);

  if (error) {
    return error;
  }

  const id = await getId(context);
  const body = await req.json().catch(() => ({}));
  const status = String(body.status ?? "");

  if (!Number.isInteger(id) || !isOrderStatus(status)) {
    return NextResponse.json({ error: "Geçersiz sipariş durumu." }, { status: 400 });
  }

  await prisma.order.update({
    where: { id },
    data: { status },
  });

  const order = await findOrder(id);

  if (!order) {
    return NextResponse.json({ error: "Sipariş bulunamadı." }, { status: 404 });
  }

  return NextResponse.json({ order: formatOrder(order) });
}
