import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PageBreadcrumbs } from "@/shared/ui/page-breadcrumbs";
import { PageTitle } from "@/widgets/page-title";
import {
  useInfluencersHistoryDetailsPageState,
} from "@/pages/influencer-history/influencer-history-details-page/model/use-influencer-history-details-page-state.ts";
import {
  useInfluencersHistoryDetailQuery,
} from "@/entities/influencer-history/api/use-influencer-history-detail-query.ts";
import { Pagination } from "@/shared/ui";
import { InfluencerHistoryDetailTable } from "@/widgets/influencer-history/influencer-history-detail-table";
import { InfluencerAccountsList } from "@/widgets/influencer-history/influencer-accounts-list";
import { NotesEditor } from "@/features/influencer-history/notes-editor";

import { notifyApiError } from "@/app/api/errors/notify.ts";
import clsx from "clsx";

import rotate from '@/assets/icons/influencers/rotate-ccw.svg';
import edit from '@/assets/icons/influencers/edit-3.svg';

import s from './influencer-history-details-page.module.scss';

export const InfluencerHistoryDetailsPage = () => {
  const { page, queryParams, handlePageChange } = useInfluencersHistoryDetailsPageState();
  const { influencerId } = useParams();

  const [isEditing, setEditing] = useState(false);

  const { data, isLoading, isFetching, isError, error, refetch } = useInfluencersHistoryDetailQuery(influencerId, queryParams);

  useEffect(() => {
    if (isError && error) {
      notifyApiError(error);
    }
  }, [isError, error]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError && !data) {
    return <div>Error loading Influencer history. Please try again later.</div>;
  }

  console.log('Influencer History Details: ', data);

  const influencerActions = data?.history.actions ?? [];
  const influencerAccounts = data?.history.accounts ?? [];
  const totalPages = data?.totalPages ?? 1;
  const title = data?.history.influencerName || "Influencer History Details";
  const notes = data?.history.currencyNote.trim() ?? 'Currency note';

  return (
    <div className={s.influencerHistoryDetailsPage}>
      <PageBreadcrumbs
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Influencer history", to: "/dashboard/influencer-history" },
          { label: "Last updates" },
        ]}
      />

      <div className={s.content}>
        <div className={s.topbar}>
          <div className={s.header}>
            <PageTitle
              title={`${title} history`}
            />
            <div className={s.cta}>
              { isEditing ? (
                <NotesEditor
                  influencerId={influencerId!}
                  initialValue={notes}
                  onClose={() => setEditing(false)}
                />
              ) : (
                <button
                  className={s.action}
                  type="button"
                  onClick={() => setEditing(true)}
                  aria-label={"Edit currency note"}
                >
                  <img
                    className={s.ctaIcon}
                    src={edit}
                    alt=""
                    width={24}
                    height={24}
                  />

                  <span>{notes}</span>
                </button>
              )}

              <button
                className={s.action}
                type="button"
                onClick={() => {
                  if (!isFetching) void refetch();
                }}
                aria-label="Refresh data"
              >
                <img
                  className={clsx(s.ctaIcon, isFetching && s.rotate)}
                  src={rotate}
                  alt=""
                  width={24}
                  height={24}
                />
              </button>
            </div>
          </div>

          <InfluencerAccountsList
            accounts={influencerAccounts}
          />
        </div>

        <div className={s.tableWrapper}>
          <InfluencerHistoryDetailTable
            data={influencerActions}
            isFetching={isFetching}
          />

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};
