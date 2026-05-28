import type { INewInfluencerRequestDetailsDto, TInfluencerAccount } from "@/entities/requests/model/requests.types.ts";

type TNewInfluencerPersonalRequestField = {
  key: keyof INewInfluencerRequestDetailsDto;
  label: string;
};

export const PERSONAL_INFO_FIELDS = [
  { key: "firstName", label: "First name:" },
  { key: "lastName", label: "Last name:" },
  { key: "email", label: "Email:" },
  { key: "phoneNumber", label: "Phone:" },
] as const satisfies readonly TNewInfluencerPersonalRequestField[];

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
  { key: "musicGenres", label: "Music genres:"},
  { key: "categories", label: "Theme topics:"},
  { key: "countries", label: "Audience insights:"},
  { key: "price", label: "Price:"},
  { key: "initialPrice", label: "Initial Price:"},
  { key: "creatorCategories", label: "Creator categories:"},
] as const satisfies readonly TAccountInfoField[];
