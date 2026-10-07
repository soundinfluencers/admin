import clsx from "clsx";
import { EditPostLink } from "@/features/campaign-management/edit-post-link";
import { EditScreenshot } from "@/features/campaign-management/edit-screenshot";
import { InlineIntegerInput } from "@/shared/ui/v2/inline-integer-input";
import { MarkPromoAsPaid } from "@/features/campaign-management/mark-promo-as-paid";
import { SOCIAL_MEDIA_ICONS } from "@/shared/config/social-media-icons.ts";

import type { ColumnDef } from "@tanstack/react-table";

import type {
  ICampaignDetails,
  IMarkPromoPaidResponse,
  TEditableField,
} from "@/entities/campaign/model/campaign-details.types.ts";

import EditIcon from '@/shared/assets/icons/edit.svg?react';
import ExternalLinkIcon from '@/shared/assets/icons/external-link.svg?react';
import TrashIcon from "@/shared/assets/icons/trash.svg?react";

import s from "../ui/campaign-accounts-table.module.scss";

type CampaignAccount = ICampaignDetails["addedAccounts"][number];

interface ColumnsParams {
  canRemoveAccount: boolean;
  campaignId: string;
  canEditMetrics: boolean;
  canMarkAsPaid: boolean;
  canEditPostDetails: boolean;
  onUpdatePostLink: (addedAccountsId: string, postLink: string) => void;
  onUpdateScreenshot: (addedAccountsId: string, screenshot: string) => void;
  onUpdateAccountMetricField: (addedAccountsId: string, field: TEditableField, value: number) => void;
  onPromoPaid: (result: IMarkPromoPaidResponse["data"]) => void | Promise<void>;
  onAccountRemove: (addedAccountsId: string) => void;
}

export const getCampaignAccountsTableColumns = ({
  canRemoveAccount,
  campaignId,
  canEditMetrics,
  canMarkAsPaid,
  canEditPostDetails,
  onUpdatePostLink,
  onUpdateScreenshot,
  onUpdateAccountMetricField,
  onPromoPaid,
  onAccountRemove,
}: ColumnsParams): ColumnDef<CampaignAccount>[] => [
  {
    accessorKey: "username",
    header: "Account",
    size: 200,
    cell: ({ row }) => {
      const Icon = SOCIAL_MEDIA_ICONS[row.original.socialMedia];

      return (
        <div className={s.account}>
          <span className={s.avatar} aria-hidden="true">
            <Icon/>
          </span>
          <span className={s.username} title={row.original.username}>
            {row.original.username}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "followers",
    header: "Followers",
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
        <div className={s.actions}>
          <EditPostLink
            username={account.username}
            value={account.postLink ?? ""}
            onApply={(postLink) =>
              onUpdatePostLink(account.addedAccountsId, postLink)
            }
            trigger={
              <button 
                type="button"
                className={s.action}
                disabled={!canEditPostDetails}
                title={account.postLink ? "Edit post link" : "Add post link"}
                aria-label={account.postLink ? "Edit post link" : "Add post link"}
              >
                <EditIcon aria-hidden="true" className={s.icon}/>
              </button>
            }
          />

          {account.postLink && (
            <a 
              href={account.postLink}
              className={s.action}
              target="_blank"
              rel="noopener noreferrer"
              title="Open post link in a new tab"
            >
              <ExternalLinkIcon aria-hidden="true" className={s.icon}/>
            </a>  
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "screenshot",
    header: "Screenshot",
    size: 70,
    cell: ({ row }) => {
      const account = row.original;
      const screenshot = account.screenshot ?? "";

      return (
        <div className={s.actions}>
          <EditScreenshot
            value={screenshot}
            username={account.username}
            onApply={(url) =>
              onUpdateScreenshot(account.addedAccountsId, url)
            }
            trigger={
              <button
                type="button"
                className={s.action}
                disabled={!canEditPostDetails}
                aria-label={`Manage screenshot for ${account.username}`}
              >
                <EditIcon aria-hidden="true" className={s.icon}/>
              </button>
            }
          />
          
          {screenshot && (
            <a
              className={s.action}
              href={screenshot}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View screenshot for ${account.username}`}
            >
              <ExternalLinkIcon aria-hidden="true" className={s.icon}/>
            </a>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "cpm",
    header: "CPM",
    size: 63,
    cell: ({ row }) => row.original.cpm ?? 0,
  },
  {
    accessorKey: "impressions",
    header: "Impressions",
    size: 86,
    cell: ({ row }) => {
      const account = row.original;
      
      if (!canEditMetrics) {
        return account.impressions;
      }
      
      return (
        <InlineIntegerInput
          value={account.impressions}
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
    size: 63,
    cell: ({ row }) => {
      const account = row.original;

      if (!canEditMetrics) {
        return account.like;
      }

      return (
        <InlineIntegerInput
          value={account.like}
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
    size: 78,
    cell: ({ row }) => {
      const account = row.original;
      
      if (!canEditMetrics) {
        return account.comments;
      }
      
      return (
        <InlineIntegerInput
          value={account.comments}
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
    size: 58,
    cell: ({ row }) => {
      const account = row.original;
      
      if (!canEditMetrics) {
        return account.saves;
      }
      
      return (
        <InlineIntegerInput
          value={account.saves}
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
    size: 63,
    cell: ({ row }) => {
      const account = row.original;
      
      if (!canEditMetrics) {
        return account.shares;
      }
      
      return (
        <InlineIntegerInput
          value={account.shares}
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
        <div className={s.actions}>
          <button
            type="button"
            className={s.action}
            disabled={!canRemoveAccount}
            onClick={() => {
              if (!canRemoveAccount) return;

              onAccountRemove(account.addedAccountsId);
            }}
            aria-label={`Remove account ${account.username}`}
            title="Remove account"
            data-action="removeAccount"
          >
            <TrashIcon aria-hidden="true" className={s.icon}/>
          </button>
        </div>
      );
    },
  },
];
