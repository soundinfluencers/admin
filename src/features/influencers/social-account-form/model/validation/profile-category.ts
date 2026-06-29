import { z } from "zod";
import type { TProfileCategory } from '@/entities/influencers/social-account/model/social-account.types.ts';

export const PROFILE_CATEGORIES = [
  'community', 'creator'
] as const satisfies readonly TProfileCategory[];

export const profileCategorySchema = z.enum(PROFILE_CATEGORIES);

