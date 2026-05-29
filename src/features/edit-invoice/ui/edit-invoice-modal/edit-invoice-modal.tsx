import React from "react";
import { Modal } from "@/shared/ui";
import { useInvoiceQuery } from "@/entities/invoices/api/invoice.queries.ts";
import { InvoiceDetailsDocument } from "@/features/edit-invoice/ui";
import { InvoiceDetailsSkeleton } from "../invoice-details-skeleton/invoice-details-skeleton.tsx";
import type { IPaymentDetailsDto } from "@/entities/invoices/influencer-invoice/model/influencer-invoice.types.ts";
import type { TPaymentMethod } from "@/shared/types/types.ts";

import s from './edit-invoice-modal.module.scss';

interface EditInvoiceModalProps {
  invoiceId: string;
  role: "influencer" | "client";
  paymentDetails?: IPaymentDetailsDto;
  paymentMethod?: TPaymentMethod;
  shortInvoiceId: string;
  onClose?: () => void;
}

export const EditInvoiceModal: React.FC<EditInvoiceModalProps> = ({
  invoiceId,
  role,
  paymentDetails,
  paymentMethod,
  shortInvoiceId,
  onClose,
}) => {
  const { data, isPending, isFetching, isError } = useInvoiceQuery(invoiceId);

  const isLoading = isPending || isFetching;

  return (
    <Modal
      onClose={onClose}
      className={s.modal}
      contentClassName={s.content}
      isShownCloseButton
    >
      {isLoading && <InvoiceDetailsSkeleton role={role}/>}

      {!isLoading && isError && <div>Couldn't load invoice. Please refresh the page.</div>}

      {!isLoading && data && (
        <InvoiceDetailsDocument
          data={data}
          paymentDetails={paymentDetails}
          paymentMethod={paymentMethod}
          shortInvoiceNumber={shortInvoiceId}
          role={role}
        />
      )}
    </Modal>
  );
};
