import type { ColumnDef } from "@tanstack/react-table";
import type { ICampaign } from "@/entities/campaign/model/campaign.types.ts";
import { CampaignNameCell } from "@/widgets/campaigns/campaigns-table/ui/campaign-name-cell/campaign-name-cell.tsx";
import { CampaignTextCell } from "@/widgets/campaigns/campaigns-table/ui/campaign-text-cell/campaign-text-cell.tsx";
import { CampaignPriceCell } from "@/widgets/campaigns/campaigns-table/ui/campaign-price-cell/campaign-price-cell.tsx";
import { CampaignNoteCell } from "@/widgets/campaigns/campaigns-table/ui/campaign-note-cell/campaign-note-cell.tsx";
import { CampaignAffiliateCell } from "@/widgets/campaigns/campaigns-table/ui/campaign-affiliate-cell/campaign-affiliate-cell.tsx";
import { PROMO_STATUS } from "@/widgets/campaigns/campaigns-table/model/campaigns-table.helpers.ts";

import styles from "./columns.module.scss";

export const mainCampaignColumns: ColumnDef<ICampaign>[] = [
  {
    id: "campaign",
    header: "Campaign",
    size: 250,
    minSize: 250,
    maxSize: 250,
    cell: ({ row }) => (
      <CampaignNameCell
        campaignName={row.original.campaignName}
        socialMedia={row.original.socialMedia}
        status={row.original.status}
        campaignId={row.original.campaignId}
      />
    ),
  },

  {
    accessorKey: "affiliatePartner",
    header: "Affiliate Partner",
    size: 180,
    minSize: 180,
    maxSize: 180,
    cell: ({ row } ) => (
      <CampaignAffiliateCell
        value={row.original.affiliatePartner}
        campaignId={row.original.campaignId}
        status={row.original.status}
        field={"affiliatePartner"}
        className={styles.cell}
      />
    ),
  },

  {
    accessorKey: "cost",
    header: "Cost",
    size: 85,
    minSize: 85,
    maxSize: 85,
    cell: ({ row } ) => (
      <CampaignPriceCell
        value={row.original.cost}
        className={styles.cell}
      />
    ),
  },

  {
    accessorKey: "salePrice",
    header: "Sale Price",
    size: 85,
    minSize: 85,
    maxSize: 85,
    cell: ({ row } ) => (
      <CampaignPriceCell
        value={row.original.salePrice}
        className={styles.cell}
      />
    ),
  },

  {
    accessorKey: "status",
    header: "Payment Status",
    size: 90,
    minSize: 90,
    maxSize: 90,
    cell: ({ row } ) => (
      <CampaignTextCell
        value={PROMO_STATUS[row.original.status]}
        className={styles.cell}
      />
    ),
  },

  {
    accessorKey: "affiliateCommission",
    header: "Affiliate Commission",
    size: 90,
    minSize: 90,
    maxSize: 90,
    cell: ({ row } ) => (
      <CampaignAffiliateCell
        value={row.original.affiliateCommission}
        campaignId={row.original.campaignId}
        status={row.original.status}
        field={"affiliateCommission"}
        className={styles.cell}
      />
    ),
  },

  {
    accessorKey: "affiliatePaid",
    header: "Affiliate Paid",
    size: 108,
    minSize: 108,
    maxSize: 108,
    cell: ({ row } ) => (
      <CampaignAffiliateCell
        value={row.original.affiliatePaid}
        campaignId={row.original.campaignId}
        status={row.original.status}
        field={"affiliatePaid"}
        className={styles.cell}
      />
    ),
  },

  {
    accessorKey: "paymentStatus",
    header: "Affiliate Status",
    size: 108,
    minSize: 108,
    maxSize: 108,
    cell: ({ row } ) => (
      <CampaignTextCell
        value={row.original.paymentStatus}
        className={styles.cell}
      />
    ),
  },

  {
    accessorKey: "notes",
    header: "Notes",
    size: 110,
    minSize: 110,
    maxSize: 110,
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

