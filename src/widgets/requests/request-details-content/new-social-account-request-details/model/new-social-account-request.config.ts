import type { INewInfluencerAccountRequestDetailsDto, TInfluencerAccount } from "@/entities/requests/model/requests.types.ts";

type TNewAccountRequestField = {
  key: keyof INewInfluencerAccountRequestDetailsDto;
  label: string;
};

export const PERSONAL_INFO_FIELDS = [
  { key: "firstName", label: "First name:" },
  { key: "lastName", label: "Last name:" },
  { key: "email", label: "Email:" },
  { key: "phoneNumber", label: "Phone:" },
] as const satisfies readonly TNewAccountRequestField[];

type TAccountInfoField = {
  key: keyof TInfluencerAccount;
  label: string;
}

export const ACCOUNT_INFO_FIELDS = [
  { key: "username", label: "Account name:"},
  { key: "profileLink", label: "Link:"},
  { key: "followers", label: "Followers:"},
  { key: "logoUrl", label: "Logo:"},
  { key: "profileCategory", label: "Account type:"},
  { key: "communityMusicGenres", label: "Music genres:"},
  { key: "communityThemeTopics", label: "Theme topics:"},
  { key: "countries", label: "Audience insights:"},
  { key: "price", label: "Price:"},
  { key: "initialPrice", label: "Initial Price:"},
  { key: "creatorContentFocus", label: "Content focus:"},
  { key: "creatorMusicGenres", label: "Music genres:"},
] as const satisfies readonly TAccountInfoField[];
