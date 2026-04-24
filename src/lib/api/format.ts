import type { OrderStatus, RecordStatus, StockType, UserRole } from "@/lib/domain";
import { formatAmountFromCents, formatCurrencyFromCents } from "@/lib/money";
import { calculateLinePricing } from "@/lib/pricing";

type ProductLike = {
  id: number;
  name: string;
  category: string;
  price: string;
  priceCents: number;
  vatRate: number;
  stockType: StockType | string;
  stockQuantity: number | null;
  description: string | null;
  image: string | null;
  status: RecordStatus | string;
};

type CustomerLike = {
  id: number;
  company: string;
  contactName: string;
  phone: string;
  address: string;
  taxOffice: string;
  taxNumber: string;
  status: RecordStatus | string;
  user: {
    username: string;
    role: UserRole | string;
  };
};

export function parsePriceCents(price: string) {
  const cleaned = String(price).replace(/[^\d]/g, "");
  return Number(cleaned) || 0;
}

export function formatPriceFromCents(cents: number) {
  return formatAmountFromCents(cents);
}

export function formatProduct(product: ProductLike) {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    price: product.price,
    priceCents: product.priceCents,
    priceDisplay: formatCurrencyFromCents(product.priceCents),
    vatRate: product.vatRate,
    stockType: product.stockType,
    stockQuantity: product.stockQuantity,
    description: product.description ?? "",
    image: product.image ?? "",
    imageUrl: product.image ?? "",
    status: product.status,
  };
}

export function formatCustomer(customer: CustomerLike) {
  return {
    id: customer.id,
    company: customer.company,
    contactName: customer.contactName,
    phone: customer.phone,
    address: customer.address,
    taxOffice: customer.taxOffice,
    taxNumber: customer.taxNumber,
    username: customer.user.username,
    password: "",
    role: customer.user.role,
    status: customer.status,
  };
}

export function formatOrder(order: {
  id: number;
  status: OrderStatus | string;
  subtotalCents: number;
  totalVatCents: number;
  totalAmount: string;
  totalAmountCents: number;
  paymentMethod: string;
  note: string | null;
  createdAt: Date;
  customer: { company: string };
  items: Array<{
    id: number;
    quantity: number;
    price: string;
    priceCents: number;
    productNameSnapshot: string;
    productCategorySnapshot: string;
    vatRate: number;
    vatAmountCents: number;
    lineSubtotalCents: number;
    lineTotalCents: number;
    product: {
      id: number;
      name: string;
      category: string;
    } | null;
  }>;
}) {
  return {
    id: order.id,
    company: order.customer.company,
    items: order.items.map((item) => ({
      id: item.product?.id ?? item.id,
      name: item.productNameSnapshot || item.product?.name || "Silinmiş Ürün",
      category: item.productCategorySnapshot || item.product?.category || "",
      price: item.price,
      priceCents: item.priceCents,
      priceDisplay: formatCurrencyFromCents(item.priceCents),
      quantity: item.quantity,
      vatRate: item.vatRate,
      vatAmount: item.vatAmountCents,
      vatAmountDisplay: formatCurrencyFromCents(item.vatAmountCents),
      lineSubtotal: item.lineSubtotalCents,
      lineSubtotalDisplay: formatCurrencyFromCents(item.lineSubtotalCents),
      lineTotal: item.lineTotalCents,
      lineTotalDisplay: formatCurrencyFromCents(item.lineTotalCents),
    })),
    status: order.status,
    createdAt: order.createdAt.toLocaleString("tr-TR"),
    subtotal: order.subtotalCents,
    subtotalDisplay: formatCurrencyFromCents(order.subtotalCents),
    totalVat: order.totalVatCents,
    totalVatDisplay: formatCurrencyFromCents(order.totalVatCents),
    totalAmount: order.totalAmountCents,
    totalAmountDisplay: formatCurrencyFromCents(order.totalAmountCents),
    paymentMethod: order.paymentMethod,
    note: order.note ?? "",
  };
}

export function formatCartItem(item: {
  id: number;
  quantity: number;
  product: ProductLike;
}) {
  const product = formatProduct(item.product);
  const pricing = calculateLinePricing({
    unitPriceCents: product.priceCents,
    quantity: item.quantity,
    vatRate: product.vatRate,
  });

  return {
    ...product,
    cartItemId: item.id,
    quantity: item.quantity,
    vatAmount: pricing.vatAmountCents,
    vatAmountDisplay: formatCurrencyFromCents(pricing.vatAmountCents),
    lineSubtotal: pricing.lineSubtotalCents,
    lineSubtotalDisplay: formatCurrencyFromCents(pricing.lineSubtotalCents),
    lineTotal: pricing.lineTotalCents,
    lineTotalDisplay: formatCurrencyFromCents(pricing.lineTotalCents),
  };
}
