import { useRequestsPageState } from "@/pages/requests-page/model/use-requests-page-state.ts";
import { useRequestsQuery } from "@/entities/requests";
import { PageBreadcrumbs } from "@/shared/ui/page-breadcrumbs";
import { PageTitle } from "@/widgets/page-title";
import { Pagination } from "@/shared/ui";
import { RequestsToolbar } from "@/widgets/requests/requests-toolbar";
import { RequestsTable } from "@/widgets/requests/requests-table";

import s from './requests-page.module.scss';

export const RequestsPage = () => {
  const {
    page,
    searchValue,
    type,
    status,
    queryParams,
    handlePageChange,
    handleSearchChange,
    handleTypeChange,
    handleToggleModeChange,
  } = useRequestsPageState();

  const { data, isPending, isFetching, isError } = useRequestsQuery(queryParams);

  const requests = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className={s.requestsPage}>
      <PageBreadcrumbs
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Approval Center" },
        ]}
      />

      <div className={s.content}>
        <div className={s.head}>
          <div className={s.wrapper}>
            <PageTitle title="Approval Center" />
            <p className={s.subtitle}>Review and manage pending approvals across the platform.</p>
          </div>

          <RequestsToolbar
            searchValue={searchValue}
            onSearchChange={handleSearchChange}
            activeFilter={type}
            onFilterChange={handleTypeChange}
            status={status}
            onChangeStatus={handleToggleModeChange}
          />
        </div>

        <div className={s.tableWrapper}>
          {isError ? (
            <div>Could not load requests. Please refresh the page.</div>
          ) : (
            <>
              <RequestsTable
                data={requests}
                isLoading={isPending}
                isFetching={isFetching}
              />
              {requests.length > 0 && (
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
