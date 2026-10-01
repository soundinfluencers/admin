import type { ColumnDef } from "@tanstack/react-table";
import type { ICampaignDetails } from "@/entities/campaign/model/campaign-details.types.ts";
import s from "../ui/campaign-accounts-table.module.scss";

export const campaignAccountsTableColumns: ColumnDef<ICampaignDetails["addedAccounts"][number]>[] = [
  {
    accessorKey: "username",
    header: "Account",
    size: 215,
    cell: ({ row }) => (
      <div className={s.account}>
        <span className={s.avatar} aria-hidden="true">
          {row.original.logoUrl ? (
            <img src={row.original.logoUrl} alt="" width={24} height={24} />
          ) : (
            row.original.username.charAt(0).toUpperCase() || "—"
          )}
        </span>
        <span className={s.username} title={row.original.username}>
          {row.original.username}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "followers",
    header: "Followers",
    size: 83,
    meta: { align: "right" },
    footer: ({ table }) => 
      table.options.data.reduce((sum, account) => sum + account.followers, 0),
  },
  {
    accessorKey: "postLink",
    header: "Post link",
    size: 80,
    meta: { align: "center" },
    cell: ({ row }) => {
      const link = row.original.postLink;

      return link ? (
        <a className={s.link} href={link} target="_blank" rel="noopener noreferrer">
          Open post
        </a>
      ) : (
        "—"
      );
    },
  },
  {
    accessorKey: "screenshot",
    header: "Screenshot",
    size: 120,
    meta: { align: "center" },
    cell: ({ row }) => {
      const screenshot = row.original.screenshot;

      return screenshot ? (
        <a className={s.link} href={screenshot} target="_blank" rel="noopener noreferrer">
          Open screenshot
        </a>
      ) : (
        "—"
      );
    },
  },
  {
    accessorKey: "impressions",
    header: "Impressions",
    size: 86,
    meta: { align: "right" },
    footer: ({ table }) =>
      table.options.data.reduce((sum, account) => sum + account.impressions, 0),
  },
  {
    accessorKey: "cpm",
    header: "CPM",
    size: 63,
    meta: { align: "right" },
    cell: ({ row }) => row.original.cpm ?? 0,
  },
  {
    accessorKey: "like",
    header: "Likes",
    size: 63,
    meta: { align: "right" },
    footer: ({ table }) =>
      table.options.data.reduce((sum, account) => sum + account.like, 0),
  },
  {
    accessorKey: "comments",
    header: "Comments",
    size: 78,
    meta: { align: "right" },
    footer: ({ table }) =>
      table.options.data.reduce((sum, account) => sum + account.comments, 0),
  },
  {
    accessorKey: "saves",
    header: "Saves",
    size: 58,
    meta: { align: "right" },
    footer: ({ table }) =>
      table.options.data.reduce((sum, account) => sum + account.saves, 0),
  },
  {
    accessorKey: "shares",
    header: "Shares",
    size: 63,
    meta: { align: "right" },
    footer: ({ table }) =>
      table.options.data.reduce((sum, account) => sum + account.shares, 0),
  },
  {
    accessorKey: "statusLabel",
    header: "Status",
    size: 118,
    cell: ({ row }) => row.original.statusLabel ? (
      <span className={s.status}>{row.original.statusLabel}</span>
    ) : "—",
  },
  {
    id: "paid",
    header: "Paid",
    size: 48,
    meta: { align: "center" },
    cell: () => "—",
  },
  {
    id: "actions",
    header: "Actions",
    size: 105,
    meta: { align: "center" },
    cell: () => "—",
  },
];
