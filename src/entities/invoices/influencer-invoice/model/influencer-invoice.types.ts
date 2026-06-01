import type { TSocialMediaValue } from "@/entities/influencers/model/influencers.constants.ts";
import type { TCurrency, TPaymentMethod } from "@/shared/types/types.ts";

export type TInvoiceStatus = "submitted" | "paid";

export interface IPaymentDetailsDto {
  bankAccountCurrency?: TCurrency;
  bankCountry?: string;
  bankName?: string;
  beneficiary?: string;
  beneficiaryAddress?: string;
  iban?: string;
  swiftBicCode?: string;
  paypalEmail?: string;
  accountNumber?: string;
  sortCode?: string;
}

export interface IInvoiceTableRowDto {
  invoiceId: string;
  shortInvoiceId: string;
  firstName: string;
  lastName: string;
  socialMedia: TSocialMediaValue;
  username: string;
  date: string;
  influencerAmount: number;
  amountInEur: number;
  paymentMethod: TPaymentMethod;
  status: TInvoiceStatus;
  isPaid: boolean;
  paymentDetails: IPaymentDetailsDto;
}

// Params for getting influencers invoices list
export type TGetInfluencersInvoicesParams =
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

export interface IInfluencersInvoicesListPayload {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  items: IInvoiceTableRowDto[];
}

export interface IInfluencersInvoicesListResponse {
  statusCode: number;
  message: string;
  data: IInfluencersInvoicesListPayload;
}
