import { requireUser } from "@/lib/auth";
import { formatProduct } from "@/lib/api/format";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { error } = await requireUser(req);

  if (error) {
    return error;
  }

  const products = await prisma.product.findMany({
    where: { status: "Aktif" },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ products: products.map(formatProduct) });
}
