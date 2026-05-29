import React from "react";
import clsx from "clsx";
import { STATIC_COMPANY_INFO } from "@/features/edit-invoice/model/edit-invoice.constants.ts";
import { toFields } from "@/features/edit-invoice/model/edit-invoice.config.tsx";
import type { IInvoice } from "@/entities/invoices/model/invoice.types.ts";

import s from './from-to-client.module.scss';

interface FromToClientProps {
  invoice: IInvoice;
}

export const FromToClient: React.FC<FromToClientProps> = ({ invoice }) => {
  return (
    <>
      <div className={s.from}>
        <span className={s.title}>From:</span>

        <div className={s.list}>
          {STATIC_COMPANY_INFO.map((item, index) => {
            if (item.type === "text") {
              return (
                <span key={index} className={clsx(s.label, { [s.blockTitle]: index === 0 })}>
                  {item.text}
                </span>
              );
            }

            const Icon = item.icon;

            return (
              <span key={index} className={s.contacts}>
                <div className={s.contactLabel}>
                  <Icon className={s.icon} width={14} height={14} />
                  <span>{item.label}</span>
                </div>
                <span className={s.contact}>{item.value}</span>
              </span>
            );
          })}
        </div>
      </div>

      <div className={s.to}>
        <span className={s.title}>To:</span>

        <div className={clsx(s.list, s.listTo)}>
          {toFields.map((field) => {
            const value = invoice[field.key];

            return (
              <span key={field.key} className={clsx(s.label, { [s.blockTitle]: value === invoice.company })}>
                {field.render ? field.render(invoice, false) : null}
              </span>
            );
          })}
        </div>
      </div>
    </>
  );
};

