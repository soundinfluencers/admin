import type { IInvoiceDetails, IInvoiceTableRowDto } from "@/entities/invoices/model/influencer-invoices.types.ts";
import type { IInvoice } from "@/entities/campaign-invoice/model/invoice.types.ts";
import { parseInvoiceAddress } from "@/features/influencer-invoices/model/influencer-invoices.helpers.ts";

export const normalizeInvoiceToPreview = (
  invoiceRow: IInvoiceTableRowDto,
  invoice: IInvoice,
): IInvoiceDetails | undefined => {
  const paymentDetails = invoiceRow.paymentDetails;

  const { addressLine1, addressLine2, postcode } = parseInvoiceAddress(invoice.address);

  const baseInvoice: IInvoiceDetails = {
    invoiceNo: invoice.invoiceId,
    date: invoice.creationDate,
    from: {
      fullName: invoice.fullName,
      addressLine1: addressLine1,
      addressLine2: addressLine2,
      postcode: postcode,
      contactName: invoice.fullName,
    },
    billTo: {
      companyName: invoiceRow.username.toUpperCase(),
      chamberOfCommerce: "10458319",
      email: "admin@soundinfluencers.com",
      phoneNumber: "+44 7537 129190",
      address: "124 City Road, EC1V 2NX, London, England - UK",
    },
    summary: {
      // description: `${invoiceRow.username}`,
      total: invoice.amount,
      subtotal: invoice.amount,
      balanceDue: invoice.amount,
      currency: paymentDetails?.bankAccountCurrency ?? "EUR",
    },
    selectedPaymentMethod: invoiceRow.paymentMethod,
    paymentTerms: "Within 7 business days",
  };

  if (invoiceRow.paymentMethod === "paypal") {
    return {
      ...baseInvoice,
      paypalEmail: paymentDetails.paypalEmail ?? "",
    };
  }

  return {
    ...baseInvoice,
    bankDetails: {
      bankName: paymentDetails?.bankName ?? "",
      beneficiary: paymentDetails?.beneficiary ?? "",
      beneficiaryAddress: paymentDetails?.beneficiaryAddress ?? "",
      bankCountry: paymentDetails?.bankCountry ?? "",
      sortCode: paymentDetails?.sortCode ?? "",
      accountNumber: paymentDetails?.accountNumber ?? "",
      iban: paymentDetails?.iban ?? "",
      swiftBicCode: paymentDetails?.swiftBicCode ?? "",
    },
  };
};
