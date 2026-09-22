import type {
  INewInfluencerRequestDetailsDto,
  TInfluencerAccount,
  TRequestType,
} from "@/entities/requests/model/requests.types.ts";
import React from "react";
import { PriceEditableField } from "@/features/requests/price-editable-field/ui/price-editable-field.tsx";

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

type TAccountInfoField<T> = {
  label: string;
  key: keyof T;
  render?: (
    data: T,
    requestType: TRequestType,
    requestId: string,
  ) => React.ReactNode;
}

export const ACCOUNT_INFO_FIELDS = [
  { key: "username", label: "Account name:" },
  { key: "profileLink", label: "Link:" },
  { key: "followers", label: "Followers:" },
  { key: "logoUrl", label: "Logo:" },
  { key: "profileCategory", label: "Account type:" },
  { key: "communityMusicGenres", label: "Music genres:" },
  { key: "communityThemeTopics", label: "Theme topics:" },
  { key: "countries", label: "Audience insights:" },
  { label: "Price:", key: "price" },
  {
    key: "initialPrice",
    label: "Initial Price:",
    render: (
      data: TInfluencerAccount,
      requestType: TRequestType,
      requestId: string,
    ) => (
      <PriceEditableField
        requestId={requestId}
        requestType={requestType}
        accountId={data.accountId}
        accountCurrency={data.currency}
        initialValue={String(data.initialPrice)}
      />
    ),
  },
  { key: "creatorContentFocus", label: "Content focus:" },
  { key: "creatorMusicGenres", label: "Music genres:" },
] satisfies TAccountInfoField<TInfluencerAccount>[];
