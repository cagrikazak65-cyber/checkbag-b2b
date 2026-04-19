import { requireAdmin } from "@/lib/auth";
import { formatOrder, formatPriceFromCents } from "@/lib/api/format";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req);

  if (error) {
    return error;
  }

  const [products, orders, customers, recentOrders, lowStockProducts] = await Promise.all([
    prisma.product.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        status: true,
        stockType: true,
        stockQuantity: true,
      },
    }),
    prisma.order.findMany({
      select: {
        status: true,
        totalAmountCents: true,
        createdAt: true,
      },
    }),
    prisma.customer.findMany({ select: { status: true } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { id: "desc" },
      include: {
        customer: true,
        items: { include: { product: true } },
      },
    }),
    prisma.product.findMany({
      where: {
        status: "Aktif",
        stockType: "quantity",
        stockQuantity: { lte: 10 },
      },
      take: 6,
      orderBy: [{ stockQuantity: "asc" }, { id: "desc" }],
      select: {
        id: true,
        name: true,
        category: true,
        stockQuantity: true,
      },
    }),
  ]);

  const completedOrders = orders.filter((order) => order.status === "Teslim Edildi");
  const rejectedOrders = orders.filter((order) => order.status === "Reddedildi");
  const activeRevenueCents = orders
    .filter((order) => order.status !== "Reddedildi")
    .reduce((sum, order) => sum + order.totalAmountCents, 0);
  const completedRevenueCents = completedOrders.reduce(
    (sum, order) => sum + order.totalAmountCents,
    0
  );

  return NextResponse.json({
    totalProducts: products.length,
    activeProducts: products.filter((product) => product.status === "Aktif").length,
    passiveProducts: products.filter((product) => product.status === "Pasif").length,
    totalOrders: orders.length,
    pendingOrders: orders.filter((order) => order.status === "Beklemede").length,
    completedOrders: completedOrders.length,
    rejectedOrders: rejectedOrders.length,
    activeRevenueCents,
    activeRevenueDisplay: formatPriceFromCents(activeRevenueCents),
    completedRevenueCents,
    completedRevenueDisplay: formatPriceFromCents(completedRevenueCents),
    totalCustomers: customers.length,
    activeCustomers: customers.filter((customer) => customer.status === "Aktif").length,
    lowStockProducts,
    recentOrders: recentOrders.map(formatOrder),
  });
}
