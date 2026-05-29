import React from "react";

import s from './invoice-balance.module.scss';

interface InvoiceBalanceProps {
  balance: number;
}

export const InvoiceBalance: React.FC<InvoiceBalanceProps> = ({ balance }) => {
  return (
    <div className={s.container}>
      <div className={s.top}>
        <span className={s.label}>Balance Due</span>
        <span className={s.receipt}>Upon Receipt</span>
      </div>

      <div className={s.bottom}>
        <span className={s.total}>Total Due:</span>
        <span className={s.balance}>{balance}€</span>
      </div>
    </div>
  );
};
