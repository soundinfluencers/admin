import { useCampaignsQuery } from "@/entities/campaign/api/use-campaigns-query.ts";
import { useCampaignsPageState } from "@/pages/campaigns/model/use-campaigns-page-state.ts";
import { PageBreadcrumbs } from "@/widgets/page-breadcrumbs";
import { PageTitle } from "@/widgets/page-title";
import { CampaignsToolbar } from "@/widgets/campaigns/campaigns-toolbar";
import { CampaignsTable } from "@/widgets/campaigns/campaigns-table";
import { OpenCampaignPayments } from "@/features/campaigns/open-campaign-payments";
import { Pagination } from "@/shared/ui";

import styles from './campaigns-page.module.scss';

export const CampaignsPage = () => {
  const {
    page,
    status,
    mode,
    searchValue,
    queryParams,
    setPage,
    handleStatusChange,
    handleSearchChange,
    handleModeChange,
  } = useCampaignsPageState();

  const { data, isLoading, isFetching, isError } = useCampaignsQuery(queryParams);

  const campaigns = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className={styles.campaignsPage}>

      <PageBreadcrumbs
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Campaigns" },
        ]}
      />

      <div className={styles.content}>
        <div className={styles.top}>
          <PageTitle title={'Campaigns'}/>

          <CampaignsToolbar
            searchValue={searchValue}
            onSearchChange={handleSearchChange}
            status={status}
            onStatusChange={handleStatusChange}
          />
        </div>

        <div className={styles.bottom}>
          {isError ? (
            <div>Error loading campaigns. Please try again later.</div>
          ) : (
            <>
              <OpenCampaignPayments campaignMode={mode} onToggle={handleModeChange}/>

              <CampaignsTable
                data={campaigns}
                view={mode}
                isFetching={isFetching}
                isLoading={isLoading}
              />

              {!isLoading && (
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
