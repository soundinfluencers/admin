import add from "@/assets/icons/plus.svg";

import s from "./offers-matrix.module.scss";

interface OffersMatrixAddOfferActionProps {
  onAddOffer?: () => void;
  disabled?: boolean;
}

export const OffersMatrixAddOfferAction = ({
  onAddOffer,
  disabled,
}: OffersMatrixAddOfferActionProps) => {
  return (
    <div
      className={s.addOfferAction}
      style={{
        right: 0,
      }}
    >
      <button
        className={s.addOfferButton}
        type="button"
        aria-label="Add offer"
        onClick={onAddOffer}
        disabled={disabled}
      >
        <img src={add} alt="" width={18} height={18} />
      </button>
    </div>
  );
};
