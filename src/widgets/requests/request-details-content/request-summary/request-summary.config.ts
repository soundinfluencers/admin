import type { IRequest } from "@/entities/requests";

export type TRequestSummaryField = {
  key: keyof IRequest;
  label: string;
};

export const REQUEST_SUMMARY_FIELDS = [
  { key: "type", label: "Request Type" },
  { key: "submittedBy", label: "Submitted by" },
  { key: "date", label: "Date" },
  { key: "group", label: "Type" },
] as const satisfies readonly TRequestSummaryField[];


