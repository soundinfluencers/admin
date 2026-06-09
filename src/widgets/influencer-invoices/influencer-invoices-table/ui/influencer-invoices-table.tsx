import React from "react";
import { Table } from "@/shared/ui";

import { INFLUENCERS_INVOICES_COLUMNS } from "@/widgets/influencer-invoices/influencer-invoices-table/ui/columns.tsx";
import type {IInvoiceTableRowDto} from "@/entities/invoices/influencer-invoice/model/influencer-invoice.types.ts";

interface InfluencersTableProps {
  data: IInvoiceTableRowDto[];
  isFetching?: boolean;
  isLoading?: boolean;
}

export const InfluencerInvoicesTable: React.FC<InfluencersTableProps> = ({
  data,
  isFetching,
  isLoading,
}) => {
  console.log("InfluencerInvoicesTable data:", data);

  return (
    <Table
      data={data}
      columns={INFLUENCERS_INVOICES_COLUMNS}
      isFetching={isFetching}
      isLoading={isLoading}
      isManualPagination={true}
      emptyText={"No influencers invoices found"}
    />
  );
};
