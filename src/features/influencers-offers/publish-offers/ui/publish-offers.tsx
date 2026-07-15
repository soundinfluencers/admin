
import share from '@/assets/icons/share.svg';

import s from './publish-offers.module.scss';
import React from "react";

interface PublishOffersProps {
  isDisabled: boolean;
  onPublish: () => void;
}

export const PublishOffers: React.FC<PublishOffersProps> = ({
  isDisabled,
  onPublish,
}) => {
  return (
    <button
      type="button"
      className={s.publishBtn}
      onClick={onPublish}
      aria-label="Publish offers for current platform and genre"
      title="Publish offers for current platform and genre"
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
