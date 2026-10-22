import type { ColumnDef } from "@tanstack/react-table";

import { ButtonLink } from "@/shared/ui/v2/button-link";
import { CampaignStrategyTextCell } from "../ui/campaign-strategy-text-cell";
import { CampaignTableAccount } from "../../campaign-table-account/campaign-table-account.tsx";

import ExternalLinkIcon from "@/shared/assets/icons/external-link.svg?react";

import type { CampaignStrategyRow } from "./campaign-strategy-table.types";

import accountStyles from "../../campaign-accounts-table/ui/campaign-accounts-table.module.scss";
import s from "../ui/campaign-strategy-table.module.scss";

const renderExternalLink = (
  url: string | null,
  label: string,
) => {
  if (!url?.trim()) {
    return "—";
  }

  return (
    <div className={accountStyles.actions}>
      <ButtonLink
        size="small"
        href={url}
        icon={ExternalLinkIcon}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        title={label}
      />
    </div>
  );
};

export const campaignStrategyTableColumns: ColumnDef<CampaignStrategyRow>[] = [
  {
    accessorKey: "username",
    header: "Account",
    size: 180,
    cell: ({ row }) => {
      const account = row.original;

      return (
        <CampaignTableAccount
          className={s.account}
          socialMedia={account.socialMedia}
          username={account.username}
        />
      );
    },
  },
  {
    accessorKey: "followers",
    header: "Followers",
    size: 90,
    enableSorting: true,
    sortingFn: "basic",
  },
  {
    accessorKey: "dateRequest",
    header: "Date request",
    size: 80,
    cell: ({ row }) => {
      const value = row.original.dateRequest?.trim() || "ASAP";
      const match = /^(BEFORE|AFTER):\s*(.+)$/i.exec(value);

      return (
        <span className={s.dateRequest}>
        {match ? (
          <>
            <span className={s.datePart}>
              {match[1]}:
            </span>

            <span className={s.datePart}>
              {match[2]}
            </span>
          </>
        ) : (
          value
        )}
      </span>
      );
    },
  },
  {
    accessorKey: "contentLabel",
    header: "Content",
    size: 80,
    cell: ({ row }) => row.original.contentLabel || "—",
  },
  {
    accessorKey: "description",
    header: "Description",
    size: 150,
    cell: ({ row }) => (
      <CampaignStrategyTextCell
        value={row.original.description}
      />
    ),
  },
  {
    accessorKey: "brief",
    header: "Brief",
    size: 150,
    cell: ({ row }) => (
      <CampaignStrategyTextCell value={row.original.brief}/>
    ),
  },
  {
    accessorKey: "storyTag",
    header: "Story tag",
    size: 120,
    cell: ({ row }) => (
      <CampaignStrategyTextCell value={row.original.storyTag} width={100}/>
    ),
  },
  {
    accessorKey: "storyLink",
    header: "Story link",
    size: 140,
    cell: ({ row }) => (
      <CampaignStrategyTextCell value={row.original.storyLink} width={120}/>
    ),
  },
  {
    accessorKey: "postLink",
    header: "Post link",
    size: 75,
    meta: { align: "center" },
    cell: ({ row }) =>
      renderExternalLink(
        row.original.postLink,
        `Open post link for ${row.original.username} in a new tab`,
      ),
  },
  {
    accessorKey: "screenshot",
    header: "Screenshot",
    size: 95,
    meta: { align: "center" },
    cell: ({ row }) =>
      renderExternalLink(
        row.original.screenshot,
        `Open screenshot for ${row.original.username} in a new tab`,
      ),
  },
];
