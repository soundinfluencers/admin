import { z } from "zod";

const withHttps = (value: string) =>
  /^https?:\/\//i.test(value) ? value : `https://${value}`;

export const logoUrlSchema = z
  .string()
  .trim()
  .min(1, 'Logo is required')
  .transform(withHttps)
  .superRefine((val, ctx) => {
    let url: URL;

    try {
      url = new URL(val);
    } catch {
      ctx.addIssue({
        code: 'custom',
        message: 'Please enter a valid logo URL',
      });
      return;
    }

    const host = url.hostname.toLowerCase();
    const parts = host.split('.');
    const tld = parts.at(-1) ?? '';

    if (parts.length < 2 || tld.length < 2) {
      ctx.addIssue({
        code: 'custom',
        message: 'Please enter a valid logo URL',
      });
    }
  });
