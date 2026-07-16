import type { IOfferHeader } from "@/entities/influencers-offers/model/influencers-offers.types.ts";
import {
  ADD_OFFER_ACTION_WIDTH,
  BRAND_COL_WIDTH,
  FOLLOWERS_COL_WIDTH,
  PRICE_PER_FOLLOWER_COL_WIDTH,
  VERTICAL_SCROLLBAR_WIDTH,
} from "@/widgets/influencers-offers/offers-matrix/model/offers-matrix.config.ts";
import { Switch, SwitchThumb } from "@radix-ui/react-switch";

import s from "./offers-matrix.module.scss";

interface OffersMatrixHeaderProps {
  displayOffers: IOfferHeader[];
  scrollLeft: number;
  tableWidth: number;
  offerColWidth: number;
  verticalCanScroll: boolean;
  showSkeleton: boolean;
  showEmptyOfferArea: boolean;
  activeOfferIdsSet: Set<string>;
  onToggleOfferActive?: (offerId: string, isActive: boolean) => void;
}

export const OffersMatrixHeader = ({
  displayOffers,
  scrollLeft,
  tableWidth,
  offerColWidth,
  verticalCanScroll,
  showSkeleton,
  showEmptyOfferArea,
  activeOfferIdsSet,
  onToggleOfferActive,
}: OffersMatrixHeaderProps) => {
  return (
    <div
      className={s.headerClip}
      style={{
        marginRight: ADD_OFFER_ACTION_WIDTH,
      }}
    >
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

            {showEmptyOfferArea && <col style={{ width: offerColWidth }} />}

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
                      <>
                        <div className={s.text} title={offer.title}>
                          {offer.title}
                        </div>

                        <Switch
                          className={s.offerSwitchRoot}
                          checked={activeOfferIdsSet.has(offer.offerId)}
                          onCheckedChange={(isActive) =>
                            onToggleOfferActive?.(offer.offerId, isActive)
                          }
                          aria-label={`Toggle ${offer.title} edit mode`}
                        >
                          <SwitchThumb className={s.offerSwitchThumb} />
                        </Switch>
                      </>
                    )}
                  </div>
                </th>
              ))}

              {showEmptyOfferArea && (
                <th className={s.offerHeader}>
                  <div className={s.offerHeaderInner} />
                </th>
              )}

              {verticalCanScroll && <th className={s.scrollbarHeaderSpacer} />}
            </tr>
          </thead>
        </table>
      </div>
    </div>
  );
};
