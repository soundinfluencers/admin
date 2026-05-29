import { useClientsInvoicesPageState } from "../model/use-clients-invoices-page-state.ts";
import { useClientsInvoicesQuery } from "@/entities/invoices/client-invoice";

import { PageBreadcrumbs } from "@/widgets/page-breadcrumbs";
import { PageTitle } from "@/widgets/page-title";
import { SearchByQuery } from "@/features/search";
import { ClientsInvoicesTable } from "@/widgets/clients-invoices/clients-invoices-table";
import { Pagination } from "@/shared/ui";

import s from './clients-invoices-page.module.scss';

export const ClientsInvoicesPage = () => {
  const {
    page,
    searchValue,
    clientsInvoiceQueryParams,
    handlePageChange,
    handleSearchChange,
  } = useClientsInvoicesPageState();

  const { data, isLoading, isFetching, isError } = useClientsInvoicesQuery(clientsInvoiceQueryParams);

  const clientsInvoices = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className={s.clientsInvoicesPage}>
      <PageBreadcrumbs
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Invoices clients" },
        ]}
      />

      <div className={s.content}>
        <PageTitle title="Invoices clients"/>

        <div className={s.tableWrapper}>
          <SearchByQuery value={searchValue} onChange={handleSearchChange}/>

          {isError ? (
            <div>Error loading Clients Invoices. Please try again later.</div>
          ) : (
            <>
              <ClientsInvoicesTable
                data={clientsInvoices}
                isLoading={isLoading}
                isFetching={isFetching}
              />

              {!isLoading && (
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
