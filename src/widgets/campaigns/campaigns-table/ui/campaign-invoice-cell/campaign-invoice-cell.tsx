import React from "react";
import { EditInvoiceTrigger } from "@/features/edit-invoice";

import s from './campaign-invoice-cell.module.scss';

interface CampaignInvoiceProps {
  invoiceId: string;
  shortInvoiceNumber: number;
}

export const CampaignInvoiceCell: React.FC<CampaignInvoiceProps> = ({
  invoiceId,
  shortInvoiceNumber,
}) => {
  return (
    <div className={s.campaignInvoiceCell}>
      {invoiceId ? (
        <EditInvoiceTrigger
          invoiceId={invoiceId}
          role={"client"}
          shortInvoiceId={String(shortInvoiceNumber)}
        />
        ) : (
        <span className={s.text}>{"—"}</span>
      )}
    </div>
  );
};

