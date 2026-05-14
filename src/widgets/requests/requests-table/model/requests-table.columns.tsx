import type { ColumnDef } from "@tanstack/react-table";
import type { IRequest } from "@/entities/requests";
import { normalizeRequestType } from "@/widgets/requests/requests-table/model/requests-table.helpers.ts";
import { SortButton } from "@/widgets/requests/requests-table/ui/sort-button.tsx";
import { ReviewRequest } from "@/features/requests/review-request";
import { REQUEST_DETAILS_ROUTE_MAP } from "@/widgets/requests/requests-table/model/requests-table.nav.helpers.ts";

export const columns: ColumnDef<IRequest>[] = [
  {
    accessorKey: 'requestType',
    header: 'Status',
    cell: ({ row }) => {
      return normalizeRequestType(row.original.requestType);
    },
  },
  {
    accessorKey: 'date',
    header: 'Date',
  },
  {
    accessorKey: 'firstName',
    header: 'Account name',
  },

  {
    accessorKey: 'userType',
    header: ({ column }) => (
      <SortButton
        onToggleSorting={() => column.toggleSorting()}
        isSorted={column.getIsSorted()}
      />
    ),
    cell: ({ row }) => {
      return row.original.userType === 'client' ? 'Client' : 'Influencer';
    },
  },

  {
    id: 'action',
    header: 'Action',
    cell: ({ row }) => (
      <ReviewRequest
        to={REQUEST_DETAILS_ROUTE_MAP[row.original.requestType](row.original.requestId)}
      />
    ),
  },
];
