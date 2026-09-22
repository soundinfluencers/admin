import React from "react";
import { PriceEditableField } from "@/features/requests/price-editable-field/ui/price-editable-field.tsx";
import type { IPriceUpdateRequestDetailsDto, TRequestType } from "@/entities/requests/model/requests.types.ts";

type TInfluencerPersonalRequestField<T> = {
  label: string;
  key: keyof T;
  render?: (data: T, requestType: TRequestType) => React.ReactNode;
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
  {
    label: "Current Price:",
    key: "currentPrice",
    render: (data: IPriceUpdateRequestDetailsDto, requestType: TRequestType) => (
      <PriceEditableField
        requestId={data.requestId}
        requestType={requestType}
        accountId={data.accountId}
        initialValue={String(data.currentPrice)}
      />
    ),
  },
  { key: "newPrice", label: "Requested New Price:" },
] satisfies TInfluencerPersonalRequestField<IPriceUpdateRequestDetailsDto>[];
