import type { ColumnDef } from "@tanstack/react-table";
import { BaseTableCell } from "@/shared/ui";
import { PaidStatusCell, } from "@/widgets/influencer-invoices/influencer-invoices-table/ui/paid-status-cell/paid-status-cell.tsx";
import { OpenInfluencerInvoiceButton } from "@/features/influencer-invoices";
import { DownloadInvoicePdf } from "@/features/download-invoice-pdf/download-invoice-pdf.tsx";
import { PAYMENT_METHOD_LABELS } from "@/shared/libs/normalize/payment-method.normalize.ts";
import {
  SOCIAL_MEDIA_ICONS,
} from "@/widgets/influencer-invoices/influencer-invoices-table/model/influencer-invoices-table.constants.ts";
import {
  INFLUENCER_INVOICES_STATUS_LABEL,
} from "@/widgets/influencer-invoices/influencer-invoices-table/model/influencer-invoices-table.helper.ts";
import { formatCurrency } from "@/shared/libs/format/format-currency.ts";
import { getPaymentDetailsLabel } from "@/widgets/influencer-invoices/invoice-preview/model/invoice-preview.helper.ts";

import type { IInvoiceTableRowDto } from "@/entities/invoices/model/influencer-invoices.types.ts";
import s from './columns.module.scss';

export const INFLUENCERS_INVOICES_COLUMNS: ColumnDef<IInvoiceTableRowDto>[] = [
  {
    header: "First Name",
    accessorKey: "firstName",
    size: 110,
    minSize: 110,
    maxSize: 100,
    cell: ({ row }) => (
      <BaseTableCell>
        {row.original.firstName}
      </BaseTableCell>
    ),
  },

  {
    header: "Last Name",
    accessorKey: "lastName",
    size: 110,
    minSize: 110,
    maxSize: 110,
    cell: ({ row }) => (
      <BaseTableCell>
        {row.original.lastName ? row.original.lastName : '—'}
      </BaseTableCell>
    ),
  },

  {
    header: "Usernames",
    accessorKey: "username",
    size: 150,
    minSize: 150,
    maxSize: 150,
    cell: ({ row }) => (
      <BaseTableCell>
        <img
          className={s.icon}
          src={SOCIAL_MEDIA_ICONS[row.original.socialMedia]}
          alt={row.original.socialMedia}
          width={20}
          height={20}
        />
        <span
          className={s.text}
          title={row.original.username}
        >
          {row.original.username}
        </span>
      </BaseTableCell>
    ),
  },

  {
    header: "Date",
    accessorKey: "date",
    size: 87,
    minSize: 87,
    maxSize: 87,
    cell: ({ row }) => (
      <BaseTableCell>
        {row.original.date}
      </BaseTableCell>
    ),
  },

  {
    header: "Influencer Amount",
    accessorKey: "influencerAmount",
    size: 86,
    minSize: 86,
    maxSize: 86,
    cell: ({ row }) => (
      <BaseTableCell>
        {formatCurrency(row.original.influencerAmount, 'EUR')}
      </BaseTableCell>
    ),
  },

  {
    header: "Amount in EUR",
    accessorKey: "amountInEur",
    size: 86,
    minSize: 86,
    maxSize: 86,
    cell: ({ row }) => (
      <BaseTableCell>
        {formatCurrency(row.original.amountInEur, 'EUR')}
      </BaseTableCell>
    ),
  },

  {
    header: "Payment Method",
    accessorKey: "paymentMethod",
    size: 173,
    minSize: 173,
    maxSize: 173,
    cell: ({ row }) => (
      <BaseTableCell>
        <span
          className={s.text}
          title={PAYMENT_METHOD_LABELS[row.original.paymentMethod]}
        >
          {PAYMENT_METHOD_LABELS[row.original.paymentMethod]}
        </span>
      </BaseTableCell>
    ),
  },

  {
    header: "Payment Details",
    accessorKey: "paymentDetails",
    size: 160,
    minSize: 160,
    maxSize: 160,
    cell: ({ row }) => {

      const details = getPaymentDetailsLabel(row.original.paymentMethod, row.original.paymentDetails);

      return (
        <BaseTableCell>
          <span
            className={s.text}
            title={details}
          >
            {details}
          </span>
        </BaseTableCell>
      );
    },
  },

  {
    header: "Status",
    accessorKey: "status",
    size: 80,
    minSize: 80,
    maxSize: 80,
    cell: ({ row }) => (
      <BaseTableCell>
        {INFLUENCER_INVOICES_STATUS_LABEL[row.original.status]}
      </BaseTableCell>
    ),
  },

  {
    header: "Paid",
    accessorKey: "paid",
    size: 70,
    minSize: 70,
    maxSize: 70,
    cell: ({ row }) => (
      <PaidStatusCell
        invoiceId={row.original.invoiceId}
        status={row.original.isPaid}
        className={s.cell}
      />
    ),
  },

  {
    header: "Actions",
    id: "actions",
    size: 91,
    minSize: 91,
    maxSize: 91,
    cell: ({ row }) => (
      <BaseTableCell>
        <OpenInfluencerInvoiceButton
          invoiceRow={row.original}
          invoiceId={row.original.invoiceId}
        />
        <DownloadInvoicePdf invoiceId={row.original.invoiceId}/>
      </BaseTableCell>
    ),
  },
];
