import type { TInvoiceStatus } from "@/entities/invoices/client-invoice/model/client-invoice.types.ts";

export const INVOICE_STATUS_LABELS = {
  submitted: 'Submitted',
  paid: 'Paid',
} as const satisfies Record<TInvoiceStatus, string>;
