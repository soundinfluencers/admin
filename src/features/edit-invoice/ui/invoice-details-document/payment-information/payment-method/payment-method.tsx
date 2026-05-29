import React from "react";
import clsx from "clsx";
import { STATIC_PAYMENT_METHODS, type TPaymentMethod } from "@/features/edit-invoice/model/edit-invoice.constants.ts";

import s from './payment-method.module.scss';

interface PaymentMethodProps {
  method: TPaymentMethod;
}

export const PaymentMethod: React.FC<PaymentMethodProps> = ({ method }) => {
  const { title, icon: Icon, fields } = STATIC_PAYMENT_METHODS[method];

  return (
    <div className={clsx({
      [s.bankTransferCard]: method === 'bankTransfer',
      [s.card]: method !== 'bankTransfer',
    })}>
      <div className={clsx({
        [s.bankTransferMethod]: method === 'bankTransfer',
        [s.method]: method !== 'bankTransfer',
      })}>
        <Icon
          className={clsx({
            [s.bankTransferIcon]: method === 'bankTransfer',
            [s.icon]: method !== 'bankTransfer',
          })}
          width={24}
          height={24}
        />
        <span>{title} details:</span>
      </div>

      <div className={s.info}>
        {fields.map((field) => (
          <div
            key={field.label}
            className={clsx({
              [s.bankTransferValue]: method === 'bankTransfer',
              [s.value]: method !== 'bankTransfer',
            })}
          >
            <span className={s.label}>{field.label}</span>
            <span className={s.text}>{field.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
