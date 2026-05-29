import type {
  IPaymentDetailsDto,
  TInvoiceStatus,
} from "@/entities/invoices/influencer-invoice/model/influencer-invoice.types.ts";
import type { TPaymentMethod } from "@/shared/types/types.ts";

export const INFLUENCER_INVOICES_STATUS_LABEL: Record<TInvoiceStatus, string> = {
  submitted: "Submitted",
  paid: "Paid",
};

export const getPaymentDetailsLabel = (
  paymentMethod: TPaymentMethod,
  paymentDetails: IPaymentDetailsDto
) => {
  switch (paymentMethod) {
    case "internationalBankTransfer":
      return paymentDetails.iban;
    case "ukBankTransfer":
      return paymentDetails.accountNumber;
    case "paypal":
      return paymentDetails.paypalEmail;
    default:
      return '—';
  }
};
