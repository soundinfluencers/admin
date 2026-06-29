import type { TProfileCategory } from "@/entities/influencers/social-account/model/social-account.types.ts";

type TInputType = "text" | "number" | "file";

type TSocialAccountMainFieldName =
  | "username"
  | "profileLink"
  | "followers"
  | "logoUrl";

export interface ISocialAccountMainInputConfig {
  type: TInputType;
  label: string;
  name: TSocialAccountMainFieldName;
  placeholder: string;
}

export interface ISocialMediaFormConfig {
  hasSwitcher: boolean;
  hasMusicGenresCommunity: boolean;
  hasThemeTopics: boolean;
  hasMusicGenresCreators: boolean;
  hasContentFocus: boolean;
  hasAudienceInsights: boolean;
  inputs: ISocialAccountMainInputConfig[];
}

export type TAccountTypeOption = {
  value: TProfileCategory;
  label: string;
  description: string;
}
