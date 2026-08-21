import type { TSocialMedia } from "@/shared/types/types.ts";
import type { TSocialMediaValue } from "@/entities/influencers/model/influencers.constants.ts";

import instagramIcon from "@/assets/icons/campaigns/social-media/instagram.svg";
import tiktokIcon from "@/assets/icons/campaigns/social-media/tiktok.svg";
import youtubeIcon from "@/assets/icons/campaigns/social-media/youtube.svg";
import facebookIcon from "@/assets/icons/campaigns/social-media/facebook.svg";
import spotifyIcon from "@/assets/icons/campaigns/social-media/spotify.svg";
import soundcloudIcon from "@/assets/icons/campaigns/social-media/soundcloud.svg";
import pressIcon from "@/assets/icons/campaigns/social-media/press.svg";
import multipromoIcon from "@/assets/icons/campaigns/social-media/multipromo.svg";

import instagramIconPost from "@/assets/icons/campaigns/social-media/Instagram1.svg";
import tiktokIconPost from "@/assets/icons/campaigns/social-media/tiktok1.svg";
import facebookIconPost from "@/assets/icons/campaigns/social-media/facebook.1.svg";
import youtubeIconPost from "@/assets/icons/campaigns/social-media/youtube1.svg";
import spotifyIconPost from "@/assets/icons/campaigns/social-media/spotify.1.svg";
import soundcloudIconPost from "@/assets/icons/campaigns/social-media/sound cloud1.svg";
import pressPost from "@/assets/icons/campaigns/social-media/press1.svg";


export const getSocialMediaIcon = (socialMedia: TSocialMedia | TSocialMediaValue | null) => {
  switch (socialMedia) {
    case "instagram":
      return instagramIcon;
    case "tiktok":
      return tiktokIcon;
    case "youtube":
      return youtubeIcon;
    case "facebook":
      return facebookIcon;
    case "spotify":
      return spotifyIcon;
    case "soundcloud":
      return soundcloudIcon;
    case "press":
      return pressIcon;
    case "multipromo":
      return multipromoIcon;

    default:
      return '';
  }
};


export const getSocialMediaIconPostContent = (socialMedia: TSocialMedia) => {
  switch (socialMedia) {
    case "instagram":
      return instagramIconPost;
    case "tiktok":
      return tiktokIconPost;
    case "facebook":
      return facebookIconPost;
    case "youtube":
      return youtubeIconPost;
    case "spotify":
      return spotifyIconPost;
    case "soundcloud":
      return soundcloudIconPost;
    case "press":
      return pressPost;
    case "multipromo":
      return multipromoIcon;
    default:
      return null;
  }
};
