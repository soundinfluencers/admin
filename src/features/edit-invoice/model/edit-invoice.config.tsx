import React from "react";
import { InvoiceDetailsEditableField } from "@/features/edit-invoice/ui";
import type { IInvoice } from "@/entities/invoices/model/invoice.types.ts";

export type TToField<T> = {
  key: keyof T;
  render?: (data: T, isDisabled?: boolean) => React.ReactNode;
}

export const toFields = [
  {
    key: "company",
    render: (data, isDisabled) => (
      <InvoiceDetailsEditableField
        initialValue={data.company || data.fullName}
        invoiceId={data.invoiceId}
        fieldKey="company"
        isDisabled={isDisabled}
      />
    ),
  },
  {
    key: "address",
    render: (data, isDisabled) => (
      <InvoiceDetailsEditableField
        initialValue={data.address}
        invoiceId={data.invoiceId}
        fieldKey="address"
        isDisabled={isDisabled}
      />
    ),
  },
  {
    key: "country",
    render: (data, isDisabled) => (
      <InvoiceDetailsEditableField
        initialValue={data.country}
        invoiceId={data.invoiceId}
        fieldKey="country"
        isDisabled={isDisabled}
      />
    )
  },
  {
    key: "vatNumber",
    render: (data, isDisabled) => (
      <InvoiceDetailsEditableField
        initialValue={data.vatNumber}
        invoiceId={data.invoiceId}
        fieldKey="vatNumber"
        isDisabled={isDisabled}
      />
    )
  },
] satisfies TToField<IInvoice>[];
