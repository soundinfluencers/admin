import React from "react";
import { Table } from "@/shared/ui";
import { CLIENTS_INVOICES_COLUMNS } from "@/widgets/clients-invoices/clients-invoices-table/ui/columns.tsx";
import type { IClientInvoiceTableRowDto } from "@/entities/invoices/client-invoice/model/client-invoice.types.ts";

interface ClientsInvoicesTableProps {
  data: IClientInvoiceTableRowDto[];
  isLoading: boolean;
  isFetching: boolean;
}

export const ClientsInvoicesTable: React.FC<ClientsInvoicesTableProps> = ({
  data,
  isLoading,
  isFetching,
}) => {
  console.log("ClientsInvoicesTable data:", data);

  return (
    <Table
      data={data}
      columns={CLIENTS_INVOICES_COLUMNS}
      isLoading={isLoading}
      isFetching={isFetching}
      isManualPagination={true}
      emptyText={"No clients invoices found"}
    />
  );
};
