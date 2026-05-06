import type { TSocialMedia } from "@/shared/types/types.ts";

export type TPaymentHistorySystemStatus = "in_process" | "done";

export type TPaymentHistoryAdminOverrideStatus = "paid";

export type TPaymentHistoryEffectiveStatus =
  | TPaymentHistorySystemStatus
  | TPaymentHistoryAdminOverrideStatus;

export interface IPaymentHistoryCampaign {
  campaignId: string;
  campaignName: string;
  campaignCreatedAt: string;
  campaignStatus: string;
}

export interface IPaymentHistoryAccount {
  accountId: string;
  influencerId: string;
  username: string;
  logoUrl?: string;
}

export interface IPaymentHistoryCell {
  campaignId: string;
  accountId: string;
  effectiveStatus: TPaymentHistoryEffectiveStatus;
  systemStatus: TPaymentHistorySystemStatus;
  adminOverrideStatus?: TPaymentHistoryAdminOverrideStatus;
  label?: string;
}

export interface IPaymentHistoryMeta {
  campaignsNextCursor?: string | null;
  accountsNextCursor?: string | null;
  campaignsCount?: number;
  accountsCount?: number;
}

export interface IPaymentHistoryMatrix {
  campaigns: IPaymentHistoryCampaign[];
  accounts: IPaymentHistoryAccount[];
  cells: IPaymentHistoryCell[];
  meta: IPaymentHistoryMeta;
}

export type TGetPaymentHistoryParams = {
  campaignsCursor?: string;
  campaignsTake?: number;
  accountsCursor?: string;
  accountsTake?: number;
  search?: string;
  socialMedia?: TSocialMedia;
  effectiveStatus?: TPaymentHistoryEffectiveStatus;
}

export interface IPaymentHistoryResponse {
  statusCode: number;
  message: string;
  data: IPaymentHistoryMatrix;
}


export const paymentHistoryMock: IPaymentHistoryMatrix = {
  campaigns: [
    { campaignId: "cmp_1", campaignName: "Spring Promo", campaignCreatedAt: "2025-01-12T10:00:00Z", campaignStatus: "completed" },
    { campaignId: "cmp_2", campaignName: "TikTok Boost", campaignCreatedAt: "2025-02-05T10:00:00Z", campaignStatus: "active" },
    { campaignId: "cmp_3", campaignName: "YouTube Launch", campaignCreatedAt: "2025-02-20T10:00:00Z", campaignStatus: "completed" },
    { campaignId: "cmp_4", campaignName: "Spotify Push", campaignCreatedAt: "2025-03-01T10:00:00Z", campaignStatus: "active" },
    { campaignId: "cmp_5", campaignName: "Indie Artists", campaignCreatedAt: "2025-03-10T10:00:00Z", campaignStatus: "completed" },
    { campaignId: "cmp_6", campaignName: "Festival Hype", campaignCreatedAt: "2025-03-22T10:00:00Z", campaignStatus: "active" },
    { campaignId: "cmp_7", campaignName: "Summer Tracks", campaignCreatedAt: "2025-04-02T10:00:00Z", campaignStatus: "completed" },
    { campaignId: "cmp_8", campaignName: "Reels Campaign", campaignCreatedAt: "2025-04-10T10:00:00Z", campaignStatus: "active" },
    { campaignId: "cmp_9", campaignName: "Dance Hits", campaignCreatedAt: "2025-04-18T10:00:00Z", campaignStatus: "completed" },
    { campaignId: "cmp_10", campaignName: "SoundCloud Rising", campaignCreatedAt: "2025-04-25T10:00:00Z", campaignStatus: "active" },
    { campaignId: "cmp_11", campaignName: "Club Tracks", campaignCreatedAt: "2025-05-02T10:00:00Z", campaignStatus: "completed" },
    { campaignId: "cmp_12", campaignName: "Global Reach", campaignCreatedAt: "2025-05-10T10:00:00Z", campaignStatus: "active" },
    { campaignId: "cmp_13", campaignName: "Viral Sounds", campaignCreatedAt: "2025-05-18T10:00:00Z", campaignStatus: "completed" },
    { campaignId: "cmp_14", campaignName: "Music Trends", campaignCreatedAt: "2025-05-25T10:00:00Z", campaignStatus: "active" },
    { campaignId: "cmp_15", campaignName: "Hip-Hop Promo", campaignCreatedAt: "2025-06-01T10:00:00Z", campaignStatus: "completed" },
    { campaignId: "cmp_16", campaignName: "EDM Blast", campaignCreatedAt: "2025-06-08T10:00:00Z", campaignStatus: "active" },
    { campaignId: "cmp_17", campaignName: "Pop Launch", campaignCreatedAt: "2025-06-15T10:00:00Z", campaignStatus: "completed" },
    { campaignId: "cmp_18", campaignName: "Chill Vibes", campaignCreatedAt: "2025-06-22T10:00:00Z", campaignStatus: "active" },
    { campaignId: "cmp_19", campaignName: "Indie Boost", campaignCreatedAt: "2025-06-28T10:00:00Z", campaignStatus: "completed" },
    { campaignId: "cmp_20", campaignName: "Mega Campaign", campaignCreatedAt: "2025-07-05T10:00:00Z", campaignStatus: "active" },
  ],

  accounts: [
    { accountId: "acc_1", influencerId: "inf_1", username: "alex_music", logoUrl: "https://i.pravatar.cc/100?img=1" },
    { accountId: "acc_2", influencerId: "inf_2", username: "beatmaker" },
    { accountId: "acc_3", influencerId: "inf_3", username: "dj_vibes", logoUrl: "https://i.pravatar.cc/100?img=3" },
    { accountId: "acc_4", influencerId: "inf_4", username: "soundking" },
    { accountId: "acc_5", influencerId: "inf_5", username: "wave_creator" },
    { accountId: "acc_6", influencerId: "inf_6", username: "musicflow", logoUrl: "https://i.pravatar.cc/100?img=6" },
    { accountId: "acc_7", influencerId: "inf_7", username: "club_dj" },
    { accountId: "acc_8", influencerId: "inf_8", username: "lofi_artist" },
    { accountId: "acc_9", influencerId: "inf_9", username: "beats_daily" },
    { accountId: "acc_10", influencerId: "inf_10", username: "viral_sounds" },
    { accountId: "acc_11", influencerId: "inf_11", username: "hiphop_zone" },
    { accountId: "acc_12", influencerId: "inf_12", username: "pop_hits" },
    { accountId: "acc_13", influencerId: "inf_13", username: "edm_master" },
    { accountId: "acc_14", influencerId: "inf_14", username: "chill_tracks" },
    { accountId: "acc_15", influencerId: "inf_15", username: "indie_wave" },
    { accountId: "acc_16", influencerId: "inf_16", username: "spotify_daily" },
    { accountId: "acc_17", influencerId: "inf_17", username: "trend_hunter" },
    { accountId: "acc_18", influencerId: "inf_18", username: "music_lab" },
    { accountId: "acc_19", influencerId: "inf_19", username: "global_dj" },
    { accountId: "acc_20", influencerId: "inf_20", username: "top_charts" },
  ],

  cells: [
    { campaignId: "cmp_1", accountId: "acc_1", systemStatus: "done", effectiveStatus: "done", label: "TT" },
    { campaignId: "cmp_1", accountId: "acc_3", systemStatus: "in_process", effectiveStatus: "in_process", label: "IG+TT" },
    { campaignId: "cmp_1", accountId: "acc_10", systemStatus: "in_process", effectiveStatus: "in_process", label: "IG+TT" },
    { campaignId: "cmp_1", accountId: "acc_20", systemStatus: "in_process", effectiveStatus: "in_process", label: "IG+TT" },

    { campaignId: "cmp_2", accountId: "acc_2", systemStatus: "in_process", effectiveStatus: "in_process" },
    { campaignId: "cmp_2", accountId: "acc_4", systemStatus: "done", effectiveStatus: "done", label: "IG+TT" },
    { campaignId: "cmp_2", accountId: "acc_5", systemStatus: "in_process", effectiveStatus: "in_process" },
    { campaignId: "cmp_2", accountId: "acc_6", systemStatus: "in_process", effectiveStatus: "in_process" },
    { campaignId: "cmp_2", accountId: "acc_7", systemStatus: "in_process", effectiveStatus: "in_process", label: "TT" },

    { campaignId: "cmp_3", accountId: "acc_1", systemStatus: "in_process", effectiveStatus: "in_process", label: "TT" },
    { campaignId: "cmp_3", accountId: "acc_5", systemStatus: "in_process", effectiveStatus: "in_process", label: "TT" },
    { campaignId: "cmp_3", accountId: "acc_6", systemStatus: "in_process", effectiveStatus: "in_process", label: "TT" },
    { campaignId: "cmp_3", accountId: "acc_7", systemStatus: "in_process", effectiveStatus: "in_process", label: "TT" },

    { campaignId: "cmp_4", accountId: "acc_1", systemStatus: "in_process", effectiveStatus: "in_process", label: "TT" },
    { campaignId: "cmp_4", accountId: "acc_5", systemStatus: "in_process", effectiveStatus: "in_process", label: "TT" },
    { campaignId: "cmp_4", accountId: "acc_6", systemStatus: "in_process", effectiveStatus: "in_process", label: "TT" },

    { campaignId: "cmp_5", accountId: "acc_1", systemStatus: "in_process", effectiveStatus: "in_process" },
    { campaignId: "cmp_5", accountId: "acc_5", systemStatus: "done", adminOverrideStatus: "paid", effectiveStatus: "paid" },
    { campaignId: "cmp_5", accountId: "acc_6", systemStatus: "done", adminOverrideStatus: "paid", effectiveStatus: "paid" },
    { campaignId: "cmp_5", accountId: "acc_8", systemStatus: "in_process", effectiveStatus: "in_process" },
    { campaignId: "cmp_5", accountId: "acc_9", systemStatus: "in_process", effectiveStatus: "in_process" },

    { campaignId: "cmp_6", accountId: "acc_8", systemStatus: "in_process", effectiveStatus: "in_process", label: "TT" },

    { campaignId: "cmp_7", accountId: "acc_8", systemStatus: "in_process", effectiveStatus: "in_process", label: "TT" },

    { campaignId: "cmp_8", accountId: "acc_2", systemStatus: "done", effectiveStatus: "done", label: "IG+TT" },
    { campaignId: "cmp_8", accountId: "acc_3", systemStatus: "in_process", effectiveStatus: "in_process" },
    { campaignId: "cmp_8", accountId: "acc_8", systemStatus: "in_process", effectiveStatus: "in_process" },
    { campaignId: "cmp_8", accountId: "acc_20", systemStatus: "done", effectiveStatus: "done", label: "IG+TT" },

    { campaignId: "cmp_9", accountId: "acc_2", systemStatus: "in_process", effectiveStatus: "in_process" },
    { campaignId: "cmp_9", accountId: "acc_10", systemStatus: "done", adminOverrideStatus: "paid", effectiveStatus: "paid" },
    { campaignId: "cmp_9", accountId: "acc_20", systemStatus: "in_process", effectiveStatus: "in_process" },

    { campaignId: "cmp_10", accountId: "acc_4", systemStatus: "in_process", effectiveStatus: "in_process", label: "IG+TT" },
    { campaignId: "cmp_10", accountId: "acc_11", systemStatus: "in_process", effectiveStatus: "in_process", label: "TT" },
    { campaignId: "cmp_10", accountId: "acc_12", systemStatus: "in_process", effectiveStatus: "in_process", label: "TT" },

    { campaignId: "cmp_11", accountId: "acc_5", systemStatus: "in_process", effectiveStatus: "in_process", label: "TT" },
    { campaignId: "cmp_11", accountId: "acc_6", systemStatus: "in_process", effectiveStatus: "in_process", label: "TT" },
    { campaignId: "cmp_11", accountId: "acc_7", systemStatus: "in_process", effectiveStatus: "in_process", label: "TT" },

    { campaignId: "cmp_12", accountId: "acc_13", systemStatus: "done", adminOverrideStatus: "paid", effectiveStatus: "paid" },
    { campaignId: "cmp_12", accountId: "acc_14", systemStatus: "in_process", effectiveStatus: "in_process" },
    { campaignId: "cmp_12", accountId: "acc_15", systemStatus: "in_process", effectiveStatus: "in_process" },

    { campaignId: "cmp_13", accountId: "acc_13", systemStatus: "in_process", effectiveStatus: "in_process", label: "TT" },
    { campaignId: "cmp_13", accountId: "acc_16", systemStatus: "done", effectiveStatus: "done", label: "IG+TT" },

    { campaignId: "cmp_14", accountId: "acc_14", systemStatus: "in_process", effectiveStatus: "in_process", label: "TT" },

    { campaignId: "cmp_15", accountId: "acc_15", systemStatus: "in_process", effectiveStatus: "in_process" },
    { campaignId: "cmp_15", accountId: "acc_16", systemStatus: "done", adminOverrideStatus: "paid", effectiveStatus: "paid" },

    { campaignId: "cmp_16", accountId: "acc_17", systemStatus: "in_process", effectiveStatus: "in_process", label: "IG+TT" },

    { campaignId: "cmp_17", accountId: "acc_17", systemStatus: "done", effectiveStatus: "done", label: "TT" },
    { campaignId: "cmp_17", accountId: "acc_18", systemStatus: "in_process", effectiveStatus: "in_process" },

    { campaignId: "cmp_18", accountId: "acc_18", systemStatus: "done", effectiveStatus: "done", label: "TT" },
    { campaignId: "cmp_18", accountId: "acc_19", systemStatus: "in_process", effectiveStatus: "in_process" },

    { campaignId: "cmp_19", accountId: "acc_19", systemStatus: "in_process", effectiveStatus: "in_process", label: "IG+TT" },

    { campaignId: "cmp_20", accountId: "acc_5", systemStatus: "done", adminOverrideStatus: "paid", effectiveStatus: "paid", label: "IG+TT" },
  ],

  meta: {
    campaignsNextCursor: null,
    accountsNextCursor: null,
    campaignsCount: 20,
    accountsCount: 20,
  },
};
