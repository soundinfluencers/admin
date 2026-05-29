import type { IPaymentDetailsDto } from "@/entities/invoices/influencer-invoice/model/influencer-invoice.types.ts";
import type { TPaymentMethod } from "@/shared/types/types.ts";

interface PaymentFieldConfig {
  label: string;
  value?: string;
}

export type PaymentMethodConfig = {
  title: string;
  fields: PaymentFieldConfig[];
};

export const getPaymentMethodConfig = (
  method: TPaymentMethod,
  details: IPaymentDetailsDto,
): PaymentMethodConfig | null => {
  switch (method) {
    case "internationalBankTransfer":
      return {
        title: "Bank transfer",
        fields: [
          { label: "Beneficiary", value: details.beneficiary },
          { label: "Beneficiary address", value: details.beneficiaryAddress },
          { label: "IBAN", value: details.iban },
          { label: "Bank Name", value: details.bankName },
          { label: "Bank country", value: details.bankCountry },
          { label: "Bank account currency", value: details.bankAccountCurrency },
          { label: "SWIFT / BIC", value: details.swiftBicCode },
        ],
      };
    case "ukBankTransfer":
      return {
        title: "UK Bank Transfer",
        fields: [
          { label: "Beneficiary", value: details.beneficiary },
          { label: "Beneficiary address", value: details.beneficiaryAddress },
          { label: "Sort code", value: details.sortCode },
          { label: "Account number", value: details.accountNumber },
        ],
      };
    case "paypal":
      return {
        title: "PayPal",
        fields: [
          { label: "PayPal email", value: details.paypalEmail },
        ],
      };
    default:
      return null;
  }
};

