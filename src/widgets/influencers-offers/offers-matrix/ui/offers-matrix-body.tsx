import type React from "react";

import type {
  IOfferAccountRow,
  IOfferHeader,
  IOfferLink,
} from "@/entities/influencers-offers/model/influencers-offers.types.ts";
import {
  getOfferAccountLinkKey,
  getOfferAccountRowKey,
} from "@/pages/influencers-offers-page/model/influencers-offers-page.helpers.ts";
import {
  BRAND_COL_WIDTH,
  FOLLOWERS_COL_WIDTH,
  MAX_BODY_HEIGHT,
  PRICE_PER_FOLLOWER_COL_WIDTH,
  VERTICAL_SCROLLBAR_WIDTH,
} from "@/widgets/influencers-offers/offers-matrix/model/offers-matrix.config.ts";
import { CircleLoader } from "@/shared/ui/circle-loader/circle-loader.tsx";
import { OffersMatrixCell } from "@/widgets/influencers-offers/offers-matrix/ui/offers-matrix-cell.tsx";

import s from "./offers-matrix.module.scss";

interface OffersMatrixBodyProps {
  displayAccounts: IOfferAccountRow[];
  displayOffers: IOfferHeader[];
  linksMap: Map<string, IOfferLink>;
  activeOfferIds: string[];
  scrollLeft: number;
  tableWidth: number;
  offerColWidth: number;
  verticalCanScroll: boolean;
  verticalSpacing: number;
  showSkeleton: boolean;
  showEmptyOfferArea: boolean;
  showEmpty: boolean;
  showEmptyAccounts: boolean;
  verticalThumbHeight: number;
  verticalThumbTop: number;
  bodyScrollRef: React.RefObject<HTMLDivElement | null>;
  onBodyScroll: () => void;
  onVerticalTrackPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  onVerticalThumbPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  onVerticalThumbPointerMove: (event: React.PointerEvent<HTMLDivElement>) => void;
  getLinkedActiveOfferIds: (account: IOfferAccountRow) => string[];
  onAccountOfferLinksToggle: (account: IOfferAccountRow) => void;
  canUpdateAccountOfferLinks: boolean;
  isUpdatingAccountOfferLinks?: boolean;
  updatingAccountKey?: string | null;
}

export const OffersMatrixBody = ({
  displayAccounts,
  displayOffers,
  linksMap,
  activeOfferIds,
  scrollLeft,
  tableWidth,
  offerColWidth,
  verticalCanScroll,
  verticalSpacing,
  showSkeleton,
  showEmptyOfferArea,
  showEmpty,
  showEmptyAccounts,
  verticalThumbHeight,
  verticalThumbTop,
  bodyScrollRef,
  onBodyScroll,
  onVerticalTrackPointerDown,
  onVerticalThumbPointerDown,
  onVerticalThumbPointerMove,
  getLinkedActiveOfferIds,
  onAccountOfferLinksToggle,
  canUpdateAccountOfferLinks,
  isUpdatingAccountOfferLinks,
  updatingAccountKey,
}: OffersMatrixBodyProps) => {
  return (
    <div className={s.bodyArea}>
      <div
        ref={bodyScrollRef}
        className={s.bodyScroll}
        style={{ maxHeight: MAX_BODY_HEIGHT }}
        onScroll={onBodyScroll}
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

              {showEmptyOfferArea && <col style={{ width: offerColWidth }} />}

              {verticalCanScroll && (
                <col style={{ width: VERTICAL_SCROLLBAR_WIDTH }} />
              )}
            </colgroup>

            <tbody>
              {showEmpty || showEmptyAccounts ? (
                <tr>
                  <td
                    className={s.stateCell}
                    colSpan={
                      displayOffers.length +
                      3 +
                      (showEmptyOfferArea ? 1 : 0) +
                      (verticalCanScroll ? 1 : 0)
                    }
                  >
                    {showEmptyAccounts
                      ? "No accounts found for this selection"
                      : "No offers found"}
                  </td>
                </tr>
              ) : (
                displayAccounts.map((account, index, array) => {
                  const accountKey = getOfferAccountRowKey(account);
                  const isFirst = index === 0;
                  const isLast = index === array.length - 1;
                  const linkedActiveOfferIds = showSkeleton
                    ? []
                    : getLinkedActiveOfferIds(account);
                  const activeOfferCount = activeOfferIds.length;
                  const isLinkedToAllActiveOffers =
                    activeOfferCount > 0 &&
                    linkedActiveOfferIds.length === activeOfferCount;
                  const isLinkedToSomeActiveOffers =
                    linkedActiveOfferIds.length > 0 &&
                    linkedActiveOfferIds.length < activeOfferCount;
                  const isAccountActionDisabled =
                    showSkeleton ||
                    activeOfferCount === 0 ||
                    !canUpdateAccountOfferLinks ||
                    Boolean(isUpdatingAccountOfferLinks);
                  const isCurrentAccountUpdating =
                    Boolean(isUpdatingAccountOfferLinks) &&
                    updatingAccountKey === accountKey;

                  return (
                    <tr key={accountKey}>
                      <th
                        className={s.brandCell}
                        style={{
                          transform: `translateX(${scrollLeft}px)`,
                          paddingTop: isFirst ? verticalSpacing : undefined,
                          paddingBottom: isLast ? verticalSpacing : undefined,
                        }}
                      >
                        <div className={s.leftCellInner}>
                          {showSkeleton ? (
                            <div className={s.skeletonCell} />
                          ) : (
                            <>
                              {isCurrentAccountUpdating ? (
                                <CircleLoader />
                              ) : (
                                <button
                                  className={s.accountOfferAction}
                                  type="button"
                                  role="checkbox"
                                  aria-label={`Update offers for ${account.username}`}
                                  aria-checked={
                                    isLinkedToSomeActiveOffers
                                      ? "mixed"
                                      : isLinkedToAllActiveOffers
                                  }
                                  data-state={
                                    isLinkedToSomeActiveOffers
                                      ? "mixed"
                                      : isLinkedToAllActiveOffers
                                        ? "checked"
                                        : "unchecked"
                                  }
                                  onClick={() =>
                                    onAccountOfferLinksToggle(account)
                                  }
                                  disabled={isAccountActionDisabled}
                                />
                              )}
                              <div className={s.text} title={account.username}>
                                {account.username}
                              </div>
                            </>
                          )}
                        </div>
                      </th>

                      <td
                        className={s.followersCell}
                        style={{
                          transform: `translateX(${scrollLeft}px)`,
                          paddingTop: isFirst ? verticalSpacing : undefined,
                          paddingBottom: isLast ? verticalSpacing : undefined,
                        }}
                      >
                        <div className={s.leftCellInner}>
                          {showSkeleton ? (
                            <div className={s.skeletonCell} />
                          ) : (
                            account.followers
                          )}
                        </div>
                      </td>

                      <td
                        className={s.priceCell}
                        style={{
                          transform: `translateX(${scrollLeft}px)`,
                          paddingTop: isFirst ? verticalSpacing : undefined,
                          paddingBottom: isLast ? verticalSpacing : undefined,
                        }}
                      >
                        <div className={s.leftCellInner}>
                          {showSkeleton ? (
                            <div className={s.skeletonCell} />
                          ) : (
                            account.pricePerFollower
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
                              paddingTop: isFirst ? verticalSpacing : undefined,
                              paddingBottom: isLast
                                ? verticalSpacing
                                : undefined,
                            }}
                          >
                            {showSkeleton ? (
                              <div className={s.skeletonCell} />
                            ) : (
                              <OffersMatrixCell
                                link={link}
                                price={account.price}
                              />
                            )}
                          </td>
                        );
                      })}

                      {showEmptyOfferArea && (
                        <td
                          className={s.cell}
                          style={{
                            paddingTop: isFirst ? verticalSpacing : undefined,
                            paddingBottom: isLast
                              ? verticalSpacing
                              : undefined,
                          }}
                        />
                      )}

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
            onPointerDown={onVerticalTrackPointerDown}
          >
            <div
              className={s.verticalThumb}
              style={{
                height: verticalThumbHeight,
                transform: `translateY(${verticalThumbTop}px)`,
              }}
              onPointerDown={onVerticalThumbPointerDown}
              onPointerMove={onVerticalThumbPointerMove}
            />
          </div>
        </div>
      )}
    </div>
  );
};
