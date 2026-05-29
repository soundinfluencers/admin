import type { ColumnDef } from "@tanstack/react-table";
import type { ICampaign } from "@/entities/campaign/model/campaign.types.ts";
import { CampaignNameCell } from "@/widgets/campaigns/campaigns-table/ui/campaign-name-cell/campaign-name-cell.tsx";
import {
  CampaignActionsCell,
} from "@/widgets/campaigns/campaigns-table/ui/campaign-actions-cell/campaign-actions-cell.tsx";
import {
  CampaignReportCell,
} from "@/widgets/campaigns/campaigns-table/ui/campaign-report-cell/campaign-report-cell.tsx";
import { CampaignPriceCell } from "@/widgets/campaigns/campaigns-table/ui/campaign-price-cell/campaign-price-cell.tsx";
import {
  CampaignFollowersCell,
} from "@/widgets/campaigns/campaigns-table/ui/campaign-followers-cell/campaign-followers-cell.tsx";
import { CampaignTextCell } from "@/widgets/campaigns/campaigns-table/ui/campaign-text-cell/campaign-text-cell.tsx";
import { CampaignNoteCell } from "@/widgets/campaigns/campaigns-table/ui/campaign-note-cell/campaign-note-cell.tsx";
import {
  CampaignInvoiceCell,
} from "@/widgets/campaigns/campaigns-table/ui/campaign-invoice-cell/campaign-invoice-cell.tsx";

import styles from './columns.module.scss';

export const paymentsCampaignColumns: ColumnDef<ICampaign>[] = [
  {
    id: "campaign",
    header: "Campaign",
    size: 140,
    minSize: 140,
    maxSize: 140,
    cell: ({ row }) => (
      <CampaignNameCell
        campaignName={row.original.campaignName}
        socialMedia={row.original.socialMedia} status={row.original.status} campaignId={row.original.campaignId}/>
    ),
  },

  {
    id: 'actions',
    header: 'Actions',
    size: 105,
    minSize: 105,
    maxSize: 105,
    cell: ({ row }) => (
      <CampaignActionsCell
        campaignId={row.original.campaignId}
        status={row.original.status}
        socialMedia={row.original.socialMedia}
      />
    ),
  },

  {
    accessorKey: 'creatorRole',
    header: "Client",
    size: 70,
    minSize: 70,
    maxSize: 70,
    cell: ({ row }) => (
      <CampaignTextCell
        value={row.original.creatorRole}
        className={styles.cell}
      />
    ),
  },

  {
    accessorKey: "followers",
    header: "Followers",
    size: 70,
    minSize: 70,
    maxSize: 70,
    cell: ({ row }) => (
      <CampaignFollowersCell
        value={row.original.followers}
        className={styles.cell}
      />
    ),
  },

  {
    accessorKey: "cost",
    header: "Cost",
    size: 75,
    minSize: 75,
    maxSize: 75,
    cell: ({ row }) => (
      <CampaignPriceCell
        value={row.original.cost}
        className={styles.cell}
      />
    ),
  },

  {
    accessorKey: "salePrice",
    header: "Sale Price",
    size: 75,
    minSize: 75,
    maxSize: 75,
    cell: ({ row }) => (
      <CampaignPriceCell
        value={row.original.cost}
        className={styles.cell}
      />
    ),
  },

  {
    accessorKey: "date",
    header: "Date",
    size: 75,
    minSize: 75,
    maxSize: 75,
    cell: ({ row }) => (
      <CampaignTextCell
        value={row.original.date}
        className={styles.cell}
      />
    ),
  },

  {
    accessorKey: "statusLabel",
    header: "Status",
    size: 85,
    minSize: 85,
    maxSize: 85,
    cell: ({ row }) => (
      <CampaignTextCell
        value={row.original.statusLabel}
        className={styles.cell}
      />
    ),
  },

  {
    id: "reportSent",
    header: "Report Sent",
    size: 70,
    minSize: 70,
    maxSize: 70,
    cell: ({ row }) => (
      <CampaignReportCell
        campaignId={row.original.campaignId}
        reportSent={row.original.reportSent}
        status={row.original.status}
      />
    ),
  },

  {
    accessorKey: "paymentStatus",
    header: "Payment Status",
    size: 106,
    minSize: 106,
    maxSize: 106,
    cell: ({ row }) => (
      <CampaignTextCell
        value={row.original.paymentStatus}
        className={styles.cell}
      />
    ),
  },

  {
    accessorKey: "invoiceId",
    header: "Invoice",
    size: 71,
    minSize: 71,
    maxSize: 71,
    cell: ({ row }) => (
      <CampaignInvoiceCell
        invoiceId={row.original.invoiceId}
        shortInvoiceNumber={row.original.shortInvoiceNumber}
      />
    ),
  },

  {
    accessorKey: 'shortInvoiceNumber',
    header: "Inv. #",
    size: 82,
    minSize: 82,
    maxSize: 82,
    cell: ({ row }) => (
      <CampaignTextCell
        value={row.original.shortInvoiceNumber}
        className={styles.cell}
      />
    ),
  },

  {
    accessorKey: "notes",
    header: "Notes",
    size: 90,
    minSize: 90,
    maxSize: 90,
    cell: ({ row }) => (
      <CampaignNoteCell
        value={row.original.notes}
        campaignId={row.original.campaignId}
        status={row.original.status}
        className={styles.cell}
      />
    ),
  },
];
