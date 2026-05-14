
import share from '@/assets/icons/share.svg';

import s from './publish-offers.module.scss';
import React from "react";

interface PublishOffersProps {
  isDisabled: boolean;
}

export const PublishOffers: React.FC<PublishOffersProps> = ({
  isDisabled,
}) => {
  return (
    <button
      type="button"
      className={s.publishBtn}
      onClick={() => alert("This function don't implemented yet!")}
      aria-label="Publish offers"
      disabled={isDisabled}
    >
      <img
        className={s.publishIcon}
        src={share}
        width={20}
        height={18}
        alt=""
        aria-hidden
      />
      Publish
    </button>
  );
};
