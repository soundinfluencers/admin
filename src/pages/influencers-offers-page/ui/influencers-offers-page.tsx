import { PageBreadcrumbs } from "@/widgets/page-breadcrumbs";
import { PageTitle } from "@/widgets/page-title";
import { PlatformsFilterBar } from "@/widgets/influencers-offers/platform-filter-bar";
import { GenreFilterBar } from "@/widgets/influencers-offers/genre-filter-bar";
import { OffersMatrixActions } from "@/widgets/influencers-offers/offers-matrix-actions";
import {
  EMPTY_INFLUENCERS_OFFERS_MATRIX,
  useInfluencersOffersPageState,
} from "@/pages/influencers-offers-page/model/use-influencers-offers-page-state.ts";
import {
  useInfluencersOffersInfiniteQuery,
} from "@/pages/influencers-offers-page/model/use-influencers-offers.query.ts";
import { OffersMatrix } from "@/widgets/influencers-offers/offers-matrix";

import s from './influencers-offers-page.module.scss';

/**
 * TODO: Offers edit mode is paused.
 * Current design does not match API/business logic.
 * Keep matrix read-only until product/design confirms how account checkboxes should work.
 * Done:
 * - GET matrix works
 * - URL state works
 * - infinite query works
 * - vertical accounts cursor works
 * - horizontal offers cursor works
 * - table renders offerHeaders/accountRows/links
 * - custom scrollbars work
 * - skeleton/empty/overlay prepared
 * Paused:
 * - platform/genre filters work
 * - edit mode
 * - checkbox behavior
 * - PATCH links
 * - publish
 * - export
 * - add offer
 * - card view
 * **/

export const InfluencersOffersPage = () => {
  const {
    platform,
    genre,
    mode,
    queryParams,
    handlePlatformChange,
    handleGenreChange,
    handleModeChange,
  } = useInfluencersOffersPageState();

  const {
    matrix,
    isPending,
    isError,
    isFetchingNextPage,
    fetchNextAccountsPage,
    fetchNextOffersPage,
  } = useInfluencersOffersInfiniteQuery(queryParams);

  const matrixData = matrix ?? EMPTY_INFLUENCERS_OFFERS_MATRIX;

  return (
    <div className={s.offersPage}>
      <PageBreadcrumbs
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Influencers offers" },
        ]}
      />

      <div className={s.wrapper}>
        <div className={s.header}>
          <PageTitle
            title="Influencers offers"
          />

          <div className={s.toolbar}>
            <PlatformsFilterBar
              platform={platform}
              onPlatformChange={handlePlatformChange}
              isDisabled={isPending}
            />
            <GenreFilterBar
              genre={genre}
              onGenreChange={handleGenreChange}
              isDisabled={isPending}
            />
          </div>
        </div>

        <div className={s.tableWrapper}>
          <OffersMatrixActions
            mode={mode}
            onToggleOffersView={handleModeChange}
            isDisabled={isPending || isError}
          />

          {mode === "offers" ?
            isError ? (
              <div>Error loading Influencers Offers. Please try again later.</div>
            ) : (
              <OffersMatrix
                data={matrixData}
                isLoading={isPending}
                isFetching={isFetchingNextPage}
                onLoadMoreAccounts={fetchNextAccountsPage}
                onLoadMoreOffers={fetchNextOffersPage}
              />
            )
            :
            (
              <div>Card view</div>
            )
          }
        </div>
      </div>
    </div>
  );
};
