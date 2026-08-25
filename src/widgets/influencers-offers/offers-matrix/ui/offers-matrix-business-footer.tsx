import React, { useCallback, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { toast } from "react-toastify";

import type {
  IOfferHeader,
  IUpdateInfluencersOfferPriceRequest,
} from "@/entities/influencers-offers/model/influencers-offers.types.ts";
import { useClickOutside } from "@/shared/hooks/use-click-outside.ts";
import { formatCompactNumber } from "@/shared/libs/format/format-compact-number.ts";
import { TableFieldEditor } from "@/shared/ui/table-field-editor";
import {
  LEFT_COLUMNS_WIDTH,
  VERTICAL_SCROLLBAR_WIDTH,
} from "@/widgets/influencers-offers/offers-matrix/model/offers-matrix.config.ts";
import trashIcon from "@/assets/icons/trash-2.svg";

import s from "./offers-matrix-business-footer.module.scss";

interface OffersMatrixBusinessFooterProps {
  displayOffers: IOfferHeader[];
  activeOfferIdsSet: Set<string>;
  scrollLeft: number;
  offerColWidth: number;
  offersWidth: number;
  visibleOffersWidth: number;
  verticalCanScroll: boolean;
  showEmptyOfferArea: boolean;
  onUpdateOfferPrice?: (request: IUpdateInfluencersOfferPriceRequest) => void;
  updatingOfferPriceId?: string;
  onDeleteOffer?: (offer: Pick<IOfferHeader, "offerId" | "title">) => void;
  deletingOfferId?: string;
}

const formatOfferPrice = (value: number) => `${value}€`;
const sanitizeOfferPriceInput = (raw: string) => raw.replace(/\D/g, "");

interface OfferPriceEditorProps {
  offer: IOfferHeader;
  isPending: boolean;
  onUpdateOfferPrice?: (request: IUpdateInfluencersOfferPriceRequest) => void;
}

const OfferPriceEditor = ({
  offer,
  isPending,
  onUpdateOfferPrice,
}: OfferPriceEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isTouchDevice = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches,
    [],
  );

  useClickOutside(containerRef, () => {
    if (!isEditing) return;

    inputRef.current?.blur();
  });

  const openEditor = useCallback(
    (event: React.SyntheticEvent) => {
      event.stopPropagation();

      if (!onUpdateOfferPrice || isPending) return;

      setIsEditing(true);
    },
    [isPending, onUpdateOfferPrice],
  );

  const closeEditor = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleSave = useCallback(
    (rawValue: string) => {
      if (!onUpdateOfferPrice || isPending) return;

      const trimmedValue = rawValue.trim();

      if (!trimmedValue) {
        closeEditor();
        return;
      }

      const parsedValue = Number(trimmedValue);

      if (!Number.isFinite(parsedValue)) {
        toast("Enter a valid number", {
          type: "warning",
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      if (parsedValue === offer.offerPrice) {
        closeEditor();
        return;
      }

      onUpdateOfferPrice({
        offerId: offer.offerId,
        field: "price",
        value: parsedValue,
      });
      closeEditor();
    },
    [closeEditor, isPending, offer.offerId, offer.offerPrice, onUpdateOfferPrice],
  );

  return (
    <div
      ref={containerRef}
      className={s.offerPriceValue}
      onClick={isTouchDevice ? openEditor : undefined}
      onDoubleClick={!isTouchDevice ? openEditor : undefined}
      title={
        onUpdateOfferPrice
          ? "Double click to edit offer price"
          : formatOfferPrice(offer.offerPrice)
      }
    >
      {isEditing ? (
        <TableFieldEditor
          ref={inputRef}
          initialValue={String(offer.offerPrice)}
          onSaveChange={handleSave}
          isPending={isPending}
          onClose={closeEditor}
          inputId={`offer-price-${offer.offerId}`}
          inputMode="numeric"
          sanitizeValue={sanitizeOfferPriceInput}
        />
      ) : (
        <span
          className={s.priceValue}
          title={String(offer.offerPrice)}
        >
          {formatOfferPrice(offer.offerPrice)}
        </span>
      )}
    </div>
  );
};

export const OffersMatrixBusinessFooter = ({
  displayOffers,
  activeOfferIdsSet,
  scrollLeft,
  offerColWidth,
  offersWidth,
  visibleOffersWidth,
  verticalCanScroll,
  showEmptyOfferArea,
  onUpdateOfferPrice,
  updatingOfferPriceId,
  onDeleteOffer,
  deletingOfferId,
}: OffersMatrixBusinessFooterProps) => {
  const stripWidth = showEmptyOfferArea ? visibleOffersWidth : offersWidth;

  return (
    <div className={s.footer}>
      <div
        className={s.leftArea}
        style={{ width: LEFT_COLUMNS_WIDTH }}
      />

      <div className={s.offerViewport}>
        <div
          className={s.offerStrip}
          style={{
            width: stripWidth,
            transform: `translateX(${-scrollLeft}px)`,
          }}
        >
          {showEmptyOfferArea ? (
            <div
              className={s.offerCell}
              style={{
                width: visibleOffersWidth,
              }}
            >
              <div className={s.offerCellInner} />
            </div>
          ) : (
            displayOffers.map((offer) => (
              <div
                key={offer.offerId}
                className={s.offerCell}
                style={{
                  width: offerColWidth,
                }}
              >
                <div className={s.offerCellInner}>
                  <div className={s.priceSummary}>
                    <div className={s.costBlock}>
                      <div className={s.priceLabel}>our cost</div>
                      <div className={s.priceValue} title={String(offer.costPrice)}>
                        {formatOfferPrice(offer.costPrice)}
                      </div>
                    </div>

                    <div className={s.offerPriceBlock}>
                      <div className={s.priceLabel}>offer price</div>
                      <OfferPriceEditor
                        offer={offer}
                        isPending={updatingOfferPriceId === offer.offerId}
                        onUpdateOfferPrice={onUpdateOfferPrice}
                      />
                    </div>
                  </div>

                  <div className={clsx(s.followersLabel, {
                    [s.active]: activeOfferIdsSet.has(offer.offerId)
                  })}>
                    Followers
                  </div>

                  <div
                    className={s.followersValue}
                    aria-label="Followers total"
                  >
                    {formatCompactNumber(offer.combinedFollowers)}
                  </div>

                  <div
                    className={s.deleteSlot}
                  >
                    <button
                      className={s.deleteButton}
                      type="button"
                      aria-label={`Delete offer ${offer.title}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        onDeleteOffer?.({
                          offerId: offer.offerId,
                          title: offer.title,
                        });
                      }}
                      disabled={
                        !onDeleteOffer || deletingOfferId === offer.offerId
                      }
                    >
                      <img
                        src={trashIcon}
                        alt=""
                        width={18}
                        height={18}
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {verticalCanScroll && (
        <div
          className={s.rightGutter}
          style={{ width: VERTICAL_SCROLLBAR_WIDTH }}
        />
      )}
    </div>
  );
};
