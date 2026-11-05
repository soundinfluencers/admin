import type { IInvoice } from "@/entities/invoices/model/invoice.types.ts";

export type TInvoiceEditableFields = Pick<
  IInvoice,
  "country" | "address" | "company" | "poNumber" | "vatNumber" | "amount" | "currency"
>;

export type TInvoiceEditableKey = keyof TInvoiceEditableFields;
