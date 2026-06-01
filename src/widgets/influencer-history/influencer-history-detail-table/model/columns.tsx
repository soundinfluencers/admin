import type { ColumnDef } from "@tanstack/react-table";
import {
  InfluencerHistoryDetailTableTextCell
} from "@/widgets/influencer-history/influencer-history-detail-table/ui/influencer-history-detail-table-text-cell";
import { formatCurrency } from "@/shared/libs/format/format-currency.ts";
import type {
  IInfluencerHistoryDetailsTableRow
} from "@/widgets/influencer-history/influencer-history-detail-table/model/influencer-history-details-table.types.ts";
import {
  InvoicePlaceholderCell
} from "@/widgets/influencer-history/influencer-history-detail-table/ui/invoice-placeholder-cell";
import {
  AccountUsernameCell
} from "@/widgets/influencer-history/influencer-history-detail-table/ui/account-user-name-cell";
import { CampaignCell } from "@/widgets/influencer-history/influencer-history-detail-table/ui/campaign-cell";
import { PAYMENT_METHOD_LABELS } from "@/shared/libs/normalize/payment-method.normalize.ts";

export const INFLUENCER_HISTORY_DETAILS_COLUMNS: ColumnDef<IInfluencerHistoryDetailsTableRow>[] = [
  {
    accessorKey: "dateAndTime",
    header: "Date & Time",
    size: 138,
    minSize: 131,
    maxSize: 138,
    cell: ({ row }) => (
      <InfluencerHistoryDetailTableTextCell
        value={row.original.dateAndTime}
      />
    ),
  },

  {
    id: "username",
    header: "Account username",
    size: 233,
    minSize: 158,
    maxSize: 233,
    cell: ({ row }) => {
      const item = row.original;

      if (item.actionType === "invoice") {
        return <InvoicePlaceholderCell />;
      }

      return (
        <AccountUsernameCell
          username={item.username ?? ""}
          socialMedia={item.socialMedia}
          actionId={item.actionId}
        />
      );
    },
  },

  {
    id: "campaignName",
    header: "Campaign name",
    size: 213,
    minSize: 192,
    maxSize: 213,
    cell: ({ row }) => {
      const item = row.original;

      if (item.actionType === "invoice") {
        return <InvoicePlaceholderCell />;
      }

      return (
        <CampaignCell
          value={item.campaignName}
          campaignId={item.campaignId}
          campaignStatus={item.campaignStatus}
          isStillInCampaign={item.isStillInCampaign}
        />
      );
    },
  },

  {
    id: "reward",
    header: "Reward",
    size: 80,
    minSize: 80,
    maxSize: 80,
    cell: ({ row }) => (
      <InfluencerHistoryDetailTableTextCell
        value={formatCurrency(row.original.reward, 'EUR')}
      />
    ),
  },

  {
    id: "paymentMethod",
    header: "Payment method",
    size: 128,
    minSize: 85,
    maxSize: 128,
    cell: ({ row }) => {
      const item = row.original;

      if (item.actionType === "campaign") {
        return <InvoicePlaceholderCell text={"Campaign"}/>;
      }

      return (
        <InfluencerHistoryDetailTableTextCell
          value={item.paymentMethod ? PAYMENT_METHOD_LABELS[item.paymentMethod] : "-"}
        />
      );
    },
  },

  {
    id: "status",
    header: "Status",
    size: 298,
    minSize: 154,
    maxSize: 298,
    cell: ({ row }) => {
      const item = row.original;

      if (item.actionType === "invoice") {
        return <InvoicePlaceholderCell />;
      }

      return (
        <InfluencerHistoryDetailTableTextCell
          value={item.statusLabel}
        />
      );
    },
  },

  {
    id: "currentBalance",
    header: "Current balance",
    size: 126,
    minSize: 90,
    maxSize: 126,
    cell: ({ row }) => (
      <InfluencerHistoryDetailTableTextCell
        value={formatCurrency(row.original.currentBalance, "EUR")}
      />
    ),
  },
];
