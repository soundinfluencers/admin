import { z } from "zod";

export const CURRENCY = ["USD", "EUR", "GBP"] as const;

export const currencySchema = z.enum(CURRENCY);
