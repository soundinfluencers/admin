import { z } from "zod";

const normalizeUrl = (value: string) => {
  const hasProtocol = /^[a-z][a-z\d+.-]*:/i.test(value);

  return hasProtocol ? value : `https://${value}`;
};

export const postLinkSchema = z.object({
  postLink: z
  .string()
  .trim()
  .pipe(
    z.union(
      [
        z.literal(""),
        z
        .string()
        .transform(normalizeUrl)
        .pipe(
          z.url({
            protocol: /^https?$/,
            hostname: z.regexes.domain,
            error: "Enter a valid URL.",
          }),
        ),
      ],
      {
        error: "Enter a valid URL.",
      },
    ),
  ),
});

export type TPostLinkFormValues = z.infer<typeof postLinkSchema>;
