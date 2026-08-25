import type { ReactNode } from "react";
import type { IBundleAccount, INewBundleRequestDetailsDto } from "@/entities/requests/model/requests.types.ts";
import { formatCurrency } from "@/shared/libs/format/format-currency.ts";

type TPersonalInfoFieldKey =
  | "firstName"
  | "lastName"
  | "email"
  | "phoneNumber"
  | "price"
  | "publicPrice"
  | "initialPrice";

type TNewBundleRequestField = {
  key: TPersonalInfoFieldKey;
  label: string;
  renderValue?: (
    data: INewBundleRequestDetailsDto,
  ) => ReactNode;
};

export const PERSONAL_INFO_FIELDS: readonly TNewBundleRequestField[] = [
  {
    key: "firstName",
    label: "First name:",
  },
  {
    key: "lastName",
    label: "Last name:",
  },
  {
    key: "email",
    label: "Email:",
  },
  {
    key: "phoneNumber",
    label: "Phone:",
  },
  {
    key: "price",
    label: "Price:",
    renderValue: (data) => formatCurrency(data.price, data.currency),
  },
  {
    key: "publicPrice",
    label: "Public price:",
    renderValue: (data) => formatCurrency(data.publicPrice, data.currency),
  },
  {
    key: "initialPrice",
    label: "Initial price:",
    renderValue: (data) => formatCurrency(data.initialPrice, data.currency),
  },
];

type TAccountInfoField = {
  key: keyof IBundleAccount;
  label: string;
}

export const ACCOUNT_INFO_FIELDS = [
  { key: "username", label: "Account name:"},
] as const satisfies readonly TAccountInfoField[];
