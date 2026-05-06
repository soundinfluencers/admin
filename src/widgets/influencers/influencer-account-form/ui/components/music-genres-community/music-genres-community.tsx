import React from "react";
import { FormBlockHeader } from "@/widgets/influencers/influencer-account-form/ui/components/form-block-header";
import { BaseCheckboxTreeField } from "@/shared/ui";
import {
  MUSIC_GENRES_COMMUNITY,
  type TInfluencerAccountFormValues,
} from "@/widgets/influencers/influencer-account-form/model";

import s from './music-genres-community.module.scss';

export const MusicGenresCommunity: React.FC = () => {
  return (
    <div className={s.musicGenresCommunity}>
      <FormBlockHeader
        title="Music genres"
        subtitle="Select all the applicable"
      />

      <BaseCheckboxTreeField<TInfluencerAccountFormValues>
        name="musicGenresCommunity"
        options={MUSIC_GENRES_COMMUNITY}
      />
    </div>
  );
};
