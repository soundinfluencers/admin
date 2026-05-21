import React from 'react';
import {
  InvoicePreviewBankDetails,
  InvoicePreviewBillTo,
  InvoicePreviewHeader, InvoicePreviewPaypalDetails,
  InvoicePreviewSummary, InvoiceRow,
} from "@/widgets/influencer-invoices/invoice-preview";
import { PAYMENT_METHOD_LABELS } from "@/shared/libs/normalize/payment-method.normalize.ts";
import type { IInvoiceDetails } from "@/entities/invoices/model/influencer-invoices.types.ts";

import s from './invoice-preview.module.scss';
import type { TPaymentMethod } from "@/shared/types/types.ts";

interface InvoicePreviewProps {
  invoiceDetails: IInvoiceDetails;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({
  invoiceDetails,
}) => {

  const paymentMethodKey = invoiceDetails.selectedPaymentMethod.toLowerCase() as TPaymentMethod;

  const paymentMethodLabel = PAYMENT_METHOD_LABELS[paymentMethodKey];

  return (
    <div className={s.layout}>

      <InvoicePreviewHeader invoiceDetails={invoiceDetails}/>

      <div className={s.content}>
        <InvoicePreviewBillTo invoiceDetails={invoiceDetails} sectionClassName={s.section}/>

        <InvoicePreviewSummary invoiceDetails={invoiceDetails} sectionClassName={s.section}/>

        <InvoiceRow
          label="Selected Payment Method:"
          value={paymentMethodLabel}
          labelWeight="medium"
        />

        <InvoicePreviewBankDetails invoiceDetails={invoiceDetails} sectionClassName={s.section}/>

        <InvoicePreviewPaypalDetails invoiceDetails={invoiceDetails}/>

        <InvoiceRow
          label="Payment terms:"
          value={invoiceDetails.paymentTerms}
          labelWeight="medium"
        />
      </div>
    </div>
  );
};
