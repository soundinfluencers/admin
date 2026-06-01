import React from "react";
import { FromToClient } from "@/features/edit-invoice/ui/invoice-details-document/from-to-client/from-to-client";
import { FromToInfluencer } from "@/features/edit-invoice/ui/invoice-details-document/from-to-influencer/from-to-influencer";
import type { IInvoice } from "@/entities/invoices/model/invoice.types.ts";

import s from './invoice-parties.module.scss';

interface InvoicePartiesProps {
  invoice: IInvoice;
  role: "client" | "influencer";
}

export const InvoiceParties: React.FC<InvoicePartiesProps> = ({ invoice, role }) => {
  return (
    <div className={s.invoiceParties}>
      {role === "client" && <FromToClient invoice={invoice} />}
      {role === "influencer" && <FromToInfluencer invoice={invoice} />}
    </div>
  );
};
