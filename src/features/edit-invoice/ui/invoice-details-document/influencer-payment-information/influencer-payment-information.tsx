import React from "react";

import type { TPaymentMethod } from "@/shared/types/types.ts";
import type { IPaymentDetailsDto } from "@/entities/invoices/influencer-invoice/model/influencer-invoice.types.ts";

import { PaymentField } from "./payment-field/payment-field.tsx";
import { getPaymentMethodConfig } from "./payment-method-config/payment-method-config.ts";
import s from './influencer-payment-information.module.scss';

interface InfluencerPaymentInformationProps {
  paymentDetails?: IPaymentDetailsDto;
  paymentMethod?: TPaymentMethod;
}

export const InfluencerPaymentInformation: React.FC<InfluencerPaymentInformationProps> = ({
  paymentDetails,
  paymentMethod,
}) => {
  const config = paymentMethod && paymentDetails
    ? getPaymentMethodConfig(paymentMethod, paymentDetails)
    : null;

  return (
    <div className={s.root}>
      <span className={s.title}>Payment Information</span>

      {config && (
        <div className={s.content}>
          <span className={s.methodTitle}>{config.title}:</span>
          {config.fields.map((field) => (
            <PaymentField key={field.label} {...field} />
          ))}
        </div>
      )}
    </div>
  );
};
