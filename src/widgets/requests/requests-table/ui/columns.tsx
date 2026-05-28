import type { ColumnDef } from "@tanstack/react-table";
import { SpecifiedStatusBadge } from "../ui/specified-status-badge/specified-status-badge.tsx";
import { ReviewRequest } from "@/features/requests/review-request";
import { BaseTableCell } from "@/shared/ui";
import { REQUEST_GROUP } from "@/widgets/requests/model/requests-table.helpers.ts";
import type { IRequest } from "@/entities/requests";

export const columns: ColumnDef<IRequest>[] = [
  {
    accessorKey: "label",
    header: "Request",
    size: 290,
    minSize: 290,
    maxSize: 290,
    cell: ({ row }) => {
      return (
        <BaseTableCell>
          <span title={row.original.label}>{row.original.label}</span>
        </BaseTableCell>
      );
    },
  },
  {
    accessorKey: "submittedBy",
    header: "Submitted by",
    size: 187,
    minSize: 187,
    maxSize: 187,
    cell: ({ row }) => {
      return (
        <BaseTableCell>
          <span title={row.original.submittedBy}>{row.original.submittedBy}</span>
        </BaseTableCell>
      );
    },
  },
  {
    accessorKey: "date",
    header: "Date",
    size: 187,
    minSize: 187,
    maxSize: 187,
    cell: ({ row }) => {
      return (
        <BaseTableCell>
          <span title={row.original.date}>{row.original.date}</span>
        </BaseTableCell>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    size: 186,
    minSize: 186,
    maxSize: 186,
    cell: ({ row }) => {
      return (
        <BaseTableCell>
          <span title={REQUEST_GROUP[row.original.group]}>{REQUEST_GROUP[row.original.group]}</span>
        </BaseTableCell>
      );
    },
  },
  {
    accessorKey: "specifiedStatus",
    header: "Status",
    size: 187,
    minSize: 187,
    maxSize: 187,
    cell: ({ row }) => {
      return (
        <BaseTableCell>
          <SpecifiedStatusBadge status={row.original.specifiedStatus}/>
        </BaseTableCell>
      );
    },
  },
  {
    id: "actions",
    header: "Action",
    size: 187,
    minSize: 187,
    maxSize: 187,
    cell: ({ row }) => {
      return (
        <BaseTableCell>
          <ReviewRequest
            request={row.original}
          />
        </BaseTableCell>
      );
    },
  },
];
