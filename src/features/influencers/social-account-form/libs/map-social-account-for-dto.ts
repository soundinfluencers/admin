import { mapSocialAccountForDto } from "./map-social-account-to-dto.mapper.ts";
import type { TPlatform } from "@/shared/types/types.ts";
import type {
  IDeleteSocialAccountRequest,
  TCreateSocialAccountRequest,
  TUpdateSocialAccountDto,
} from "@/entities/influencers/social-account";
import type { TSocialAccountFormValues } from "@/features/influencers/social-account-form";

export const mapSocialAccountForCreateDto = (
  socialMedia: TPlatform,
  influencerId: string,
  account: TSocialAccountFormValues
): TCreateSocialAccountRequest => {

  const payload = mapSocialAccountForDto(account);

  return {
    influencerId,
    socialMedia,
    dto: payload,
  };
};

export const mapSocialAccountForUpdateDto = (
  account: TSocialAccountFormValues,
  socialMedia: TPlatform,
  accountId: string,
  influencerId: string,
): TUpdateSocialAccountDto => {

  const payload = mapSocialAccountForDto(account);

  return {
    accountId,
    influencerId,
    socialMedia,
    ...payload,
  }
};

export const mapSocialAccountForDeleteDto = (
  socialMedia: TPlatform,
  accountId: string,
  influencerId: string,
): IDeleteSocialAccountRequest => {

  return {
    socialMedia,
    accountId,
    influencerId,
  }
}
