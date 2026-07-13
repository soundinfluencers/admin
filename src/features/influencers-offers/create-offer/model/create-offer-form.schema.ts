import { z } from "zod";

export const createOfferFormSchema = z.object({
  offerName: z
    .string()
    .trim()
    .min(1, { error: "Offer name is required" }),
});

export type TCreateOfferFormValues = z.infer<typeof createOfferFormSchema>;
