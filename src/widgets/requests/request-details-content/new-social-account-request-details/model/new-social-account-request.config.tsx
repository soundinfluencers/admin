import React from "react";
import type {
  INewInfluencerAccountRequestDetailsDto,
  TInfluencerAccount,
  TRequestType,
} from "@/entities/requests/model/requests.types.ts";
import { PriceEditableField } from "@/features/requests/price-editable-field/ui/price-editable-field.tsx";

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
  { key: "price", label: "Price:" },
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
