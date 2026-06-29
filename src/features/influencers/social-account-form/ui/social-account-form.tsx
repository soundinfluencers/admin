import React from "react";
import { Form, PricingField } from "@/shared/ui";
import { useSocialAccountForm } from "../model/use-social-account-form.ts";
import { AccountMainFields } from "./account-main-fields/account-main-fields.tsx";
import { AccountActions } from "./account-actions/account-actions.tsx";
import { AccountTypeSwitcher } from "./account-type-switcher/account-type-switcher.tsx";
import { AudienceInsights } from "./audience-insights/audience-insights.tsx";
import { MusicGenresCommunity } from "./music-genres-community/music-genres-community.tsx";
import { ThemeTopics } from "./theme-topics/theme-topics.tsx";
import { MusicGenresCreator } from "./music-genres-creator/music-genres-creator.tsx";
import { ContentFocus } from "./content-focus/content-focus.tsx";
import { PerformanceFields } from "./performance-fields/performance-fields.tsx";
import { PLATFORM_FORM_CONFIG } from "../model/social-account-form.confing.ts";
import { PRICE_INPUT_LABELS } from "../model/social-account-form.constants.ts";
import type { TPlatform } from "@/shared/types/types.ts";
import type { TSocialAccountFormValues } from "../model/social-account-form.schema.ts";

import s from './social-account-form.module.scss';

interface SocialAccountFormProps {
  mode: "create" | "edit";
  socialMedia: TPlatform;
  defaultValues: TSocialAccountFormValues;
  onHandleSubmit: (values: TSocialAccountFormValues) => Promise<void> | void;
  onHandleDelete?: () => void;
  isPending?: boolean;
  isDeletePending?: boolean;
}

export const SocialAccountForm: React.FC<SocialAccountFormProps> = ({
  mode,
  socialMedia,
  defaultValues,
  onHandleSubmit,
  onHandleDelete,
  isPending = false,
  isDeletePending = false,
}) => {
  const { methods, handleSubmit, profileCategory } = useSocialAccountForm({
    defaultValues,
    onHandleSubmit,
    socialMedia,
  });

  const config = PLATFORM_FORM_CONFIG[socialMedia];

  const showSwitcher = config.hasSwitcher;
  const showMusicGenresCommunity = config.hasMusicGenresCommunity && profileCategory === "community";
  const showThemeTopics = config.hasThemeTopics && profileCategory === "community";
  const showMusicGenresCreators = config.hasMusicGenresCreators && profileCategory === "creator";
  const showContentFocus = config.hasContentFocus && profileCategory === "creator";
  const showAudienceInsights = config.hasAudienceInsights;

  return (
    <Form
      className={s.socialAccountForm}
      methods={methods}
      onSubmit={handleSubmit}
    >
      <AccountMainFields inputs={config.inputs}/>

      {showSwitcher && <AccountTypeSwitcher/>}

      {showMusicGenresCommunity && <MusicGenresCommunity/>}

      {showThemeTopics && <ThemeTopics/>}

      {showMusicGenresCreators && <MusicGenresCreator/>}

      {showContentFocus && <ContentFocus/>}

      {showAudienceInsights && <AudienceInsights/>}

      <PerformanceFields/>

      <PricingField<TSocialAccountFormValues>
        label={PRICE_INPUT_LABELS[socialMedia] ?? ""}
        placeholder={"Enter your price"}
        priceName="price"
        currencyName="currency"
      />

      <AccountActions
        mode={mode}
        isPending={isPending}
        isDeletePending={isDeletePending}
        onHandleDelete={onHandleDelete}
      />
    </Form>
  );
};
