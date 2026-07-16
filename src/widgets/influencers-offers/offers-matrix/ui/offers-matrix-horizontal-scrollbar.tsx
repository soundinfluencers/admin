import type React from "react";

import {
  LEFT_COLUMNS_WIDTH,
  VERTICAL_SCROLLBAR_WIDTH,
} from "@/widgets/influencers-offers/offers-matrix/model/offers-matrix.config.ts";

import s from "./offers-matrix.module.scss";

interface OffersMatrixHorizontalScrollbarProps {
  footerScrollRef: React.RefObject<HTMLDivElement | null>;
  offersWidth: number;
  visibleOffersWidth: number;
  verticalCanScroll: boolean;
  horizontalCanScroll: boolean;
  horizontalThumbWidth: number;
  horizontalThumbLeft: number;
  onFooterScroll: () => void;
  onHorizontalTrackPointerDown: (
    event: React.PointerEvent<HTMLDivElement>,
  ) => void;
  onHorizontalThumbPointerDown: (
    event: React.PointerEvent<HTMLDivElement>,
  ) => void;
  onHorizontalThumbPointerMove: (
    event: React.PointerEvent<HTMLDivElement>,
  ) => void;
}

export const OffersMatrixHorizontalScrollbar = ({
  footerScrollRef,
  offersWidth,
  visibleOffersWidth,
  verticalCanScroll,
  horizontalCanScroll,
  horizontalThumbWidth,
  horizontalThumbLeft,
  onFooterScroll,
  onHorizontalTrackPointerDown,
  onHorizontalThumbPointerDown,
  onHorizontalThumbPointerMove,
}: OffersMatrixHorizontalScrollbarProps) => {
  return (
    <div className={s.scrollFooter}>
      <div
        className={s.scrollSpacerLeft}
        style={{ width: LEFT_COLUMNS_WIDTH }}
      />

      <div className={s.footerArea}>
        <div
          ref={footerScrollRef}
          className={s.footerScroll}
          onScroll={onFooterScroll}
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
            onPointerDown={onHorizontalTrackPointerDown}
          >
            <div
              className={s.horizontalThumb}
              style={{
                width: horizontalThumbWidth,
                transform: `translateX(${horizontalThumbLeft}px)`,
              }}
              onPointerDown={onHorizontalThumbPointerDown}
              onPointerMove={onHorizontalThumbPointerMove}
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
  );
};
