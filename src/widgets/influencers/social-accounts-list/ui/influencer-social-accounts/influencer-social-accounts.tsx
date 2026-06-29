import React from "react";
import { SOCIAL_ACCOUNTS_PLATFORM_CONFIG, SocialPlatformCard } from "@/widgets/influencers/social-accounts-list";
import type { TSocialAccountShort } from "@/entities/influencers/social-account/model/social-account.types.ts";
import type { TPlatform } from "@/shared/types/types.ts";

import s from './influencer-social-accounts.module.scss';

interface InfluencerSocialAccountsProps {
  details: Record<TPlatform, TSocialAccountShort[]>;
}

export const InfluencerSocialAccounts: React.FC<InfluencerSocialAccountsProps> = ({
  details,
}) => {

  return (
    <div className={s.influencerSocialAccounts}>
      {SOCIAL_ACCOUNTS_PLATFORM_CONFIG.map((platform) => (
        <SocialPlatformCard
          key={platform.value}
          platform={platform.value}
          platformLabel={platform.label}
          platformIcon={platform.icon}
          accounts={details[platform.value]}
        />
      ))}
    </div>
  );
};
