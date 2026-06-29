export type TSocialMedia =
  | "instagram"
  | "tiktok"
  | "youtube"
  | "facebook"
  | "spotify"
  | "soundcloud"
  | "press"
  | "multipromo";

export type TPlatform = Exclude<TSocialMedia, "multipromo">;

export type TCurrency = 'EUR' | 'GBP' | 'USD';
export type TPaymentMethod = "paypal" | "ukBankTransfer" | "internationalBankTransfer";
