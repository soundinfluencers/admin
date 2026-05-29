import React, { useState } from 'react';
import { EditInvoiceModal } from "@/features/edit-invoice/ui";
import clsx from "clsx";

import Eye from '@/assets/icons/eye.svg?react';

import type { IPaymentDetailsDto } from "@/entities/invoices/influencer-invoice/model/influencer-invoice.types.ts";
import type { TPaymentMethod } from "@/shared/types/types.ts";

import s from './edit-invoice-trigger.module.scss';

interface EditInvoiceTriggerProps {
  invoiceId: string;
  shortInvoiceId: string;
  role: "influencer" | "client";
  paymentDetails?: IPaymentDetailsDto;
  paymentMethod?: TPaymentMethod;
  className?: string;
}

export const EditInvoiceTrigger: React.FC<EditInvoiceTriggerProps> = ({
  invoiceId,
  shortInvoiceId,
  role,
  paymentDetails,
  paymentMethod,
  className,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={clsx(s.btn, className)}
        onClick={() => setIsModalOpen(true)}
        aria-label={`Edit invoice ${invoiceId}`}
      >
        <Eye className={s.icon} width={18} height={18} />
      </button>

      {isModalOpen && (
        <EditInvoiceModal
          invoiceId={invoiceId}
          shortInvoiceId={shortInvoiceId}
          paymentDetails={paymentDetails}
          paymentMethod={paymentMethod}
          role={role}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};
