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

export interface IInvoicePartyDetails {
  fullName: string;
  addressLine1: string;
  addressLine2: string;
  // country: string;
  postcode: string;
  contactName: string;
}

export interface IBillToDetails {
  companyName: string;
  chamberOfCommerce: string;
  email: string;
  phoneNumber: string;
  address: string;
}

export interface IInvoiceSummaryDetails {
  // description: string;
  total: number;
  subtotal: number;
  balanceDue: number;
  currency: TCurrency;
}

export interface IInvoiceBankDetails {
  bankName?: string;
  beneficiary?: string;
  beneficiaryAddress?: string;
  bankCountry?: string;
  sortCode?: string;
  accountNumber?: string;
  iban?: string;
  swiftBicCode?: string;
}

export interface IInvoiceDetails {
  invoiceNo: string;
  date: string;

  from: IInvoicePartyDetails;
  billTo: IBillToDetails;
  summary: IInvoiceSummaryDetails;

  selectedPaymentMethod: TPaymentMethod;
  paymentTerms: string;

  bankDetails?: IInvoiceBankDetails;
  paypalEmail?: string;
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
