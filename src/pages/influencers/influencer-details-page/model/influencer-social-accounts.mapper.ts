import type { TPlatform } from "@/shared/types/types.ts";
import type { TSocialAccountShort } from "@/entities/influencers/social-account/model/social-account.types.ts";
import type { IInfluencerDetails } from "@/entities/influencers/model/influencers.types.ts";

export const mapInfluencerProfileToAccounts = (
  profile: IInfluencerDetails,
): Record<TPlatform, TSocialAccountShort[]> => {
  return {
    instagram: profile.instagram,
    tiktok: profile.tiktok,
    youtube: profile.youtube,
    facebook: profile.facebook,
    soundcloud: profile.soundcloud,
    spotify: profile.spotify,
    press: profile.press,
  }
};
