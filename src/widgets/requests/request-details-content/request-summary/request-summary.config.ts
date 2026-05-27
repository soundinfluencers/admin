import type { TAdminRequestDetails } from "@/entities/requests/model/requests.types.ts";

export type TRequestSummaryField = {
  key: keyof TAdminRequestDetails;
  label: string;
};

export const REQUEST_SUMMARY_FIELDS = [
  { key: "type", label: "Request Type" },
  { key: "firstName", label: "Submitted by" },
  { key: "date", label: "Date" },
  { key: "group", label: "Type" },
] as const satisfies readonly TRequestSummaryField[];


