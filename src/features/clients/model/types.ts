import type { IClientDetails } from "@/entities/client/model/client.types.ts";

export type TClientDetailsEditableFields = Pick<
  IClientDetails,
  'firstName' | 'lastName' | 'email' | 'phone' | 'companyType' | 'isProposalClient' | 'internalNote' | 'company' | 'balance'
>;

export type TClientDetailsEditableKey = keyof TClientDetailsEditableFields;
