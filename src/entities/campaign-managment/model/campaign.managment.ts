import type {ClosePromo, ConfirmationStatus, DateRequest} from "@/entities/campaign-managment/model/enums.types.ts";

type Id = string
export type TableGroup = 'main' | 'music' | 'press';
export type SocialMedia = "instagram" | "tiktok" | "youtube" | "facebook" | "spotify" | "soundcloud" | "press";
export type CampaignStatus = "proposal" | "pending" | "distributing" | "completed";
export type SocialMediaGroup = 'main' | 'music' | "press"
// export type Country = {
//
// }
export interface CampaignContentItem {
    profileType: "creator" | "community" | undefined;
    _id: Id;
    socialMedia: SocialMedia;
    socialMediaGroup: SocialMediaGroup;
    mainLink: string;
    descriptions: any[];
    taggedUser: string;
    taggedLink: string;
    additionalBrief: Array<{
        _id: Id;
        additionalBrief: string;
    }>;
    mediaCache: any;
}

export interface SelectedContentRef {
    campaignContentItemId: Id;
    descriptionId: Id;
    additionalBriefId?: Id;
}

export interface SelectedContentItemFlat {
    _id: Id;
    socialMedia: SocialMedia;
    socialMediaGroup: SocialMediaGroup;
    mainLink: string;
    description: string;
    taggedUser: string;
    taggedLink: string;
    additionalBrief: string;
}


export interface AddedAccount {
    addedAccountsId: Id;
    socialAccountId: Id;
    influencerId: Id;
    socialMedia: SocialMedia;
    username: string;

    publicPrice: number;
    followers: number;

    selectedContent: SelectedContentRef;
    selectedContentItem: SelectedContentItemFlat;

    confirmation: any;
    closePromo: any;

    dateRequest: any;
    datePost: any;

    postLink: string;
    screenshot: string;

    impressions: number;
    like: number;
    comments: number;
    shares: number;
    saves: number;
    rating: number;

    genres: string[];
    countries: any[];

    logoUrl: string;
    cpm: number;
}
export interface CampaignAddedAccount {
    _id: Id;

    influencerId: Id;
    socialAccountId: Id;
    addedAccountsId: Id;
    socialMedia: SocialMedia;

    username: string;

    price: number;
    publicPrice: number;

    followers: number;

    confirmation: ConfirmationStatus;
    closePromo: ClosePromo;

    selectedContent: SelectedContentRef;

    dateRequest: DateRequest;

    postLink: string;
    screenshot: string;

    impressions: number | null;
    like: number | null;
    comments: number | null;
    shares: number | null;
    saves: number | null;

    rating: number | null;
    adminChecked: boolean;

    createdAt: string;
    updatedAt: string;

}
export interface SelectedContentRef {
    campaignContentItemId: Id;
    descriptionId: Id;
    additionalBriefId?: Id;
}
export interface Campaign {
    campaignId: Id;
    campaignName: string;
    addedAccounts: AddedAccount[];
    campaignContent:CampaignContentItem[]
    socialMedia: SocialMedia;
    creationDate: string;
    price: number;
    status: CampaignStatus;
    shareLink: string;
    totalFollowers: number;
    totalImpressions: number;
    totalLikes: number;
    totalSaves: number;
    totalComments: number;
    totalShares: number;
    isCpmAndResultHidden: boolean;
    isPriceHidden: boolean;
    cpm: number;
    canEdit: boolean

}

 interface ApiResponce<T> {
    data: T;
}


export type ApiCampaignData = ApiResponce<Campaign>
