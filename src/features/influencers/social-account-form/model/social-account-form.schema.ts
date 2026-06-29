import { z } from "zod";
import type { TPlatform } from "@/shared/types/types.ts";
import { PLATFORM_FORM_CONFIG } from "../model/social-account-form.confing.ts";
import { userNameSchema } from "../model/validation/user-name.ts";
import { createProfileLinkSchema } from "../model/validation/profile-link.ts";
import { followersSchema } from "../model/validation/followers.ts";
import { profileCategorySchema } from "../model/validation/profile-category.ts";
import { audienceInsightsSchema } from "../model/validation/audience-insights.ts";
import { currencySchema } from "../model/validation/currency.ts";
import { priceSchema } from "../model/validation/price.ts";
import { logoUrlSchema } from "../model/validation/logo-url.ts";
import { performanceSchema } from "./validation/performance.ts";

const optionalFormField = <T extends z.ZodTypeAny>(schema: T) =>
  z.union([schema, z.literal('')]).optional();

export const createSocialAccountFormSchema = (platform: TPlatform) => {
  const config = PLATFORM_FORM_CONFIG[platform];

  return z.object({
    username: userNameSchema,
    profileLink: createProfileLinkSchema(platform),
    followers: platform === 'press'
      ? z.string()
      : followersSchema,
    logoUrl: logoUrlSchema,

    profileCategory: profileCategorySchema,

    // community
    communityMusicGenres: z.array(z.string().trim()),
    communityThemeTopics: z.array(z.string().trim()),

    // creator
    creatorMusicGenres: z.array(z.string().trim()),
    creatorContentFocus: z.array(z.string().trim()),

    countries: audienceInsightsSchema,

    engagementRate: optionalFormField(performanceSchema),
    averageViews: optionalFormField(performanceSchema),
    currency: currencySchema,
    price: priceSchema,
  })
  .superRefine((data, ctx) => {
    const isCommunity =
      data.profileCategory === 'community';

    const isCreator =
      data.profileCategory === 'creator';

    // community validation
    if (
      isCommunity &&
      config.hasMusicGenresCommunity &&
      data.communityMusicGenres.length === 0
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['communityMusicGenres'],
        message: 'Select at least 1 music genre',
      });
    }

    // creator validation
    if (
      isCreator &&
      config.hasMusicGenresCreators &&
      data.creatorMusicGenres.length === 0
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['creatorMusicGenres'],
        message: 'Select at least 1 music genre',
      });
    }

    if (
      isCreator &&
      config.hasContentFocus &&
      data.creatorContentFocus.length === 0
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['creatorContentFocus'],
        message: 'Select at least 1 content focus',
      });
    }
  });
}

export type TSocialAccountFormValues = z.infer<ReturnType<typeof createSocialAccountFormSchema>>;
