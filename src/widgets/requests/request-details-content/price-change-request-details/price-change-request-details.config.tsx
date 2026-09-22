import type { IPriceUpdateRequestDetailsDto } from "@/entities/requests/model/requests.types.ts";

type TInfluencerPersonalRequestField<T> = {
  label: string;
  key: keyof T;
};

export const INFLUENCER_PERSONAL_INFO_FIELDS = [
  { key: "firstName", label: "First name:" },
  { key: "lastName", label: "Last name:" },
  { key: "email", label: "Email:" },
  { key: "phoneNumber", label: "Phone:" },
] satisfies TInfluencerPersonalRequestField<IPriceUpdateRequestDetailsDto>[];

export const ACCOUNT_INFO_FIELDS = [
  { key: "username", label: "Account name:" },
  { key: "profileLink", label: "Link:" },
  { label: "Current Price:", key: "currentPrice" },
  { key: "newPrice", label: "Requested New Price:" },
] satisfies TInfluencerPersonalRequestField<IPriceUpdateRequestDetailsDto>[];
