import type { FC, SVGProps } from "react";
import type { TOfferSocialMedia } from "./enums.ts";

export type TOfferSocialMediaOption = {
  value: TOfferSocialMedia;
  label: string;
  icon: FC<SVGProps<SVGSVGElement>>;
};
