import React from "react";
import { useFormContext } from "react-hook-form";
import { FormBlockHeader } from "../form-block-header/form-block-header.tsx";
import { CheckboxTreeField } from "@/shared/ui";
import { MUSIC_GENRES_CREATOR, type TSocialAccountFormValues } from "@/features/influencers/social-account-form";

import s from './music-genres-creator.module.scss';

export const MusicGenresCreator: React.FC = () => {
  const { getFieldState, formState } = useFormContext<TSocialAccountFormValues>();
  const { error: musicGenresCreator } = getFieldState("creatorMusicGenres", formState);

  return (
    <div id="creatorMusicGenres" className={s.musicGenresCreator}>
      <FormBlockHeader
        title="Music genres"
        subtitle="Select all the applicable"
        error={musicGenresCreator?.message}
      />

      <CheckboxTreeField<TSocialAccountFormValues>
        name="creatorMusicGenres"
        options={MUSIC_GENRES_CREATOR}
        variant="creator"
      />
    </div>
  );
};
