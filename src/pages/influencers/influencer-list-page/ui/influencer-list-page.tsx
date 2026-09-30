import { useInfluencersQuery } from "@/entities/influencers/api/use-influencers-query.ts";
import { useInfluencersListPageState } from "@/pages/influencers/influencer-list-page/model/use-influencers-list-page-state.ts";
import { PageBreadcrumbs } from "@/shared/ui/page-breadcrumbs";
import { PageTitle } from "@/widgets/page-title";
import { PlatformsFilterBar } from "@/widgets/influencers/platforms-filter-bar";
import { InfluencersToolbar } from "@/widgets/influencers/influencers-toolbar";
import { InfluencersTable } from "@/widgets/influencers/influencers-table";
import { Pagination } from "@/shared/ui";

import s from './influencer-list-page.module.scss';

export const InfluencersListPage = () => {
  const {
    page,
    limit,
    platform,
    searchValue,
    queryParams,
    handlePageChange,
    handleLimitChange,
    handleSearchChange,
    handlePlatformChange,
  } = useInfluencersListPageState();

  const { data, isLoading, isFetching, isError } = useInfluencersQuery(queryParams);

  const influencers = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className={s.influencersListPage}>
      <PageBreadcrumbs
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Influencers list" },
        ]}
      />

      <div className={s.content}>
        <PageTitle title={"Influencers list"}/>

        <div className={s.wrapper}>
          <InfluencersToolbar
            limit={limit}
            onLimitChange={handleLimitChange}
            searchValue={searchValue}
            onSearchChange={handleSearchChange}
            platform={platform}
          />

          <PlatformsFilterBar
            platform={platform}
            onPlatformChange={handlePlatformChange}
          />

          <div className={s.tableWrapper}>
            {isError ? (
              <div>Error loading Influencers list. Please try again later.</div>
            ) : (
              <>
                <InfluencersTable
                  data={influencers}
                  platform={platform}
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
    </div>
  );
};
