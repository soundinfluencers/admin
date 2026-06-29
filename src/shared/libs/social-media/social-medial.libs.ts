import type { TPlatform } from "@/shared/types/types.ts";
import { SOCIAL_MEDIA_LABEL_MAP, SOCIAL_MEDIA_VALUES } from "@/shared/constants/social-media.constants.ts";

export const isSocialMedia = (value: string): value is TPlatform => {
  return SOCIAL_MEDIA_VALUES.includes(value as TPlatform);
};

export const getSocialMediaFromParam = (
  platform: string | undefined,
): TPlatform | undefined => {
  if (!platform) return undefined;

  return isSocialMedia(platform) ? platform : undefined;
};

export const getSocialMediaLabel = (
  platform: TPlatform,
): string => {
  return SOCIAL_MEDIA_LABEL_MAP[platform];
};
