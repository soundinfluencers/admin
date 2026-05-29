import React from "react";
import { invoiceFormatDate } from "@/features/edit-invoice/model/edit-invoice.libs.ts";

import logo from '@/assets/img/logo.png';

import s from './invoice-header.module.scss';

interface InvoiceHeaderProps {
  invoiceNumber: string;
  date: string;
}

export const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({
  invoiceNumber,
  date,
}) => {
  return (
    <div className={s.header}>
      <img
        src={logo}
        alt="Company Logo"
        className={s.logo}
        loading="lazy"
        width={240}
        height={24}
      />

      <div className={s.info}>
        <div className={s.invoiceNumber}>
          <span className={s.label}>Invoice</span>
          <span className={s.number}>No. {invoiceNumber}</span>
        </div>

        <div className={s.date}>{invoiceFormatDate(date)}</div>
      </div>
    </div>
  );
};


