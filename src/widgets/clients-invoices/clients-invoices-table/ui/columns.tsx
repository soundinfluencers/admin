import type { ColumnDef } from "@tanstack/react-table";
import { BaseTableCell } from "@/shared/ui";
import { INVOICE_STATUS_LABELS } from "@/widgets/clients-invoices/clients-invoices-table/model/client-invoice.helpers.ts";
import { DownloadInvoicePdf } from "@/features/download-invoice-pdf/download-invoice-pdf.tsx";
import { EditInvoiceTrigger } from "@/features/edit-invoice";
import { formatCurrency } from "@/shared/libs/format/format-currency.ts";
import type { IClientInvoiceTableRowDto } from "@/entities/invoices/client-invoice/model/client-invoice.types.ts";

import s from './clients-invoices-table.module.scss';

export const CLIENTS_INVOICES_COLUMNS: ColumnDef<IClientInvoiceTableRowDto>[] = [
  {
    header: "Invoice ID",
    accessorKey: "invoiceId",
    size: 188,
    minSize: 70,
    maxSize: 188,
    cell: ({ row }) => (
      <BaseTableCell>
       <span
         className={s.text}
         title={row.original.invoiceId}
       >
         {row.original.invoiceId}
       </span>
      </BaseTableCell>
    ),
  },
  {
    header: "Reference ID",
    accessorKey: "referenceNumber",
    size: 123,
    minSize: 110,
    maxSize: 123,
    cell: ({ row }) => (
      <BaseTableCell>
       <span
         className={s.text}
         title={row.original.referenceNumber}
       >
         {row.original.referenceNumber}
       </span>
      </BaseTableCell>
    ),
  },
  {
    header: "Company",
    accessorKey: "company",
    size: 110,
    minSize: 110,
    maxSize: 110,
    cell: ({ row }) => (
      <BaseTableCell>
       <span
         className={s.text}
         title={row.original.company}
       >
         {row.original.company ? row.original.company : "—"}
       </span>
      </BaseTableCell>
    ),
  },
  {
    header: "Campaign name",
    accessorKey: "campaignName",
    size: 290,
    minSize: 203,
    maxSize: 290,
    cell: ({ row }) => (
      <BaseTableCell>
       <span
        className={s.text}
        title={row.original.campaignName}
       >
         {row.original.campaignName ? row.original.campaignName : "—"}
       </span>
      </BaseTableCell>
    ),
  },
  {
    header: "Date",
    accessorKey: "date",
    size: 105,
    minSize: 74,
    maxSize: 105,
    cell: ({ row }) => (
      <BaseTableCell>
        {row.original.date}
      </BaseTableCell>
    ),
  },
  {
    header: "Amount",
    accessorKey: "amount",
    size: 115,
    minSize: 66,
    maxSize: 115,
    cell: ({ row }) => (
      <BaseTableCell>
        {row.original.amount ? formatCurrency(row.original.amount, row.original.currency) : "—"}
      </BaseTableCell>
    ),
  },
  {
    header: "Actions",
    id: "actions",
    size: 120,
    minSize: 113,
    maxSize: 120,
    cell: ({ row }) => (
      <BaseTableCell className={s.cell}>
        <EditInvoiceTrigger
          invoiceId={row.original.invoiceId}
          role={"client"}
          shortInvoiceId={row.original.shortInvoiceId}
        />
        <DownloadInvoicePdf invoiceId={row.original.invoiceId}/>
      </BaseTableCell>
    ),
  },
  {
    header: "Status",
    accessorKey: "status",
    size: 136,
    minSize: 106,
    maxSize: 136,
    cell: ({ row }) => (
      <BaseTableCell>
        {INVOICE_STATUS_LABELS[row.original.status]}
      </BaseTableCell>
    ),
  },
];
