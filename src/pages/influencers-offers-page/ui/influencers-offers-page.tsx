import { useCallback, useMemo, useState } from "react";
import { PageBreadcrumbs } from "@/widgets/page-breadcrumbs";
import { PageTitle } from "@/widgets/page-title";
import { OffersMatrixActions } from "@/widgets/influencers-offers/offers-matrix-actions";
import {
  EMPTY_INFLUENCERS_OFFERS_MATRIX,
  useInfluencersOffersPageState,
} from "@/pages/influencers-offers-page/model/use-influencers-offers-page-state.ts";
import {
  useInfluencersOffersInfiniteQuery,
} from "@/pages/influencers-offers-page/model/use-influencers-offers.query.ts";
import { OffersMatrix } from "@/widgets/influencers-offers/offers-matrix";
import { OffersFilterByPlatform } from "@/features/influencers-offers/offers-filter-by-platform";
import { OffersFilterByGenres } from "@/features/influencers-offers/offers-filter-by-genres";
import { CreateOfferModal } from "@/features/influencers-offers/create-offer";
import { useUpdateInfluencersOfferLinksMutation } from "@/features/influencers-offers/update-offer-links";
import { usePublishInfluencersOffersMutation } from "@/features/influencers-offers/publish-offers";

import s from './influencers-offers-page.module.scss';

type TInactiveOfferIdsByFilter = Record<string, string[]>;

const EMPTY_INACTIVE_OFFER_IDS: string[] = [];

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
 * - add offer
 * Paused:
 * - platform/genre filters work
 * - edit mode
 * - checkbox behavior
 * - PATCH links
 * - publish
 * - export
 * - card view
 * **/

export const InfluencersOffersPage = () => {
  const [isCreateOfferModalOpen, setIsCreateOfferModalOpen] = useState(false);
  const [inactiveOfferIdsByFilter, setInactiveOfferIdsByFilter] =
    useState<TInactiveOfferIdsByFilter>({});
  const {
    mutate: updateOfferLinks,
    isPending: isUpdatingOfferLinks,
  } = useUpdateInfluencersOfferLinksMutation();
  const {
    mutate: publishOffers,
    isPending: isPublishingOffers,
  } = usePublishInfluencersOffersMutation();

  const {
    platform,
    genre,
    genreOptions,
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
  const filterKey = `${platform}:${genre}`;
  const inactiveOfferIds =
    inactiveOfferIdsByFilter[filterKey] ?? EMPTY_INACTIVE_OFFER_IDS;

  const activeOfferIds = useMemo(() => {
    const inactiveOfferIdSet = new Set(inactiveOfferIds);

    return matrixData.offerHeaders
      .map((offer) => offer.offerId)
      .filter((offerId) => !inactiveOfferIdSet.has(offerId));
  }, [inactiveOfferIds, matrixData.offerHeaders]);

  const handleToggleOfferActive = useCallback(
    (offerId: string, isActive: boolean) => {
      setInactiveOfferIdsByFilter((prevInactiveOfferIdsByFilter) => {
        const prevInactiveOfferIds =
          prevInactiveOfferIdsByFilter[filterKey] ?? EMPTY_INACTIVE_OFFER_IDS;

        if (isActive) {
          const nextInactiveOfferIds = prevInactiveOfferIds.filter(
            (inactiveOfferId) => inactiveOfferId !== offerId,
          );

          if (nextInactiveOfferIds.length === 0) {
            const nextInactiveOfferIdsByFilter = {
              ...prevInactiveOfferIdsByFilter,
            };

            delete nextInactiveOfferIdsByFilter[filterKey];

            return nextInactiveOfferIdsByFilter;
          }

          return {
            ...prevInactiveOfferIdsByFilter,
            [filterKey]: nextInactiveOfferIds,
          };
        }

        if (prevInactiveOfferIds.includes(offerId)) {
          return prevInactiveOfferIdsByFilter;
        }

        return {
          ...prevInactiveOfferIdsByFilter,
          [filterKey]: [...prevInactiveOfferIds, offerId],
        };
      });
    },
    [filterKey],
  );

  const handlePublishOffers = useCallback(() => {
    if (
      !matrixData.offerHeaders.length ||
      isPending ||
      isError ||
      isPublishingOffers
    ) {
      return;
    }

    publishOffers({
      socialMedia: platform,
      genre,
    });
  }, [
    genre,
    isError,
    isPending,
    isPublishingOffers,
    matrixData.offerHeaders.length,
    platform,
    publishOffers,
  ]);

  const isPublishDisabled =
    isPending ||
    isError ||
    isPublishingOffers ||
    matrixData.offerHeaders.length === 0;

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
            <OffersFilterByPlatform
              value={platform}
              onFilterChange={handlePlatformChange}
              isDisabled={isPending}
            />

            <OffersFilterByGenres
              value={genre}
              options={genreOptions}
              onFilterChange={handleGenreChange}
              isDisabled={isPending}
            />
          </div>
        </div>

        <div className={s.tableWrapper}>
          <OffersMatrixActions
            mode={mode}
            onToggleOffersView={handleModeChange}
            isDisabled={isPending || isError}
            onPublishOffers={handlePublishOffers}
            isPublishDisabled={isPublishDisabled}
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
                onAddOffer={() => setIsCreateOfferModalOpen(true)}
                activeOfferIds={activeOfferIds}
                onToggleOfferActive={handleToggleOfferActive}
                onUpdateAccountOfferLinks={updateOfferLinks}
                isUpdatingAccountOfferLinks={isUpdatingOfferLinks}
              />
            )
            :
            (
              <div>Card view</div>
            )
          }
        </div>
      </div>

      {isCreateOfferModalOpen && (
        <CreateOfferModal
          socialMedia={platform}
          genre={genre}
          onClose={() => setIsCreateOfferModalOpen(false)}
        />
      )}
    </div>
  );
};
