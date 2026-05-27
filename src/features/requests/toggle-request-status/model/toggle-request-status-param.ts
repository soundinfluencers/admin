import { parseAsStringLiteral } from "nuqs";
import type { TRequestLifecycleStatus } from "@/entities/requests/model/requests.types.ts";

export const REQUEST_LIFECYCLE_STATUS_VALUES = [
  "OPEN", "CLOSED",
] as const satisfies readonly TRequestLifecycleStatus[];

export const requestLifecycleSearchParamParser =
  parseAsStringLiteral(REQUEST_LIFECYCLE_STATUS_VALUES).withDefault('OPEN');
