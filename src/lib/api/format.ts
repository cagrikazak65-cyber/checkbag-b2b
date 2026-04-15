import type { OrderStatus, RecordStatus, StockType, UserRole } from "@/lib/domain";

type ProductLike = {
  id: number;
  name: string;
  category: string;
  price: string;
  priceCents: number;
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
  return (cents / 100).toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatProduct(product: ProductLike) {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    price: product.price,
    priceCents: product.priceCents,
    stockType: product.stockType,
    stockQuantity: product.stockQuantity,
    description: product.description ?? "",
    image: product.image ?? "",
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
  totalAmount: string;
  totalAmountCents: number;
  paymentMethod: string;
  note: string | null;
  createdAt: Date;
  customer: { company: string };
  items: Array<{
    quantity: number;
    price: string;
    priceCents: number;
    product: {
      id: number;
      name: string;
      category: string;
    };
  }>;
}) {
  return {
    id: order.id,
    company: order.customer.company,
    items: order.items.map((item) => ({
      id: item.product.id,
      name: item.product.name,
      category: item.product.category,
      price: item.price,
      priceCents: item.priceCents,
      quantity: item.quantity,
    })),
    status: order.status,
    createdAt: order.createdAt.toLocaleString("tr-TR"),
    totalAmount: order.totalAmountCents,
    totalAmountDisplay: formatPriceFromCents(order.totalAmountCents),
    paymentMethod: order.paymentMethod,
    note: order.note ?? "",
  };
}
