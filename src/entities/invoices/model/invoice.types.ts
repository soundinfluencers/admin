import type { TCurrency } from "@/shared/types/types.ts";

export interface IInvoice {
  invoiceId: string;
  creationDate: string;
  amount: number;
  currency: TCurrency;
  status: "submitted";
  fullName: string;
  country: string;
  address: string;
  campaignName: string;
  campaignFollowers: number;
  company: string;
  poNumber: string;
  vatNumber: string;
}

export interface IInvoiceResponse {
  statusCode: number;
  message: string;
  data: IInvoice;
}
