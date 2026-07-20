import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useMediaQuery } from "@/shared/hooks/use-media-query.ts";
import type {
  IInfluencersOfferLinkRequest,
  IInfluencersOffersMatrix,
  IOfferAccountRow,
  IOfferHeader,
  IUpdateInfluencersOfferPriceRequest,
} from "@/entities/influencers-offers/model/influencers-offers.types.ts";
import {
  getOfferAccountLinkKey,
  getOfferAccountRowKey,
} from "@/pages/influencers-offers-page/model/influencers-offers-page.helpers.ts";
import { createInfluencersOffersLinksMap } from "@/widgets/influencers-offers/offers-matrix/model/create-influencers-offers-links-map.ts";
import {
  ADD_OFFER_ACTION_WIDTH,
  LEFT_COLUMNS_WIDTH,
  MIN_THUMB_SIZE,
  OFFER_COL_WIDTH,
  SCROLLBAR_INSET,
  SCROLL_END_OFFSET,
  SKELETON_OFFERS,
  SKELETON_ROWS,
  VERTICAL_SCROLLBAR_WIDTH,
  VIEWPORT_WIDTH,
} from "@/widgets/influencers-offers/offers-matrix/model/offers-matrix.config.ts";
import type { ScrollMetrics } from "@/widgets/influencers-offers/offers-matrix/model/offers-matrix.types.ts";
import { OffersMatrixAddOfferAction } from "@/widgets/influencers-offers/offers-matrix/ui/offers-matrix-add-offer-action.tsx";
import { OffersMatrixBody } from "@/widgets/influencers-offers/offers-matrix/ui/offers-matrix-body.tsx";
import { OffersMatrixBusinessFooter } from "@/widgets/influencers-offers/offers-matrix/ui/offers-matrix-business-footer.tsx";
import { OffersMatrixHeader } from "@/widgets/influencers-offers/offers-matrix/ui/offers-matrix-header.tsx";
import { OffersMatrixHorizontalScrollbar } from "@/widgets/influencers-offers/offers-matrix/ui/offers-matrix-horizontal-scrollbar.tsx";

import s from "./offers-matrix.module.scss";

interface OffersMatrixProps {
  data: IInfluencersOffersMatrix;
  isFetching?: boolean;
  isLoading?: boolean;
  onLoadMoreOffers?: () => void;
  onLoadMoreAccounts?: () => void;
  onAddOffer?: () => void;
  activeOfferIds?: string[];
  onToggleOfferActive?: (offerId: string, isActive: boolean) => void;
  onUpdateAccountOfferLinks?: (
    requests: IInfluencersOfferLinkRequest[],
  ) => Promise<unknown> | void;
  isUpdatingAccountOfferLinks?: boolean;
  onUpdateOfferPrice?: (request: IUpdateInfluencersOfferPriceRequest) => void;
  updatingOfferPriceId?: string;
  onDeleteOffer?: (offer: Pick<IOfferHeader, "offerId" | "title">) => void;
  deletingOfferId?: string;
}

export const OffersMatrix: React.FC<OffersMatrixProps> = ({
  data,
  isFetching,
  isLoading,
  onLoadMoreOffers,
  onLoadMoreAccounts,
  onAddOffer,
  activeOfferIds = [],
  onToggleOfferActive,
  onUpdateAccountOfferLinks,
  isUpdatingAccountOfferLinks,
  onUpdateOfferPrice,
  updatingOfferPriceId,
  onDeleteOffer,
  deletingOfferId,
}) => {
  const linksMap = useMemo(
    () => createInfluencersOffersLinksMap(data.links),
    [data.links],
  );

  const activeOfferIdsSet = useMemo(
    () => new Set(activeOfferIds),
    [activeOfferIds],
  );

  const [scrollLeft, setScrollLeft] = useState(0);
  const [updatingAccountKey, setUpdatingAccountKey] = useState<string | null>(
    null,
  );

  const [bodyMetrics, setBodyMetrics] = useState<ScrollMetrics>({
    scrollLeft: 0,
    scrollTop: 0,
    clientWidth: 1,
    clientHeight: 1,
    scrollWidth: 1,
    scrollHeight: 1,
  });

  const [footerMetrics, setFooterMetrics] = useState<ScrollMetrics>({
    scrollLeft: 0,
    scrollTop: 0,
    clientWidth: 1,
    clientHeight: 1,
    scrollWidth: 1,
    scrollHeight: 1,
  });

  const bodyScrollRef = useRef<HTMLDivElement | null>(null);
  const footerScrollRef = useRef<HTMLDivElement | null>(null);

  const verticalDragRef = useRef({
    startPointerY: 0,
    startScrollTop: 0,
  });

  const horizontalDragRef = useRef({
    startPointerX: 0,
    startScrollLeft: 0,
  });

  const updateBodyMetrics = useCallback(() => {
    const body = bodyScrollRef.current;

    if (!body) return;

    setBodyMetrics({
      scrollLeft: body.scrollLeft,
      scrollTop: body.scrollTop,
      clientWidth: body.clientWidth,
      clientHeight: body.clientHeight,
      scrollWidth: body.scrollWidth,
      scrollHeight: body.scrollHeight,
    });
  }, []);

  const updateFooterMetrics = useCallback(() => {
    const footer = footerScrollRef.current;

    if (!footer) return;

    setFooterMetrics({
      scrollLeft: footer.scrollLeft,
      scrollTop: footer.scrollTop,
      clientWidth: footer.clientWidth,
      clientHeight: footer.clientHeight,
      scrollWidth: footer.scrollWidth,
      scrollHeight: footer.scrollHeight,
    });
  }, []);

  const handleBodyScroll = useCallback(() => {
    const body = bodyScrollRef.current;

    if (!body) return;

    updateBodyMetrics();

    const isBottom =
      body.scrollTop + body.clientHeight >=
      body.scrollHeight - SCROLL_END_OFFSET;

    if (isBottom && data.accountsNextCursor) {
      onLoadMoreAccounts?.();
    }
  }, [data.accountsNextCursor, onLoadMoreAccounts, updateBodyMetrics]);

  const handleFooterScroll = useCallback(() => {
    const footer = footerScrollRef.current;

    if (!footer) return;

    setScrollLeft(footer.scrollLeft);
    updateFooterMetrics();

    const isEnd =
      footer.scrollLeft + footer.clientWidth >=
      footer.scrollWidth - SCROLL_END_OFFSET;

    if (isEnd && data.offersNextCursor) {
      onLoadMoreOffers?.();
    }
  }, [data.offersNextCursor, onLoadMoreOffers, updateFooterMetrics]);

  useEffect(() => {
    updateBodyMetrics();
    updateFooterMetrics();

    const body = bodyScrollRef.current;
    const footer = footerScrollRef.current;

    if (!body || !footer) return;

    const observer = new ResizeObserver(() => {
      updateBodyMetrics();
      updateFooterMetrics();
    });

    observer.observe(body);
    observer.observe(footer);

    return () => observer.disconnect();
  }, [
    data.accountRows.length,
    data.offerHeaders.length,
    updateBodyMetrics,
    updateFooterMetrics,
  ]);

  const showSkeleton = Boolean(isLoading);
  const showOverlay = Boolean(isFetching && !isLoading);
  const showEmptyOfferArea = !showSkeleton && data.offerHeaders.length === 0;

  const verticalCanScroll = bodyMetrics.scrollHeight > bodyMetrics.clientHeight;
  const horizontalCanScroll =
    footerMetrics.scrollWidth > footerMetrics.clientWidth;

  const visibleOffersWidth =
    VIEWPORT_WIDTH -
    LEFT_COLUMNS_WIDTH -
    ADD_OFFER_ACTION_WIDTH -
    (verticalCanScroll ? VERTICAL_SCROLLBAR_WIDTH : 0);

  const offerColWidth = Math.max(
    OFFER_COL_WIDTH,
    visibleOffersWidth / Math.max(data.offerHeaders.length, 1),
  );

  const offersWidth = data.offerHeaders.length * offerColWidth;
  const renderedOffersWidth = showEmptyOfferArea
    ? visibleOffersWidth
    : offersWidth;

  const tableWidth =
    LEFT_COLUMNS_WIDTH +
    renderedOffersWidth +
    (verticalCanScroll ? VERTICAL_SCROLLBAR_WIDTH : 0);

  const verticalTrackHeight = Math.max(
    bodyMetrics.clientHeight - SCROLLBAR_INSET * 2,
    1,
  );

  const horizontalTrackWidth = Math.max(footerMetrics.clientWidth, 1);

  const verticalThumbHeight = verticalCanScroll
    ? Math.max(
      (bodyMetrics.clientHeight / bodyMetrics.scrollHeight) *
      verticalTrackHeight,
      MIN_THUMB_SIZE,
    )
    : 0;

  const verticalThumbTop = verticalCanScroll
    ? (bodyMetrics.scrollTop /
      Math.max(bodyMetrics.scrollHeight - bodyMetrics.clientHeight, 1)) *
    (verticalTrackHeight - verticalThumbHeight)
    : 0;

  const horizontalThumbWidth = horizontalCanScroll
    ? Math.max(
      (footerMetrics.clientWidth / footerMetrics.scrollWidth) *
      horizontalTrackWidth,
      MIN_THUMB_SIZE,
    )
    : 0;

  const horizontalThumbLeft = horizontalCanScroll
    ? (footerMetrics.scrollLeft /
      Math.max(footerMetrics.scrollWidth - footerMetrics.clientWidth, 1)) *
    (horizontalTrackWidth - horizontalThumbWidth)
    : 0;

  const handleVerticalTrackPointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    const body = bodyScrollRef.current;

    if (!body) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const clickY = event.clientY - rect.top;

    body.scrollTop =
      (clickY / rect.height) * body.scrollHeight - body.clientHeight / 2;
  };

  const handleHorizontalTrackPointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    const footer = footerScrollRef.current;

    if (!footer) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;

    footer.scrollLeft =
      (clickX / rect.width) * footer.scrollWidth - footer.clientWidth / 2;
  };

  const handleVerticalThumbPointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    const body = bodyScrollRef.current;

    if (!body) return;

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);

    verticalDragRef.current = {
      startPointerY: event.clientY,
      startScrollTop: body.scrollTop,
    };
  };

  const handleVerticalThumbPointerMove = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    const body = bodyScrollRef.current;

    if (!body) return;
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;

    const deltaY = event.clientY - verticalDragRef.current.startPointerY;

    const maxScrollTop = body.scrollHeight - body.clientHeight;
    const maxThumbTop = verticalTrackHeight - verticalThumbHeight;

    body.scrollTop =
      verticalDragRef.current.startScrollTop +
      (deltaY / Math.max(maxThumbTop, 1)) * maxScrollTop;
  };

  const handleHorizontalThumbPointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    const footer = footerScrollRef.current;

    if (!footer) return;

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);

    horizontalDragRef.current = {
      startPointerX: event.clientX,
      startScrollLeft: footer.scrollLeft,
    };
  };

  const handleHorizontalThumbPointerMove = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    const footer = footerScrollRef.current;

    if (!footer) return;
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;

    const deltaX = event.clientX - horizontalDragRef.current.startPointerX;

    const maxScrollLeft = footer.scrollWidth - footer.clientWidth;
    const maxThumbLeft = horizontalTrackWidth - horizontalThumbWidth;

    footer.scrollLeft =
      horizontalDragRef.current.startScrollLeft +
      (deltaX / Math.max(maxThumbLeft, 1)) * maxScrollLeft;
  };

  const isTablet = useMediaQuery("(max-width: 811px)");
  const verticalSpacing = isTablet ? 8 : 16;

  const getLinkedActiveOfferIds = useCallback(
    (account: IOfferAccountRow) =>
      activeOfferIds.filter((offerId) =>
        linksMap.has(
          getOfferAccountLinkKey({
            offerId,
            influencerId: account.influencerId,
            accountId: account.accountId,
          }),
        ),
      ),
    [activeOfferIds, linksMap],
  );

  const handleAccountOfferLinksToggle = useCallback(
    async (account: IOfferAccountRow) => {
      if (
        !activeOfferIds.length ||
        isUpdatingAccountOfferLinks ||
        !onUpdateAccountOfferLinks
      ) {
        return;
      }

      const linkedActiveOfferIds = getLinkedActiveOfferIds(account);
      const missingOfferIds = activeOfferIds.filter(
        (offerId) => !linkedActiveOfferIds.includes(offerId),
      );

      const requests: IInfluencersOfferLinkRequest[] =
        missingOfferIds.length > 0
          ? missingOfferIds.map((offerId) => ({
            offerId,
            influencerId: account.influencerId,
            accountId: account.accountId,
            connected: true,
          }))
          : activeOfferIds.map((offerId) => ({
            offerId,
            influencerId: account.influencerId,
            accountId: account.accountId,
            connected: false,
          }));

      if (!requests.length) return;

      setUpdatingAccountKey(getOfferAccountRowKey(account));

      try {
        await onUpdateAccountOfferLinks(requests);
      } catch {
        // Mutation state/error handling stays in React Query; this only owns row UI cleanup.
      } finally {
        setUpdatingAccountKey(null);
      }
    },
    [
      activeOfferIds,
      getLinkedActiveOfferIds,
      isUpdatingAccountOfferLinks,
      onUpdateAccountOfferLinks,
    ],
  );

  const showEmpty =
    !isLoading &&
    data.accountRows.length === 0 &&
    data.offerHeaders.length === 0;

  const showEmptyAccounts =
    !isLoading &&
    data.accountRows.length === 0 &&
    data.offerHeaders.length > 0;

  const displayAccounts = showSkeleton
    ? Array.from({ length: SKELETON_ROWS }).map((_, index) => ({
      influencerId: `skeleton-influencer-${index}`,
      accountId: `skeleton-account-${index}`,
      username: "",
      followers: 0,
      price: 0,
      pricePerFollower: 0,
      logoUrl: null,
    }))
    : data.accountRows;

  const displayOffers = showSkeleton
    ? Array.from({ length: SKELETON_OFFERS }).map((_, index) => ({
      offerId: `skeleton-offer-${index}`,
      title: "",
      isPublished: false,
      offerPrice: 0,
      costPrice: 0,
      combinedFollowers: 0,
      createdAt: "",
    }))
    : data.offerHeaders;

  return (
    <div className={s.outerScroll}>
      <div className={s.wrapper}>
        {showOverlay && <div className={s.overlay} />}

        <OffersMatrixAddOfferAction
          onAddOffer={onAddOffer}
          disabled={showSkeleton}
        />

        <OffersMatrixHeader
          displayOffers={displayOffers}
          scrollLeft={scrollLeft}
          tableWidth={tableWidth}
          offerColWidth={offerColWidth}
          verticalCanScroll={verticalCanScroll}
          showSkeleton={showSkeleton}
          showEmptyOfferArea={showEmptyOfferArea}
          activeOfferIdsSet={activeOfferIdsSet}
          onToggleOfferActive={onToggleOfferActive}
        />

        <OffersMatrixBody
          displayAccounts={displayAccounts}
          displayOffers={displayOffers}
          linksMap={linksMap}
          activeOfferIds={activeOfferIds}
          scrollLeft={scrollLeft}
          tableWidth={tableWidth}
          offerColWidth={offerColWidth}
          verticalCanScroll={verticalCanScroll}
          verticalSpacing={verticalSpacing}
          showSkeleton={showSkeleton}
          showEmptyOfferArea={showEmptyOfferArea}
          showEmpty={showEmpty}
          showEmptyAccounts={showEmptyAccounts}
          verticalThumbHeight={verticalThumbHeight}
          verticalThumbTop={verticalThumbTop}
          bodyScrollRef={bodyScrollRef}
          onBodyScroll={handleBodyScroll}
          onVerticalTrackPointerDown={handleVerticalTrackPointerDown}
          onVerticalThumbPointerDown={handleVerticalThumbPointerDown}
          onVerticalThumbPointerMove={handleVerticalThumbPointerMove}
          getLinkedActiveOfferIds={getLinkedActiveOfferIds}
          onAccountOfferLinksToggle={handleAccountOfferLinksToggle}
          canUpdateAccountOfferLinks={Boolean(onUpdateAccountOfferLinks)}
          isUpdatingAccountOfferLinks={isUpdatingAccountOfferLinks}
          updatingAccountKey={updatingAccountKey}
        />

        {!showSkeleton && (
          <OffersMatrixBusinessFooter
            displayOffers={displayOffers}
            activeOfferIdsSet={activeOfferIdsSet}
            scrollLeft={scrollLeft}
            offerColWidth={offerColWidth}
            offersWidth={offersWidth}
            visibleOffersWidth={visibleOffersWidth}
            verticalCanScroll={verticalCanScroll}
            showEmptyOfferArea={showEmptyOfferArea}
            onUpdateOfferPrice={onUpdateOfferPrice}
            updatingOfferPriceId={updatingOfferPriceId}
            onDeleteOffer={onDeleteOffer}
            deletingOfferId={deletingOfferId}
          />
        )}

        <OffersMatrixHorizontalScrollbar
          footerScrollRef={footerScrollRef}
          offersWidth={offersWidth}
          visibleOffersWidth={visibleOffersWidth}
          verticalCanScroll={verticalCanScroll}
          horizontalCanScroll={horizontalCanScroll}
          horizontalThumbWidth={horizontalThumbWidth}
          horizontalThumbLeft={horizontalThumbLeft}
          onFooterScroll={handleFooterScroll}
          onHorizontalTrackPointerDown={handleHorizontalTrackPointerDown}
          onHorizontalThumbPointerDown={handleHorizontalThumbPointerDown}
          onHorizontalThumbPointerMove={handleHorizontalThumbPointerMove}
        />
      </div>
    </div>
  );
};
