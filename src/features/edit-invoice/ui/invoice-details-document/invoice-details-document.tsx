import React from "react";
import {
  InvoiceBalance,
  InvoiceHeader,
  InvoiceItemsTable,
  InvoiceParties,
  PaymentInformation,
  InfluencerPaymentInformation,
} from "@/features/edit-invoice/ui";
import type { IInvoice } from "@/entities/invoices/model/invoice.types.ts";
import type { IPaymentDetailsDto } from "@/entities/invoices/influencer-invoice/model/influencer-invoice.types.ts";
import type { TPaymentMethod } from "@/shared/types/types.ts";

import s from './invoice-details-document.module.scss';

interface InvoiceDetailsDocumentProps {
  data: IInvoice;
  role: "influencer" | "client";
  shortInvoiceNumber: string;
  paymentDetails?: IPaymentDetailsDto;
  paymentMethod?: TPaymentMethod;
}

export const InvoiceDetailsDocument: React.FC<InvoiceDetailsDocumentProps> = ({
  data,
  role,
  paymentDetails,
  paymentMethod,
  shortInvoiceNumber,
}) => {
  return (
    <div className={s.root}>
      <InvoiceHeader
        invoiceNumber={shortInvoiceNumber}
        date={data.creationDate}
      />

      <div className={s.content}>
        <InvoiceParties invoice={data} role={role} />

        <InvoiceBalance balance={data.amount}/>

        {role === "client" && (
          <>
            <InvoiceItemsTable invoice={data}/>

            <PaymentInformation/>
          </>
        )}

        {role === "influencer" && (
          <InfluencerPaymentInformation paymentDetails={paymentDetails} paymentMethod={paymentMethod}/>
        )}
      </div>
    </div>
  );
};
