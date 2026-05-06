import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useMediaQuery } from "@/shared/hooks/use-media-query.ts";
import { PaymentHistoryMatrixCell } from "@/widgets/payment-history/payment-history-matrix";
import {
  createPaymentHistoryCellMap
} from "@/widgets/payment-history/payment-history-matrix/model/create-payment-history-cell-map.ts";
import type { IPaymentHistoryMatrix } from "@/entities/payment-history/model/payment-history.types.ts";

import s from "./payment-history-matrix.module.scss";

const VIEWPORT_WIDTH = 1224;

const ACCOUNT_COL_WIDTH = 189;
const CAMPAIGN_COL_WIDTH = 115;

const MAX_BODY_HEIGHT = 474;
const MIN_THUMB_SIZE = 40;
const SCROLL_END_OFFSET = 24;
const SCROLLBAR_INSET = 8;

const VERTICAL_SCROLLBAR_WIDTH = 11;

const SKELETON_ROWS = 8;
const SKELETON_CAMPAIGNS = 8;

interface ScrollMetrics {
  scrollLeft: number;
  scrollTop: number;
  clientWidth: number;
  clientHeight: number;
  scrollWidth: number;
  scrollHeight: number;
}

interface PaymentHistoryMatrixProps {
  data: IPaymentHistoryMatrix;
  isFetching?: boolean;
  isLoading?: boolean;
  onLoadMoreCampaigns?: () => void;
  onLoadMoreAccounts?: () => void;
}

export const PaymentHistoryMatrix: React.FC<PaymentHistoryMatrixProps> = ({
  data,
  isFetching,
  isLoading,
  onLoadMoreCampaigns,
  onLoadMoreAccounts,
}) => {
  const cellMap = useMemo(
    () => createPaymentHistoryCellMap(data.cells),
    [data.cells],
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

    if (isBottom && data.meta?.accountsNextCursor) {
      onLoadMoreAccounts?.();
    }
  }, [data.meta?.accountsNextCursor, onLoadMoreAccounts, updateBodyMetrics]);

  const handleFooterScroll = useCallback(() => {
    const footer = footerScrollRef.current;

    if (!footer) return;

    setScrollLeft(footer.scrollLeft);
    updateFooterMetrics();

    const isEnd =
      footer.scrollLeft + footer.clientWidth >=
      footer.scrollWidth - SCROLL_END_OFFSET;

    if (isEnd && data.meta?.campaignsNextCursor) {
      onLoadMoreCampaigns?.();
    }
  }, [
    data.meta?.campaignsNextCursor,
    onLoadMoreCampaigns,
    updateFooterMetrics,
  ]);

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
    data.accounts.length,
    data.campaigns.length,
    updateBodyMetrics,
    updateFooterMetrics,
  ]);

  const verticalCanScroll = bodyMetrics.scrollHeight > bodyMetrics.clientHeight;
  const horizontalCanScroll =
    footerMetrics.scrollWidth > footerMetrics.clientWidth;

  const visibleCampaignsWidth =
    VIEWPORT_WIDTH - ACCOUNT_COL_WIDTH - (verticalCanScroll ? VERTICAL_SCROLLBAR_WIDTH : 0);

  const campaignColWidth = Math.max(
    CAMPAIGN_COL_WIDTH,
    visibleCampaignsWidth / Math.max(data.campaigns.length, 1),
  );

  const campaignsWidth = data.campaigns.length * campaignColWidth;

  const tableWidth =
    ACCOUNT_COL_WIDTH +
    campaignsWidth +
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
    data.accounts.length === 0 &&
    data.campaigns.length === 0;

  const showEmptySearchResult =
    !isLoading &&
    data.accounts.length === 0 &&
    data.campaigns.length > 0;

  const displayAccounts = showSkeleton
    ? Array.from({ length: SKELETON_ROWS }).map((_, index) => ({
      accountId: `skeleton-account-${index}`,
      influencerId: "",
      username: "",
    }))
    : data.accounts;

  const displayCampaigns = showSkeleton
    ? Array.from({ length: SKELETON_CAMPAIGNS }).map((_, index) => ({
      campaignId: `skeleton-campaign-${index}`,
      campaignName: "",
      campaignCreatedAt: "",
      campaignStatus: "",
    }))
    : data.campaigns;

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
                <col style={{ width: ACCOUNT_COL_WIDTH }}/>

                {displayCampaigns.map((campaign) => (
                  <col
                    key={campaign.campaignId}
                    style={{ width: campaignColWidth }}
                  />
                ))}

                {verticalCanScroll && (
                  <col style={{ width: VERTICAL_SCROLLBAR_WIDTH }}/>
                )}
              </colgroup>

              <thead>
              <tr>
                <th
                  className={s.accountHeader}
                  style={{ transform: `translateX(${scrollLeft}px)` }}
                >
                  <div className={s.accountHeaderInner}>Campaigns</div>
                </th>

                {displayCampaigns.map((campaign) => (
                  <th key={campaign.campaignId} className={s.campaignHeader}>
                    <div className={s.text} title={campaign.campaignName}>
                      {showSkeleton ? (
                        <div className={s.skeletonCell} />
                      ) : (
                        campaign.campaignName
                      )}
                    </div>
                  </th>
                ))}
                {verticalCanScroll && <th className={s.scrollbarHeaderSpacer}/>}
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
                  <col style={{ width: ACCOUNT_COL_WIDTH }}/>

                  {displayCampaigns.map((campaign) => (
                    <col
                      key={campaign.campaignId}
                      style={{ width: campaignColWidth }}
                    />
                  ))}
                </colgroup>

                <tbody>
                {showEmpty || showEmptySearchResult ? (
                  <tr>
                    <td
                      className={s.stateCell}
                      colSpan={Math.max(displayCampaigns.length + 1, 1)}
                    >
                      {showEmptySearchResult
                        ? "No matching payment history found"
                        : "No payment history found"}
                    </td>
                  </tr>
                ) : (
                  displayAccounts.map((account, index, array) => {
                      const isFirst = index === 0;
                      const isLast = index === array.length - 1;

                      return (
                        <tr
                          key={account.accountId}
                        >
                          <th
                            className={s.accountCell}
                            style={{
                              transform: `translateX(${scrollLeft}px)`,
                              paddingTop: isFirst ? verticalSpacing : undefined,
                              paddingBottom: isLast ? verticalSpacing : undefined,
                            }}
                          >
                            <div className={s.accountCellInner}>
                              {showSkeleton ? (
                                <div className={s.skeletonCell} />
                              ) : (
                                <div className={s.text} title={account.username}>
                                  {account.username}
                                </div>
                              )}
                            </div>
                          </th>

                          {displayCampaigns.map((campaign) => {
                            const cell = cellMap.get(
                              `${campaign.campaignId}:${account.accountId}`,
                            );

                            return (
                              <td
                                key={campaign.campaignId}
                                className={s.cell}
                                style={{
                                  paddingTop: isFirst ? verticalSpacing : undefined,
                                  paddingBottom: isLast ? verticalSpacing : undefined,
                                }}
                              >
                                {showSkeleton ? (
                                  <div className={s.skeletonCell}/>
                                ) : (
                                  <PaymentHistoryMatrixCell cell={cell}/>
                                )}
                              </td>
                            );
                          })}

                          {verticalCanScroll && <td className={s.scrollbarBodySpacer}/>}
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
            style={{ width: ACCOUNT_COL_WIDTH }}
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
                  width: Math.max(campaignsWidth, visibleCampaignsWidth),
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
