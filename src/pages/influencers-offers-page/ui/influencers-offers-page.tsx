import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { PageBreadcrumbs } from "@/widgets/page-breadcrumbs";
import { PageTitle } from "@/widgets/page-title";
import type { IOfferHeader } from "@/entities/influencers-offers/model/influencers-offers.types.ts";
import { OffersMatrixActions } from "@/widgets/influencers-offers/offers-matrix-actions";
import {
  EMPTY_INFLUENCERS_OFFERS_MATRIX,
  useInfluencersOffersPageState,
} from "@/pages/influencers-offers-page/model/use-influencers-offers-page-state.ts";
import {
  useInfluencersOffersInfiniteQuery,
} from "@/pages/influencers-offers-page/model/use-influencers-offers.query.ts";
import { useClientsOffersQuery } from "@/pages/influencers-offers-page/model/use-clients-offers.query.ts";
import { OffersMatrix } from "@/widgets/influencers-offers/offers-matrix";
import { OfferCarousel } from "@/widgets/influencers-offers";
import { OffersFilterByPlatform } from "@/features/influencers-offers/offers-filter-by-platform";
import { OffersFilterByGenres } from "@/features/influencers-offers/offers-filter-by-genres";
import { CreateOfferModal } from "@/features/influencers-offers/create-offer";
import { useUpdateInfluencersOfferLinksMutation } from "@/features/influencers-offers/update-offer-links";
import { usePublishInfluencersOffersMutation } from "@/features/influencers-offers/publish-offers";
import { useUpdateInfluencersOfferPriceMutation } from "@/features/influencers-offers/update-offer-price";
import {
  DeleteOfferConfirmationModal,
  useDeleteInfluencersOfferMutation,
} from "@/features/influencers-offers/delete-offer";

import s from './influencers-offers-page.module.scss';

type TInactiveOfferIdsByFilter = Record<string, string[]>;
type TSelectedOfferForDelete = Pick<IOfferHeader, "offerId" | "title">;

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
  const [selectedOfferForDelete, setSelectedOfferForDelete] =
    useState<TSelectedOfferForDelete | null>(null);
  const isDeleteSubmittingRef = useRef(false);
  const [inactiveOfferIdsByFilter, setInactiveOfferIdsByFilter] =
    useState<TInactiveOfferIdsByFilter>({});

  const {
    mutateAsync: updateOfferLinksAsync,
    isPending: isUpdatingOfferLinks,
  } = useUpdateInfluencersOfferLinksMutation();
  const {
    mutate: publishOffers,
    isPending: isPublishingOffers,
  } = usePublishInfluencersOffersMutation();
  const {
    mutate: updateOfferPrice,
    isPending: isUpdatingOfferPrice,
    variables: updatingOfferPriceVariables,
  } = useUpdateInfluencersOfferPriceMutation();
  const {
    mutateAsync: deleteOfferAsync,
    isPending: isDeletingOffer,
    variables: deletingOfferVariables,
  } = useDeleteInfluencersOfferMutation();

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

  const {
    data,
    isPending: isClientPending,
    isError: isClientError,
  } = useClientsOffersQuery({
    socialMedia: platform,
    genre,
  });

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

  useEffect(() => {
    setInactiveOfferIdsByFilter((prevInactiveOfferIdsByFilter) => {
      const prevInactiveOfferIds =
        prevInactiveOfferIdsByFilter[filterKey] ?? EMPTY_INACTIVE_OFFER_IDS;

      if (!prevInactiveOfferIds.length) {
        return prevInactiveOfferIdsByFilter;
      }

      const currentOfferIds = new Set(
        matrixData.offerHeaders.map((offer) => offer.offerId),
      );
      const nextInactiveOfferIds = prevInactiveOfferIds.filter((offerId) =>
        currentOfferIds.has(offerId),
      );

      if (nextInactiveOfferIds.length === prevInactiveOfferIds.length) {
        return prevInactiveOfferIdsByFilter;
      }

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
    });
  }, [filterKey, matrixData.offerHeaders]);

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

  const handleOpenDeleteOfferModal = useCallback(
    (offer: TSelectedOfferForDelete) => {
      if (isDeletingOffer) return;

      setSelectedOfferForDelete(offer);
    },
    [isDeletingOffer],
  );

  const handleCloseDeleteOfferModal = useCallback(() => {
    if (isDeletingOffer) return;

    setSelectedOfferForDelete(null);
  }, [isDeletingOffer]);

  const handleConfirmDeleteOffer = useCallback(async () => {
    if (
      !selectedOfferForDelete ||
      isDeletingOffer ||
      isDeleteSubmittingRef.current
    ) {
      return;
    }

    const offerToDelete = selectedOfferForDelete;

    isDeleteSubmittingRef.current = true;

    try {
      await deleteOfferAsync({
        offerId: offerToDelete.offerId,
      });

      toast("Offer deleted successfully.", {
        type: "success",
        position: "top-right",
        autoClose: 3000,
      });

      setSelectedOfferForDelete((currentSelectedOffer) =>
        currentSelectedOffer?.offerId === offerToDelete.offerId
          ? null
          : currentSelectedOffer,
      );
    } catch {
      toast("Failed to delete offer.", {
        type: "error",
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      isDeleteSubmittingRef.current = false;
    }
  }, [deleteOfferAsync, isDeletingOffer, selectedOfferForDelete]);

  const isPublishDisabled =
    isPending ||
    isError ||
    isPublishingOffers ||
    matrixData.offerHeaders.length === 0;

  const isInitialLoading = isClientPending && !data;
  const offers = data ?? [];

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
            platform={platform}
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
                onUpdateAccountOfferLinks={updateOfferLinksAsync}
                isUpdatingAccountOfferLinks={isUpdatingOfferLinks}
                onUpdateOfferPrice={updateOfferPrice}
                updatingOfferPriceId={
                  isUpdatingOfferPrice
                    ? updatingOfferPriceVariables?.offerId
                    : undefined
                }
                onDeleteOffer={handleOpenDeleteOfferModal}
                deletingOfferId={
                  isDeletingOffer
                    ? deletingOfferVariables?.offerId
                    : undefined
                }
              />
            )
            :
            (
              <OfferCarousel
                offers={offers}
                isLoading={isInitialLoading}
                isError={isClientError}
              />
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

      {selectedOfferForDelete && (
        <DeleteOfferConfirmationModal
          offerTitle={selectedOfferForDelete.title}
          isPending={isDeletingOffer}
          onCancel={handleCloseDeleteOfferModal}
          onConfirm={handleConfirmDeleteOffer}
        />
      )}
    </div>
  );
};
