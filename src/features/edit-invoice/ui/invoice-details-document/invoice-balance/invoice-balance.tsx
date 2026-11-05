import React from "react";
import { formatCurrency } from "@/shared/libs/format/format-currency.ts";
import type { TCurrency } from "@/shared/types/types.ts";

import s from './invoice-balance.module.scss';

interface InvoiceBalanceProps {
  balance: number;
  currency: TCurrency;
}

export const InvoiceBalance: React.FC<InvoiceBalanceProps> = ({ balance, currency }) => {
  return (
    <div className={s.container}>
      <div className={s.top}>
        <span className={s.label}>Balance Due</span>
        <span className={s.receipt}>Upon Receipt</span>
      </div>

      <div className={s.bottom}>
        <span className={s.total}>Total Due:</span>
        <span className={s.balance}>{formatCurrency(balance, currency)}</span>
      </div>
    </div>
  );
};
