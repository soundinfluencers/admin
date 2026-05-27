import React from "react";
import { Table } from "@/shared/ui";
import { columns } from "@/widgets/requests/requests-table/ui/columns.tsx";

import type { IRequest } from "@/entities/requests";

interface RequestsTableProps {
  data: IRequest[];
  isLoading?: boolean;
  isFetching?: boolean;
}

export const RequestsTable: React.FC<RequestsTableProps> = ({
  data,
  isLoading,
  isFetching,
}) => {

  return (
    <Table
      data={data}
      columns={columns}
      isLoading={isLoading}
      isFetching={isFetching}
      isManualPagination
      emptyText={"Could not find any requests matching your criteria."}
    />
  );
};

