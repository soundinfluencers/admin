import type { INewClientRequestDetailsDto } from "@/entities/requests/model/requests.types.ts";

export type TNewClientRequestField = {
  key: keyof INewClientRequestDetailsDto;
  label: string;
};

export const NEW_CLIENT_REQUEST_FIELDS = [
  { key: "firstName", label: "First name:" },
  { key: "lastName", label: "Last name:" },
  { key: "companyName", label: "Company:" },
  { key: "companyType", label: "Company type:" },
  { key: "instagramUsername", label: "Instagram:" },
  { key: "email", label: "Email:" },
  { key: "phone", label: "Phone:" },
  { key: "referralCode", label: "Referral code:" },
] as const satisfies readonly TNewClientRequestField[];
