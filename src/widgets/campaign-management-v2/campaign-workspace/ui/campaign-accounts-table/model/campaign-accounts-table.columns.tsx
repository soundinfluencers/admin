import clsx from "clsx";
import { MarkPromoAsPaid } from "@/features/campaign-management/mark-promo-as-paid";
import { CampaignTableAccount } from "../../campaign-table-account/campaign-table-account.tsx";
import { CampaignPostLinkCell } from "../ui/campaign-post-link-cell.tsx";
import { CampaignScreenshotCell } from "../ui/campaign-screenshot-cell.tsx";
import { CampaignMetricCell } from "../ui/campaign-metric-cell.tsx";
import { CampaignAccountActionsCell } from "../ui/campaign-account-actions-cell.tsx";

import type { ColumnDef } from "@tanstack/react-table";

import type {
  ICampaignDetails,
  IMarkPromoPaidResponse,
  TEditableField,
} from "@/entities/campaign/model/campaign-details.types.ts";

import s from "../ui/campaign-accounts-table.module.scss";

const STATUS_SORT_ORDER: Readonly<Record<string, number>> = {
  Requested: 0,
  Accepted: 1,
  Posted: 2,
  "Insights Submitted": 3,
  Declined: 4,
};

const getStatusSortOrder = (
  status: CampaignAccount["statusLabel"],
): number => STATUS_SORT_ORDER[status ?? ""] ?? 5;

type CampaignAccount = ICampaignDetails["addedAccounts"][number];

interface ColumnsParams {
  editorRevision: number;
  canRemoveAccount: boolean;
  isInsightsActionBlocked: () => boolean;
  campaignId: string;
  canEditMetrics: boolean;
  canMarkAsPaid: boolean;
  canEditPostDetails: boolean;
  onUpdatePostLink: (addedAccountsId: string, postLink: string) => void;
  onUpdateScreenshot: (addedAccountsId: string, screenshot: string) => void;
  onUpdateAccountMetricField: (addedAccountsId: string, field: TEditableField, value: number) => void;
  onPromoPaid: (result: IMarkPromoPaidResponse["data"]) => void | Promise<void>;
  onAccountRemove: (addedAccountsId: string) => void;
  canSendMessage: boolean;
  isMessageActionDisabled: boolean;
  onOpenMessagePreview: (influencerId: string, trigger: HTMLButtonElement) => void;
}

export const getCampaignAccountsTableColumns = ({
  editorRevision,
  canRemoveAccount,
  isInsightsActionBlocked,
  campaignId,
  canEditMetrics,
  canMarkAsPaid,
  canEditPostDetails,
  onUpdatePostLink,
  onUpdateScreenshot,
  onUpdateAccountMetricField,
  onPromoPaid,
  onAccountRemove,
  canSendMessage,
  isMessageActionDisabled,
  onOpenMessagePreview,
}: ColumnsParams): ColumnDef<CampaignAccount>[] => [
  {
    accessorKey: "username",
    header: "Account",
    size: 200,
    cell: ({ row }) => (
      <CampaignTableAccount
        socialMedia={row.original.socialMedia}
        username={row.original.username}
      />
    ),
  },
  {
    accessorKey: "followers",
    header: "Followers",
    enableSorting: true,
    sortingFn: "basic",
    size: 83,
    footer: ({ table }) =>
      table.options.data.reduce((sum, account) => sum + account.followers, 0),
  },
  {
    accessorKey: "postLink",
    header: "Post link",
    size: 70,
    cell: ({ row }) => {
      const account = row.original;

      return (
        <CampaignPostLinkCell
          account={account}
          editorRevision={editorRevision}
          canEditPostDetails={canEditPostDetails}
          onUpdatePostLink={onUpdatePostLink}
        />
      );
    },
  },
  {
    accessorKey: "screenshot",
    header: "Screenshot",
    size: 70,
    cell: ({ row }) => {
      const account = row.original;
      return (
        <CampaignScreenshotCell
          account={account}
          editorRevision={editorRevision}
          canEditPostDetails={canEditPostDetails}
          onUpdateScreenshot={onUpdateScreenshot}
        />
      );
    },
  },
  {
    id: "cpm",
    accessorFn: (account) => account.cpm ?? 0,
    header: "CPM",
    enableSorting: true,
    sortingFn: "basic",
    size: 63,
    cell: ({ row }) => row.original.cpm ?? 0,
  },
  {
    accessorKey: "impressions",
    header: "Impressions",
    enableSorting: true,
    sortingFn: "basic",
    size: 86,
    cell: ({ row }) => {
      const account = row.original;
      
      return (
        <CampaignMetricCell
          value={account.impressions}
          canEditMetrics={canEditMetrics}
          onApply={(value) => onUpdateAccountMetricField(account.addedAccountsId, "impressions", value)}
          aria-label={`Impressions for ${account.username}`}
        />
      );
    },
    footer: ({ table }) =>
      table.options.data.reduce((sum, account) => sum + account.impressions, 0),
  },
  {
    accessorKey: "like",
    header: "Likes",
    enableSorting: true,
    sortingFn: "basic",
    size: 63,
    cell: ({ row }) => {
      const account = row.original;

      return (
        <CampaignMetricCell
          value={account.like}
          canEditMetrics={canEditMetrics}
          onApply={(value) => onUpdateAccountMetricField(account.addedAccountsId, "like", value)}
          aria-label={`Likes for ${account.username}`}
        />
      );
    },
    footer: ({ table }) =>
      table.options.data.reduce((sum, account) => sum + account.like, 0),
  },
  {
    accessorKey: "comments",
    header: "Comments",
    enableSorting: true,
    sortingFn: "basic",
    size: 78,
    cell: ({ row }) => {
      const account = row.original;
      
      return (
        <CampaignMetricCell
          value={account.comments}
          canEditMetrics={canEditMetrics}
          onApply={(value) => onUpdateAccountMetricField(account.addedAccountsId, "comments", value)}
          aria-label={`Comments for ${account.username}`}
        />
      );
    },
    footer: ({ table }) =>
      table.options.data.reduce((sum, account) => sum + account.comments, 0),
  },
  {
    accessorKey: "saves",
    header: "Saves",
    enableSorting: true,
    sortingFn: "basic",
    size: 58,
    cell: ({ row }) => {
      const account = row.original;
      
      return (
        <CampaignMetricCell
          value={account.saves}
          canEditMetrics={canEditMetrics}
          onApply={(value) => onUpdateAccountMetricField(account.addedAccountsId, "saves", value)}
          aria-label={`Saves for ${account.username}`}
        />
      );
    },
    footer: ({ table }) =>
      table.options.data.reduce((sum, account) => sum + account.saves, 0),
  },
  {
    accessorKey: "shares",
    header: "Shares",
    enableSorting: true,
    sortingFn: "basic",
    size: 63,
    cell: ({ row }) => {
      const account = row.original;
      
      return (
        <CampaignMetricCell
          value={account.shares}
          canEditMetrics={canEditMetrics}
          onApply={(value) => onUpdateAccountMetricField(account.addedAccountsId, "shares", value)}
          aria-label={`Shares for ${account.username}`}
        />
      );
    },
    footer: ({ table }) =>
      table.options.data.reduce((sum, account) => sum + account.shares, 0),
  },
  {
    accessorKey: "statusLabel",
    header: "Status",
    enableSorting: true,
    sortingFn: (rowA, rowB) =>
      getStatusSortOrder(rowA.original.statusLabel) -
      getStatusSortOrder(rowB.original.statusLabel),
    size: 135,
    meta: { align: "center" },
    cell: ({ row }) => row.original.statusLabel ? (
      <span 
        className={clsx(s.status, {
          [s.statusRequested]: row.original.statusLabel === "Requested",
          [s.statusAccepted]: row.original.statusLabel === "Accepted",
          [s.statusDeclined]: row.original.statusLabel === "Declined",
          [s.statusPosted]: row.original.statusLabel === "Posted",
          [s.statusSubmitted]: row.original.statusLabel === "Insights Submitted",
        })}
      >
        {row.original.statusLabel}
      </span>
    ) : "—",
  },
  {
    id: "paid",
    header: "Paid",
    size: 48,
    meta: { align: "center" },
    cell: ({ row }) => {
      const account = row.original;
      
      return (
        <MarkPromoAsPaid
          isActionBlocked={isInsightsActionBlocked}
          campaignId={campaignId}
          promoId={account.addedAccountsId}
          closePromo={account.closePromo}
          canMarkAsPaid={canMarkAsPaid}
          onPaid={onPromoPaid}
        />
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    size: 72,
    meta: { align: "center" },
    cell: ({ row }) => {
      const account = row.original;
      
      return (
        <CampaignAccountActionsCell
          account={account}
          canSendMessage={canSendMessage}
          isMessageActionDisabled={isMessageActionDisabled}
          canRemoveAccount={canRemoveAccount}
          onOpenMessagePreview={onOpenMessagePreview}
          onAccountRemove={onAccountRemove}
        />
      );
    },
  },
];
