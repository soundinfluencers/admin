import { useRequestsPageState } from "@/pages/requests-pages/requests-page/model/use-requests-page-state.ts";
import { useRequestsQuery } from "@/entities/requests";
import { PageBreadcrumbs } from "@/widgets/page-breadcrumbs";
import { PageTitle } from "@/widgets/page-title";
import { Pagination } from "@/shared/ui";
import { SearchByQuery } from "@/features/search";
import { RequestsTable } from "@/widgets/requests/requests-table";

import s from './requests-page.module.scss';

export const RequestsPage = () => {
  const {
    page,
    searchValue,
    queryParams,
    handlePageChange,
    handleSearchChange
  } = useRequestsPageState();

  const { data, isError } = useRequestsQuery(queryParams);

  // isPending, isFetching,

  const requests = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className={s.requestsPage}>
      <PageBreadcrumbs
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Requests" },
        ]}
      />

      <div className={s.content}>
        <div className={s.head}>
          <PageTitle title="Requests" />
          <SearchByQuery
            value={searchValue}
            onChange={handleSearchChange}

          />
        </div>

        <div className={s.tableWrapper}>
          {isError ? (
            <div>Could not load requests. Please refresh the page.</div>
          ) : (
            <>
              <RequestsTable
                data={requests}
              />
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// import type { IRequest } from "@/entities/requests";
// export const REQUESTS_MOCK: IRequest[] = [
//   {
//     requestId: "REQ-1001",
//     requestType: "NEW_CLIENT_REQUEST",
//     date: "2026.05.14",
//     firstName: "John",
//     userType: "client",
//   },
//   {
//     requestId: "REQ-1002",
//     requestType: "NEW_INFLUENCER_REQUEST",
//     date: "2026.05.14",
//     firstName: "Emma",
//     userType: "influencer",
//   },
//   {
//     requestId: "REQ-1003",
//     requestType: "CAMPAIGN_REQUEST",
//     date: "2026.05.14",
//     firstName: "Michael",
//     userType: "client",
//   },
//   {
//     requestId: "REQ-1004",
//     requestType: "BESPOKE_CAMPAIGN_REQUEST",
//     date: "2026.05.14",
//     firstName: "Sophia",
//     userType: "client",
//   },
//   {
//     requestId: "REQ-1005",
//     requestType: "PROPOSAL_CAMPAIGN_REQUEST",
//     date: "2026.05.14",
//     firstName: "Daniel",
//     userType: "client",
//   },
//   {
//     requestId: "REQ-1006",
//     requestType: "NEW_SOCIAL_ACCOUNT_REQUEST",
//     date: "2026.05.14",
//     firstName: "Olivia",
//     userType: "influencer",
//   },
//   {
//     requestId: "REQ-1007",
//     requestType: "PRICE_UPDATE_REQUEST",
//     date: "2026.05.14",
//     firstName: "Liam",
//     userType: "influencer",
//   },
//   {
//     requestId: "REQ-1008",
//     requestType: "CAMPAIGN_REQUEST",
//     date: "2026.05.14",
//     firstName: "Charlotte",
//     userType: "client",
//   },
//   {
//     requestId: "REQ-1009",
//     requestType: "NEW_SOCIAL_ACCOUNT_REQUEST",
//     date: "2026.05.14",
//     firstName: "Ethan",
//     userType: "influencer",
//   },
//   {
//     requestId: "REQ-1010",
//     requestType: "PRICE_UPDATE_REQUEST",
//     date: "2026.05.14",
//     firstName: "Mia",
//     userType: "influencer",
//   },
// ];
