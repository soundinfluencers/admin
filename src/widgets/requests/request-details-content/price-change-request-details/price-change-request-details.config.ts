import type { IPriceUpdateRequestDetailsDto } from "@/entities/requests/model/requests.types.ts";

type TInfluencerPersonalRequestField = {
  key: keyof IPriceUpdateRequestDetailsDto;
  label: string;
};

export const INFLUENCER_PERSONAL_INFO_FIELDS = [
  { key: "firstName", label: "First name:" },
  { key: "lastName", label: "Last name:" },
  { key: "email", label: "Email:" },
  { key: "phoneNumber", label: "Phone:" },
] as const satisfies readonly TInfluencerPersonalRequestField[];

export const ACCOUNT_INFO_FIELDS = [
  { key: "username", label: "Account name:" },
  { key: "profileLink", label: "Link:" },
  { key: "currentPrice", label: "Current Price:" },
  { key: "newPrice", label: "Requested New Price:" },
] as const satisfies readonly TInfluencerPersonalRequestField[];
