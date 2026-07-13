
import share from '@/assets/icons/share.svg';

import s from './publish-offers.module.scss';
import React from "react";

export const PublishOffers: React.FC = () => {
  return (
    <button
      type="button"
      className={s.publishBtn}
      aria-label="Publish is temporarily disabled until backend contract is finalized."
      title="Publish is temporarily disabled until backend contract is finalized."
      disabled
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
