import { requireCustomer } from "@/lib/auth";
import { formatOrder } from "@/lib/api/format";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type Context = { params: Promise<{ id: string }> };

async function getId(context: Context) {
  const params = await context.params;
  return Number(params.id);
}

export async function GET(req: NextRequest, context: Context) {
  const { user, error } = await requireCustomer(req);

  if (error || !user) {
    return error;
  }

  const id = await getId(context);

  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Geçersiz sipariş." }, { status: 400 });
  }

  const order = await prisma.order.findFirst({
    where: {
      id,
      customerId: user.customerId!,
    },
    include: {
      customer: true,
      items: { include: { product: true } },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Sipariş bulunamadı." }, { status: 404 });
  }

  return NextResponse.json({ order: formatOrder(order) });
}
