import {
  useInfluencerInvoicesPageState,
} from "@/pages/influencer-invoices-page/model/use-influencer-invoices-page-state.ts";
import { useInfluencersInvoicesQuery } from "@/entities/invoices/influencer-invoice/api/influencer-invoice.queries.ts";

import { PageBreadcrumbs } from "@/shared/ui/page-breadcrumbs";
import { PageTitle } from "@/widgets/page-title";
import { SearchByQuery } from "@/features/search";
import { InfluencerInvoicesTable } from "@/widgets/influencer-invoices/influencer-invoices-table";
import { Pagination } from "@/shared/ui";

import s from './influencer-invoices-page.module.scss';

export const InfluencerInvoicesPage = () => {
  const {
    page,
    searchValue,
    influencersInvoicesQueryParams,
    handlePageChange,
    handleSearchChange,
  } = useInfluencerInvoicesPageState();

  const { data, isLoading, isFetching, isError } = useInfluencersInvoicesQuery(influencersInvoicesQueryParams);

  const invoices = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className={s.influencerInvoicesPage}>
      <PageBreadcrumbs
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Invoices influencers" },
        ]}
      />

      <div className={s.content}>
        <PageTitle
          title="Invoices influencers"
        />

        <div className={s.tableWrapper}>
          <SearchByQuery value={searchValue} onChange={handleSearchChange}/>

          {isError ? (
            <div>Error loading Influencer Invoices. Please try again later.</div>
          ) : (
            <>
              <InfluencerInvoicesTable
                data={invoices}
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
