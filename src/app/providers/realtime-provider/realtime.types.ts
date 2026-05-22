import type { TSocialMediaValue } from "@/entities/influencers/model/influencers.constants.ts";

export type ActiveAccountAccountsUpdate = {
  socialMedia: TSocialMediaValue;
  accountId: string;
  influencerId?: string;
};

export type RefreshAccountStatusUpdate = {
  socialMedia: TSocialMediaValue;
  accountId: string;
  influencerId?: string;

  statusCode: number;
  error?: string;

  followers?: number;
  logo?: string;
  engagementRate?: number;
  averageViews?: number;
};

export type NotificationFinishedRefreshingAccounts = {
  socialMedia: TSocialMediaValue;
  statusCode: number;
  message?: string;
  date?: string;
};
