import type { IInvoice } from "@/entities/invoices/model/invoice.types.ts";

export type TInvoiceStatus = "submitted" | "paid";

// Invoices list
export interface IClientInvoiceTableRowDto {
  invoiceId: string;
  shortInvoiceId: string;
  company: string;
  campaignName: string;
  date: string;
  amount: number;
  status: TInvoiceStatus;
}

export type TGetClientsInvoicesParams =
  {
    search: string;
    page?: never;
    limit?: never;
  }
  |
  {
    page: number;
    limit: number;
    search?: never;
  };

export interface IClientsInvoicesListPayload {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  items: IClientInvoiceTableRowDto[];
}

export interface IClientsInvoicesListResponse {
  statusCode: number;
  message: string;
  data: IClientsInvoicesListPayload;
}

// Update Invoice fields
export type TUpdateInvoiceDto = Partial<
  Pick<
    IInvoice,
    "country" | "address" | "company" | "poNumber" | "vatNumber"
  >
>;

export interface IUpdateClientInvoiceRequest {
  invoiceId: string;
  dto: TUpdateInvoiceDto;
}

export interface IUpdateClientInvoiceResponse {
  statusCode: number;
  message: string;
  data: IInvoice;
}
