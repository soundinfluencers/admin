import { parseAsStringLiteral } from "nuqs";
import type { TRequestFilterStatus } from "@/entities/requests/model/requests.types.ts";

export const REQUEST_STATUS_VALUES = [
  "CLIENT", "INFLUENCER", "CAMPAIGN", "PRICING",
] as const satisfies readonly TRequestFilterStatus[];

export const requestStatusSearchParamParser = parseAsStringLiteral(REQUEST_STATUS_VALUES);
