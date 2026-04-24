export const USER_ROLES = ["admin", "customer"] as const;
export const RECORD_STATUSES = ["Aktif", "Pasif"] as const;
export const STOCK_TYPES = ["quantity", "ask"] as const;
export const ORDER_STATUSES = [
  "Beklemede",
  "Onaylandi",
  "Reddedildi",
  "Sevk Edildi",
  "Teslim Edildi",
] as const;

export type UserRole = (typeof USER_ROLES)[number];
export type RecordStatus = (typeof RECORD_STATUSES)[number];
export type StockType = (typeof STOCK_TYPES)[number];
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export function parseRecordStatus(value: unknown): RecordStatus {
  return value === "Pasif" ? "Pasif" : "Aktif";
}

export function parseStockType(value: unknown): StockType {
  return value === "ask" ? "ask" : "quantity";
}

export function parseVatRate(value: unknown) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return 20;
  }

  return Math.min(100, Math.max(0, Math.round(parsed)));
}

export function isOrderStatus(value: unknown): value is OrderStatus {
  return ORDER_STATUSES.includes(value as OrderStatus);
}

export function isUserRole(value: unknown): value is UserRole {
  return USER_ROLES.includes(value as UserRole);
}

export function isRecordStatus(value: unknown): value is RecordStatus {
  return RECORD_STATUSES.includes(value as RecordStatus);
}
