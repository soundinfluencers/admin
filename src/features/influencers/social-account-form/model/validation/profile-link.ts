import { z } from 'zod';
import type { TPlatform } from "@/shared/types/types.ts";

const withHttps = (value: string) =>
  /^https?:\/\//i.test(value) ? value : `https://${value}`;

// Allowed domains for profile links, including a generic "press" to cover various media outlets
const PLATFORM_DOMAIN_MAP = {
  instagram: ['instagram.com'],
  tiktok: ['tiktok.com'],
  youtube: ['youtube.com', 'youtu.be'],
  facebook: ['facebook.com', 'fb.com'],
  spotify: ['spotify.com'],
  soundcloud: ['soundcloud.com'],
} satisfies Partial<Record<TPlatform, readonly string[]>>;

const isAllowedHost = (host: string, domains: readonly string[]) => {
  return domains.some((domain) => {
    return host === domain || host.endsWith(`.${domain}`);
  });
};

export const createProfileLinkSchema = (platform: TPlatform) =>
  z
  .string()
  .trim()
  .min(1, 'Account link is required')
  .transform(withHttps)
  .superRefine((val, ctx) => {
    let url: URL;

    try {
      url = new URL(val);
    } catch {
      ctx.addIssue({
        code: 'custom',
        message: 'Please enter a valid account link',
      });
      return;
    }

    if (platform === 'press') {
      return;
    }

    const allowedDomains = PLATFORM_DOMAIN_MAP[platform];

    if (!allowedDomains) {
      ctx.addIssue({
        code: 'custom',
        message: 'Unsupported platform',
      });
      return;
    }

    const host = url.hostname.toLowerCase();

    if (!isAllowedHost(host, allowedDomains)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Please provide a link to the selected platform',
      });
    }
  });
