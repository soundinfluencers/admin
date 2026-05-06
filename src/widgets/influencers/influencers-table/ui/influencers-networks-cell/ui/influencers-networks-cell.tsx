import React from "react";
import { Link } from "react-router-dom";
import { HideInfluencerAccount } from "@/features/influencers/hide-influencer-account";
import type { TSocialMediaValue } from "@/entities/influencers/model/influencers.constants.ts";

import clsx from "clsx";

import s from './influencers-networks-cell.module.scss';

interface InfluencersNetworksCellProps {
  influencerId: string;
  accountId: string;
  socialMedia: TSocialMediaValue;
  username: string;
  isHidden: boolean;
  logoUrl: string;
  className?: string;
}

export const InfluencersNetworksCell: React.FC<InfluencersNetworksCellProps> = ({
  influencerId,
  accountId,
  socialMedia,
  username,
  isHidden,
  logoUrl,
  className,
}) => {

  return (
    <div
      className={clsx(s.networksCell, className)}
      title={username}
    >

      <HideInfluencerAccount
        influencerId={influencerId}
        accountId={accountId}
        socialMedia={socialMedia}
        isHidden={isHidden}
        className={s.button}
      />

      <Link className={s.link} to={`/dashboard/influencers/${influencerId}`}>
        <img
          src={logoUrl}
          alt={username}
          loading={"lazy"}
          className={s.logo}
          width={32}
          height={32}
        />
        <span
          className={s.cellText}
        >
          {username}
        </span>
      </Link>
    </div>
  );
};
