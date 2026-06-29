import { z } from "zod";

export const priceSchema = z
.string()
.trim()
.min(1, "Price is required")
.regex(/^\d+$/, "Price must be a number")
.superRefine((val, ctx) => {
  const num = parseInt(val, 10);

  if (num < 1) {
    ctx.addIssue({
      code: "custom",
      message: "Price must be 1 or more",
    });
  }

  if (num > 1_000_000) { // Optional limit to prevent excessively high prices
    ctx.addIssue({
      code: "custom",
      message: "Price is too high",
    });
  }
});
