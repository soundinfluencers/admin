import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useMediaQuery } from "@/shared/hooks/use-media-query.ts";
import type { IInfluencersOffersMatrix } from "@/entities/influencers-offers/model/influencers-offers.types.ts";
import { getOfferAccountLinkKey } from "@/pages/influencers-offers-page/model/influencers-offers-page.helpers.ts";
import { createInfluencersOffersLinksMap } from "@/widgets/influencers-offers/offers-matrix/model/create-influencers-offers-links-map.ts";
import { OffersMatrixCell } from "@/widgets/influencers-offers/offers-matrix/ui/offers-matrix-cell.tsx";

import add from '@/assets/icons/plus.svg';

import s from "./offers-matrix.module.scss";

const VIEWPORT_WIDTH = 1224;

const BRAND_COL_WIDTH = 200;
const FOLLOWERS_COL_WIDTH = 110;
const PRICE_PER_FOLLOWER_COL_WIDTH = 158;
const OFFER_COL_WIDTH = 101;

const LEFT_COLUMNS_WIDTH =
  BRAND_COL_WIDTH + FOLLOWERS_COL_WIDTH + PRICE_PER_FOLLOWER_COL_WIDTH;

const MAX_BODY_HEIGHT = 490;
const MIN_THUMB_SIZE = 70;
const SCROLL_END_OFFSET = 24;
const SCROLLBAR_INSET = 8;
const VERTICAL_SCROLLBAR_WIDTH = 22;

const SKELETON_ROWS = 8;
const SKELETON_OFFERS = 8;

interface ScrollMetrics {
  scrollLeft: number;
  scrollTop: number;
  clientWidth: number;
  clientHeight: number;
  scrollWidth: number;
  scrollHeight: number;
}

interface OffersMatrixProps {
  data: IInfluencersOffersMatrix;
  isFetching?: boolean;
  isLoading?: boolean;
  onLoadMoreOffers?: () => void;
  onLoadMoreAccounts?: () => void;
}

export const OffersMatrix: React.FC<OffersMatrixProps> = ({
  data,
  isFetching,
  isLoading,
  onLoadMoreOffers,
  onLoadMoreAccounts,
}) => {
  const linksMap = useMemo(
    () => createInfluencersOffersLinksMap(data.links),
    [data.links],
  );

  const [scrollLeft, setScrollLeft] = useState(0);

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

  const verticalCanScroll = bodyMetrics.scrollHeight > bodyMetrics.clientHeight;
  const horizontalCanScroll =
    footerMetrics.scrollWidth > footerMetrics.clientWidth;

  const visibleOffersWidth =
    VIEWPORT_WIDTH -
    LEFT_COLUMNS_WIDTH -
    (verticalCanScroll ? VERTICAL_SCROLLBAR_WIDTH : 0);

  const offerColWidth = Math.max(
    OFFER_COL_WIDTH,
    visibleOffersWidth / Math.max(data.offerHeaders.length, 1),
  );

  const offersWidth = data.offerHeaders.length * offerColWidth;

  const tableWidth =
    LEFT_COLUMNS_WIDTH +
    offersWidth +
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

  const showSkeleton = Boolean(isLoading);
  const showOverlay = Boolean(isFetching && !isLoading);

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
      logoUrl: null,
    }))
    : data.accountRows;

  const displayOffers = showSkeleton
    ? Array.from({ length: SKELETON_OFFERS }).map((_, index) => ({
      offerId: `skeleton-offer-${index}`,
      title: "",
      isPublished: false,
      price: 0,
      createdAt: "",
    }))
    : data.offerHeaders;

  return (
    <div className={s.outerScroll}>
      <div className={s.wrapper}>
        {showOverlay && <div className={s.overlay} />}

        <div className={s.headerClip}>
          <div
            className={s.headerShift}
            style={{
              width: tableWidth,
              transform: `translateX(${-scrollLeft}px)`,
            }}
          >
            <table className={s.table} style={{ minWidth: tableWidth }}>
              <colgroup>
                <col style={{ width: BRAND_COL_WIDTH }} />
                <col style={{ width: FOLLOWERS_COL_WIDTH }} />
                <col style={{ width: PRICE_PER_FOLLOWER_COL_WIDTH }} />

                {displayOffers.map((offer) => (
                  <col key={offer.offerId} style={{ width: offerColWidth }} />
                ))}

                {verticalCanScroll && (
                  <col style={{ width: VERTICAL_SCROLLBAR_WIDTH }} />
                )}
              </colgroup>

              <thead>
              <tr>
                <th
                  className={s.brandHeader}
                  style={{ transform: `translateX(${scrollLeft}px)` }}
                >
                  <div className={s.headerCellInner}>
                    <div className={s.text}>Brand name</div>
                  </div>
                </th>

                <th
                  className={s.followersHeader}
                  style={{ transform: `translateX(${scrollLeft}px)` }}
                >
                  <div className={s.headerCellInner}>
                    <div className={s.text}>Followers</div>
                  </div>
                </th>

                <th
                  className={s.priceHeader}
                  style={{ transform: `translateX(${scrollLeft}px)` }}
                >
                  <div className={s.headerCellInner}>
                    <div className={s.text}>Price per follower</div>
                  </div>
                </th>

                {displayOffers.map((offer) => (
                  <th key={offer.offerId} className={s.offerHeader}>
                    <div className={s.offerHeaderInner}>
                      {showSkeleton ? (
                        <div className={s.skeletonCell} />
                      ) : (
                        <div className={s.text} title={offer.title}>
                          {offer.title}
                        </div>
                      )}
                    </div>
                  </th>
                ))}

                {verticalCanScroll && (
                  <th className={s.addOfferHeaderCell}>
                    <button
                      className={s.addOfferButton}
                      type="button"
                      aria-label="Add offer"
                      onClick={() => alert("Add offer is not implemented yet!") /* Replace with actual add offer logic */ }
                    >
                      <img src={add} alt="" width={18} height={18} />
                    </button>
                  </th>
                )}
              </tr>
              </thead>
            </table>
          </div>
        </div>

        <div className={s.bodyArea}>
          <div
            ref={bodyScrollRef}
            className={s.bodyScroll}
            style={{ maxHeight: MAX_BODY_HEIGHT }}
            onScroll={handleBodyScroll}
          >
            <div
              className={s.bodyShift}
              style={{
                width: tableWidth,
                transform: `translateX(${-scrollLeft}px)`,
              }}
            >
              <table className={s.table} style={{ minWidth: tableWidth }}>
                <colgroup>
                  <col style={{ width: BRAND_COL_WIDTH }} />
                  <col style={{ width: FOLLOWERS_COL_WIDTH }} />
                  <col style={{ width: PRICE_PER_FOLLOWER_COL_WIDTH }} />

                  {displayOffers.map((offer) => (
                    <col key={offer.offerId} style={{ width: offerColWidth }} />
                  ))}

                  {verticalCanScroll && (
                    <col style={{ width: VERTICAL_SCROLLBAR_WIDTH }} />
                  )}
                </colgroup>

                <tbody>
                {showEmpty || showEmptyAccounts ? (
                  <tr>
                    <td
                      className={s.stateCell}
                      colSpan={Math.max(displayOffers.length + 3, 1)}
                    >
                      {showEmptyAccounts
                        ? "No accounts found for this selection"
                        : "No offers found"}
                    </td>
                  </tr>
                ) : (
                  displayAccounts.map((account, index, array) => {
                    const isFirst = index === 0;
                    const isLast = index === array.length - 1;

                    return (
                      <tr key={`${account.influencerId}:${account.accountId}`}>
                        <th
                          className={s.brandCell}
                          style={{
                            transform: `translateX(${scrollLeft}px)`,
                            paddingTop: isFirst ? verticalSpacing : undefined,
                            paddingBottom: isLast
                              ? verticalSpacing
                              : undefined,
                          }}
                        >
                          <div className={s.leftCellInner}>
                            {showSkeleton ? (
                              <div className={s.skeletonCell} />
                            ) : (
                              <div className={s.text} title={account.username}>
                                {account.username}
                              </div>
                            )}
                          </div>
                        </th>

                        <td
                          className={s.followersCell}
                          style={{
                            transform: `translateX(${scrollLeft}px)`,
                            paddingTop: isFirst ? verticalSpacing : undefined,
                            paddingBottom: isLast
                              ? verticalSpacing
                              : undefined,
                          }}
                        >
                          <div className={s.leftCellInner}>
                            {showSkeleton ? (
                              <div className={s.skeletonCell} />
                            ) : (
                              "—"
                            )}
                          </div>
                        </td>

                        <td
                          className={s.priceCell}
                          style={{
                            transform: `translateX(${scrollLeft}px)`,
                            paddingTop: isFirst ? verticalSpacing : undefined,
                            paddingBottom: isLast
                              ? verticalSpacing
                              : undefined,
                          }}
                        >
                          <div className={s.leftCellInner}>
                            {showSkeleton ? (
                              <div className={s.skeletonCell} />
                            ) : (
                              "—"
                            )}
                          </div>
                        </td>

                        {displayOffers.map((offer) => {
                          const link = linksMap.get(
                            getOfferAccountLinkKey({
                              offerId: offer.offerId,
                              influencerId: account.influencerId,
                              accountId: account.accountId,
                            }),
                          );

                          return (
                            <td
                              key={offer.offerId}
                              className={s.cell}
                              style={{
                                paddingTop: isFirst
                                  ? verticalSpacing
                                  : undefined,
                                paddingBottom: isLast
                                  ? verticalSpacing
                                  : undefined,
                              }}
                            >
                              {showSkeleton ? (
                                <div className={s.skeletonCell} />
                              ) : (
                                <OffersMatrixCell link={link} />
                              )}
                            </td>
                          );
                        })}

                        {verticalCanScroll && (
                          <td className={s.scrollbarBodySpacer} />
                        )}
                      </tr>
                    );
                  })
                )}
                </tbody>
              </table>
            </div>
          </div>

          {verticalCanScroll && (
            <div className={s.verticalScrollbarGutter}>
              <div
                className={s.verticalTrack}
                onPointerDown={handleVerticalTrackPointerDown}
              >
                <div
                  className={s.verticalThumb}
                  style={{
                    height: verticalThumbHeight,
                    transform: `translateY(${verticalThumbTop}px)`,
                  }}
                  onPointerDown={handleVerticalThumbPointerDown}
                  onPointerMove={handleVerticalThumbPointerMove}
                />
              </div>
            </div>
          )}
        </div>

        <div className={s.scrollFooter}>
          <div
            className={s.scrollSpacerLeft}
            style={{ width: LEFT_COLUMNS_WIDTH }}
          />

          <div className={s.footerArea}>
            <div
              ref={footerScrollRef}
              className={s.footerScroll}
              onScroll={handleFooterScroll}
            >
              <div
                className={s.footerScrollContent}
                style={{
                  width: Math.max(offersWidth, visibleOffersWidth),
                }}
              />
            </div>

            {horizontalCanScroll && (
              <div
                className={s.horizontalTrack}
                onPointerDown={handleHorizontalTrackPointerDown}
              >
                <div
                  className={s.horizontalThumb}
                  style={{
                    width: horizontalThumbWidth,
                    transform: `translateX(${horizontalThumbLeft}px)`,
                  }}
                  onPointerDown={handleHorizontalThumbPointerDown}
                  onPointerMove={handleHorizontalThumbPointerMove}
                />
              </div>
            )}
          </div>

          {verticalCanScroll && (
            <div
              className={s.footerGutter}
              style={{ width: VERTICAL_SCROLLBAR_WIDTH }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
