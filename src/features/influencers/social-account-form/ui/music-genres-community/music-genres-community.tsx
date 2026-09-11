import React from "react";
import { useFormContext } from "react-hook-form";
import { FormBlockHeader } from "../form-block-header/form-block-header.tsx";
import { CheckboxTreeField } from "@/shared/ui";

import { MUSIC_GENRES_COMMUNITY, type TSocialAccountFormValues } from "@/features/influencers/social-account-form";

import s from './music-genres-community.module.scss';

export const MusicGenresCommunity: React.FC = () => {
  const { getFieldState, formState } = useFormContext<TSocialAccountFormValues>();
  const { error: musicGenresCommunity } = getFieldState("communityMusicGenres", formState);

  return (
    <div
      id="communityMusicGenres"
      className={s.musicGenresCommunity}
    >
      <FormBlockHeader
        title="Music genres"
        subtitle="Select all the applicable"
        error={musicGenresCommunity?.message}
      />

      <CheckboxTreeField<TSocialAccountFormValues>
        name="communityMusicGenres"
        options={MUSIC_GENRES_COMMUNITY}
      />
    </div>
  );
};
