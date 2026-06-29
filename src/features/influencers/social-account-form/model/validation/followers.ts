import { z } from 'zod';

export const followersSchema = z
.string()
.trim()
.min(1, "Followers is required")
.regex(/^\d+$/, "Followers must be a number")
.superRefine((val, ctx) => {
  const num = parseInt(val, 10);

  if (num < 1) {
    ctx.addIssue({
      code: "custom",
      message: "Followers must be 1 or more",
    });
  }

  if (num > 1_000_000_000) {
    ctx.addIssue({
      code: "custom",
      message: "Number is too large",
    });
  }
});
