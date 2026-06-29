import React from "react";
import clsx from "clsx";
import { useFormContext } from "react-hook-form";

import { ACCOUNT_TYPE_OPTIONS, type TSocialAccountFormValues } from "@/features/influencers/social-account-form";
import type { TProfileCategory } from "@/entities/influencers/social-account/model/social-account.types.ts";

import s from './account-type-switcher.module.scss';

export const AccountTypeSwitcher: React.FC = () => {
  const { setValue, watch, clearErrors } = useFormContext<TSocialAccountFormValues>();

  const value = watch('profileCategory');

  const handleChangeProfileCategory = (
    nextValue: TProfileCategory,
  ) => {
    setValue('profileCategory', nextValue, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });

    if (nextValue === 'community') {
      clearErrors([
        'creatorMusicGenres',
        'creatorContentFocus',
      ]);
    }

    if (nextValue === 'creator') {
      clearErrors([
        'communityMusicGenres',
        'communityThemeTopics',
      ]);
    }
  };

  return (
    <div className={s.accountTypeSwitcher}>
      <h2 className={s.title}>Choose your account type</h2>

      <div className={s.options}>
        {ACCOUNT_TYPE_OPTIONS.map((option) => (
          <div className={s.option} key={option.value}>
            <button
              className={clsx(
                s.button,
                option.value === value && s.active,
              )}
              type="button"
              onClick={() =>
                handleChangeProfileCategory(option.value)
              }
              disabled={value === option.value}
            >
              <span>{option.label}</span>
            </button>

            <span className={s.description}>{option.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
