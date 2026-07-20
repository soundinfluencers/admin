import React from "react";
import clsx from "clsx";
import { Button } from "@/shared/ui";
import { formatCompactNumber } from "@/shared/libs/format/format-compact-number.ts";
import type { IOffersClients } from "@/entities/influencers-offers/model/influencers-offers.types.ts";

import s from './offer-card.module.scss';

interface OfferCardProps {
  offer: IOffersClients;
}

export const OfferCard: React.FC<OfferCardProps> = ({
  offer,
}) => {
  return (
    <div className={s.container}>
      <p>Pages Included: {offer.networksAmount}</p>
      <p>Followers: {offer.combinedFollowers}</p>
      <article className={clsx(s.card)}>
        <div className={s.top}>
          <div className={s.info}>
            <div className={s.header}>
              <p className={s.title}>{offer.title}</p>
              <p className={s.price}>{offer.price}{"\u20AC"}</p>
            </div>
            <div className={s.details}>
              <p>{offer.storyAndPostDetails}</p>
              <p>{offer.networksAmount} networks with</p>
              <p>{formatCompactNumber(Number(offer.combinedFollowers))}+ Followers Combined</p>
            </div>
          </div>

          <Button
            className={s.button}
            variant="primary"
            size="large"
          >
            Choose
          </Button>
        </div>

        <div className={s.wrapper}>
          <ul className={s.list}>
            {offer.connectedAccounts.map((account) => (
              <li key={account.accountId} className={s.item}>
                <div className={s.account}>
                  <img
                    className={s.logo}
                    src={account.logoUrl}
                    alt=""
                    decoding="async"
                    loading="lazy"
                    width={32}
                    height={32}
                  />
                  <p title={account.username}>{account.username}</p>
                </div>
                <p>{formatCompactNumber(account.followers)}</p>
              </li>
            ))}
          </ul>
        </div>
      </article>
    </div>
  );
}
