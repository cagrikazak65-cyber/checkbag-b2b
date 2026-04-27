type PricingInput = {
  unitPriceCents: number;
  quantity: number;
  vatRate: number;
};

export type PricingSummary = {
  quantity: number;
  unitPriceCents: number;
  vatRate: number;
  lineSubtotalCents: number;
  vatAmountCents: number;
  lineTotalCents: number;
};

export function calculateLinePricing({
  unitPriceCents,
  quantity,
  vatRate,
}: PricingInput): PricingSummary {
  const lineSubtotalCents = unitPriceCents * quantity;
  const vatAmountCents = Math.round((lineSubtotalCents * vatRate) / 100);

  return {
    quantity,
    unitPriceCents,
    vatRate,
    lineSubtotalCents,
    vatAmountCents,
    lineTotalCents: lineSubtotalCents + vatAmountCents,
  };
}

export function calculateOrderPricing(items: PricingSummary[]) {
  return items.reduce(
    (totals, item) => ({
      subtotalCents: totals.subtotalCents + item.lineSubtotalCents,
      totalVatCents: totals.totalVatCents + item.vatAmountCents,
      grandTotalCents: totals.grandTotalCents + item.lineTotalCents,
    }),
    {
      subtotalCents: 0,
      totalVatCents: 0,
      grandTotalCents: 0,
    }
  );
}
