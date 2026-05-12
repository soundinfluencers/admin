
import share from '@/assets/icons/share.svg';

import s from './publish-offers.module.scss';

export const PublishOffers = () => {
  return (
    <button
      type="button"
      className={s.publishBtn}
      onClick={() => alert("This function don't implemented yet!")}
      aria-label="Publish offers"
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
