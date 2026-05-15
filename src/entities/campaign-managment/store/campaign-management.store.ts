//@ts-nocheck

import { create } from "zustand";
import type { ViewMode } from "@/entities/campaign-managment/model/campaign-management-table.types.ts";
import { getGroupBySocial } from "@/entities/campaign-managment/model/campaign-management.helpers.ts";

type SelectedCampaignContentItem = {
    campaignContentItemId: string;
    descriptionId: string;
};

export enum AdminPromoStatusLabelEnum {
    requested = "Requested",
    accepted = "Accepted",
    declined = "Declined",
    posted = "Posted",
    insightsSubmitted = "Insights Submitted",
    na = "N/A",
}
export type EditableAccount = {
    addedAccountsId?: string;
    socialAccountId: string;
    influencerId: string;
    socialMedia: string;
    username: string;
    followers?: number;
    genres?: string[];
    publicPrice?: number;
    logoUrl?: string;
    firstName?: string;
    countries?: Array<{
        country: string;
        percentage: number;
        _id?: string;
    }>;
    statusLabel?: keyof typeof AdminPromoStatusLabelEnum | string;
    selectedCampaignContentItem: SelectedCampaignContentItem | null;
    dateRequest: string;

    postLink?: string;
    screenshot?: string;
    impressions?: number;
    like?: number;
    comments?: number;
    shares?: number;
    saves?: number;
    rating?: number;
    cpm?: number;
    confirmation?: string;
    closePromo?: string;
    datePost?: string;
};

export type EditableDescription = {
    _id: string;
    description: string;
};

export type EditableCampaignContentItem = {
    _id: string;
    socialMedia: string;
    socialMediaGroup: string;
    mainLink: string;
    mediaCache?: {
        provider?: string;
        kind?: string;
        items?: any[];
        cachedAt?: string;
    };
    descriptions: EditableDescription[];
    taggedUser: string;
    taggedLink: string;
    additionalBrief: string;
};

export type EditableCampaign = {
    campaignId: string;
    campaignName: string;
    socialMedia: string;
    creationDate?: string;
    price?: number;
    isBudgetManual: boolean;
    displayCurrency: string;
    status: string;
    internalCost?: number;
    addedAccounts: EditableAccount[];
    campaignContent: EditableCampaignContentItem[];

    shareLink?: string;
    totalFollowers?: number;
    totalImpressions?: number;
    totalLikes?: number;
    totalSaves?: number;
    totalComments?: number;
    totalShares?: number;

    isCpmAndResultHidden: boolean;
    isPriceHidden: boolean;
    canEdit: boolean;
    hiddenColumns?: string[];
    cpm?: number | null;
    existingOptions?: number[];
};

export type CampaignResponse = {
    campaignId: string;
    campaignName: string;
    socialMedia?: string;
    creationDate?: string;
    price?: number;
    internalCost?: number;
    isBudgetManual?: boolean;
    displayCurrency: string;
    status: string;
    addedAccounts?: any[];
    campaignContent?: any[];
    shareLink?: string;
    totalFollowers?: number;
    totalImpressions?: number;
    totalLikes?: number;
    totalSaves?: number;
    totalComments?: number;
    totalShares?: number;
    isCpmAndResultHidden: boolean;
    isPriceHidden: boolean;
    canEdit: boolean;
    hiddenColumns?: string[];
    cpm?: number | null;
    existingOptions?: number[];
};

const toStringSafe = (v: unknown) => String(v ?? "");

const objectId = () => {
    const bytes = new Uint8Array(12);

    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
        crypto.getRandomValues(bytes);
    } else {
        for (let i = 0; i < 12; i++) {
            bytes[i] = Math.floor(Math.random() * 256);
        }
    }

    return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
};

export const getAccountKey = (account: EditableAccount | any) =>
    String(
        account.addedAccountsId ??
        account.socialAccountId ??
        account.accountId ??
        "",
    );
const getAutoBudgetFromAccounts = (accounts: EditableAccount[]) => {
    return (accounts ?? []).reduce((sum, item) => {
        return sum + Number(item.publicPrice ?? 0);
    }, 0);
};

const getFinalBudget = (editable: EditableCampaign) => {
    return editable.isBudgetManual
        ? Number(editable.price ?? 0)
        : getAutoBudgetFromAccounts(editable.addedAccounts);
};
export const normalizeCampaignForEdit = (
    data: CampaignResponse,
): EditableCampaign => {
    const normalizedAccounts = (data.addedAccounts ?? []).map((acc) => {
        const selected =
            acc?.selectedCampaignContentItem ?? acc?.selectedContent ?? null;

        return {
            addedAccountsId: toStringSafe(acc?.addedAccountsId),
            socialAccountId: toStringSafe(acc?.socialAccountId),
            influencerId: toStringSafe(acc?.influencerId),
            socialMedia: toStringSafe(acc?.socialMedia).toLowerCase(),
            username: toStringSafe(acc?.username),
            followers: Number(acc?.followers ?? 0),
            publicPrice: Number(acc?.publicPrice ?? 0),
            firstName: toStringSafe(acc?.firstName),
            logoUrl: toStringSafe(acc?.logoUrl ?? ""),
            genres: Array.isArray(acc?.genres) ? acc.genres : [],
            countries: Array.isArray(acc?.countries) ? acc.countries : [],
            statusLabel: toStringSafe(acc?.statusLabel).trim(),
            selectedCampaignContentItem: selected
                ? {
                    campaignContentItemId: toStringSafe(
                        selected?.campaignContentItemId,
                    ),
                    descriptionId: toStringSafe(selected?.descriptionId),
                }
                : null,

            dateRequest: toStringSafe(acc?.dateRequest || "ASAP"),

            postLink: toStringSafe(acc?.postLink),
            screenshot: toStringSafe(acc?.screenshot),
            impressions: Number(acc?.impressions ?? 0),
            like: Number(acc?.like ?? 0),
            comments: Number(acc?.comments ?? 0),
            shares: Number(acc?.shares ?? 0),
            saves: Number(acc?.saves ?? 0),
            rating: Number(acc?.rating ?? 0),
            cpm: Number(acc?.cpm ?? 0),
            confirmation: toStringSafe(acc?.confirmation),
            closePromo: toStringSafe(acc?.closePromo),
            datePost: toStringSafe(acc?.datePost),
        } satisfies EditableAccount;
    });

    const price = Number(data.price ?? 0);

    const autoBudget = normalizedAccounts.reduce((sum, acc) => {
        return sum + Number(acc.publicPrice ?? 0);
    }, 0);

    const isBudgetManual =
        typeof data.isBudgetManual === "boolean"
            ? data.isBudgetManual
            : price > 0 && price !== autoBudget;

    return {
        campaignId: toStringSafe(data.campaignId),
        campaignName: toStringSafe(data.campaignName),
        socialMedia: toStringSafe(data.socialMedia).toLowerCase(),
        creationDate: toStringSafe(data.creationDate),
        price,
        isBudgetManual,
        displayCurrency: toStringSafe(data.displayCurrency || "EUR"),
        status: toStringSafe(data.status).toLowerCase(),
        internalCost: Number(data.internalCost ?? 0),
        shareLink: toStringSafe(data.shareLink),
        totalFollowers: Number(data.totalFollowers ?? 0),
        totalImpressions: Number(data.totalImpressions ?? 0),
        totalLikes: Number(data.totalLikes ?? 0),
        totalSaves: Number(data.totalSaves ?? 0),
        totalComments: Number(data.totalComments ?? 0),
        totalShares: Number(data.totalShares ?? 0),

        isCpmAndResultHidden: Boolean(data.isCpmAndResultHidden),
        isPriceHidden: Boolean(data.isPriceHidden),
        canEdit: Boolean(data.canEdit),
        hiddenColumns: Array.isArray(data.hiddenColumns) ? data.hiddenColumns : [],
        cpm: data.cpm ?? null,

        existingOptions: Array.isArray(data.existingOptions)
            ? data.existingOptions
                .map((item) => Number(item))
                .filter((item) => !Number.isNaN(item))
            : [0],

        addedAccounts: normalizedAccounts,

        campaignContent: (data.campaignContent ?? []).map((item) => ({
            _id: toStringSafe(item?._id),
            socialMedia: toStringSafe(item?.socialMedia).toLowerCase(),
            socialMediaGroup: toStringSafe(item?.socialMediaGroup),
            mainLink: toStringSafe(item?.mainLink),
            mediaCache: item?.mediaCache ?? undefined,
            descriptions: (item?.descriptions ?? []).map((desc: any) => ({
                _id: toStringSafe(desc?._id),
                description: toStringSafe(desc?.description),
            })),
            taggedUser: toStringSafe(item?.taggedUser),
            taggedLink: toStringSafe(item?.taggedLink),
            additionalBrief: toStringSafe(item?.additionalBrief),
        })),
    };
};
// const EDITABLE_STATUSES = ["proposal", "pending", "distributing"] as const;

const getInitialView = ({
                            status,
                        }: {
    status?: string;
    canEdit?: boolean;
}): ViewMode => {
    const normalizedStatus = String(status ?? "").toLowerCase();

    if (
        normalizedStatus === "distributing" ||
        normalizedStatus === "completed"
    ) {
        return 0;
    }

    return -1;
};
// const getInitialView = ({
//                             status,
//                             canEdit,
//                         }: {
//     status?: string;
//     canEdit?: boolean;
// }): ViewMode => {
//     const normalizedStatus = String(status ?? "").toLowerCase();
//
//     if (normalizedStatus === "proposal") {
//         return canEdit ? -1 : 0;
//     }
//
//     return canEdit ? -1 : 1;
// };
// const isEditableNow = ({
//                            status,
//                            canEdit,
//                            view,
//                        }: {
//     status: string;
//     canEdit: boolean;
//     view: ViewMode;
// }) => {
//     if (!canEdit) return false;
//     if (status === "proposal") return view === -1;
//     return true;
// };
const isEditableNow = ({
                           status,
                           canEdit,
                           view,
                       }: {
    status: string;
    canEdit: boolean;
    view: ViewMode;
}) => {
    const normalizedStatus = String(status ?? "").toLowerCase();

    if (view !== -1) return false;

    if (normalizedStatus === "completed") {
        return canEdit;
    }

    return true;
};

const buildBasePayload = (editable: EditableCampaign) => {
    const finalBudget = getFinalBudget(editable);

    return {
        campaignName: editable.campaignName,

        // оставляю оба поля, чтобы не словить баг из-за разного backend-контракта
        price: finalBudget,
        campaignPrice: finalBudget,
        isBudgetManual: Boolean(editable.isBudgetManual),

        addedAccounts: editable.addedAccounts.map((acc) => ({
            socialAccountId: acc.socialAccountId,
            influencerId: acc.influencerId,
            socialMedia: acc.socialMedia,
            username: acc.username,
            selectedCampaignContentItem: acc.selectedCampaignContentItem
                ? {
                    campaignContentItemId:
                    acc.selectedCampaignContentItem.campaignContentItemId,
                    descriptionId: acc.selectedCampaignContentItem.descriptionId,
                }
                : null,
            dateRequest: acc.dateRequest,

            postLink: acc.postLink || undefined,
            screenshot: acc.screenshot || undefined,
            impressions:
                acc.impressions !== undefined && acc.impressions !== null
                    ? Number(acc.impressions)
                    : undefined,
            like:
                acc.like !== undefined && acc.like !== null
                    ? Number(acc.like)
                    : undefined,
            comments:
                acc.comments !== undefined && acc.comments !== null
                    ? Number(acc.comments)
                    : undefined,
            shares:
                acc.shares !== undefined && acc.shares !== null
                    ? Number(acc.shares)
                    : undefined,
            saves:
                acc.saves !== undefined && acc.saves !== null
                    ? Number(acc.saves)
                    : undefined,
            rating:
                acc.rating !== undefined && acc.rating !== null
                    ? Number(acc.rating)
                    : undefined,
        })),

        campaignContent: editable.campaignContent.map((item) => ({
            _id: item._id,
            socialMedia: item.socialMedia,
            socialMediaGroup: item.socialMediaGroup,
            mainLink: item.mainLink,
            descriptions: item.descriptions.map((desc) => ({
                _id: desc._id,
                description: desc.description,
            })),
            taggedUser: item.taggedUser,
            taggedLink: item.taggedLink,
            additionalBrief: item.additionalBrief,
        })),

        displayCurrency: editable.displayCurrency,
    };
};
// const buildExtendedPayload = (editable: EditableCampaign) => ({
//     ...buildBasePayload(editable),
//     isCpmAndResultHidden: editable.isCpmAndResultHidden,
//     isPriceHidden: editable.isPriceHidden,
// });
type CampaignManagementStore = {
    original: EditableCampaign | null;
    editable: EditableCampaign | null;
    insightMode: boolean;
    setInsightMode: (value: boolean) => void;
    status: string;
    canEdit: boolean;
    view: ViewMode;
    existingOptions?: number[];
    activeOptionIndex: number | null;
    initCampaign: (payload: CampaignResponse, optionIndex?: number) => void;
    resetCampaign: () => void;
    setView: (view: ViewMode) => void;
    recentlyAddedAccountKeys: string[];
    deletingAccountKey: string | null;

    markAccountAsAdded: (accountKey: string) => void;
    clearRecentlyAdded: (accountKey: string) => void;
    setAccountInsightField: (
        accountKey: string,
        field:
            | "postLink"
            | "screenshot"
            | "impressions"
            | "like"
            | "comments"
            | "shares"
            | "saves"
            | "rating",
        value: string | number,
    ) => void;
    setDeletingAccountKey: (accountKey: string | null) => void;
    isEditable: () => boolean;
    canManageAccounts: () => boolean;
    addContentDescription: (contentId: string, text?: string) => string;
    updateContentDescription: (
        contentId: string,
        descriptionId: string,
        value: string,
    ) => void;
    removeContentDescription: (contentId: string, descriptionId: string) => void;
    setCampaignName: (value: string) => void;
    setDisplayCurrency: (value: string) => void;
    setIsCpmAndResultHidden: (value: boolean) => void;
    setIsPriceHidden: (value: boolean) => void;
    resetEditableToOriginal: () => void;
    setAccountDateRequest: (accountKey: string, dateRequest: string) => void;
    setAccountSelectedContent: (
        accountKey: string,
        selected: SelectedCampaignContentItem | null,
    ) => void;
    changeView: boolean;
    setChangeView: (value: boolean) => void;
    addAccounts: (accounts: EditableAccount[]) => void;
    removeAccount: (accountKey: string) => void;

    setContentField: (
        contentId: string,
        field: "mainLink" | "taggedUser" | "taggedLink" | "additionalBrief",
        value: string,
    ) => void;
    setContentDescriptions: (
        contentId: string,
        descriptions: EditableDescription[],
    ) => void;

    addContentItem: (
        socialMedia: string,
        payload?: Partial<EditableCampaignContentItem>,
        inheritFromContentId?: string,
    ) => {
        contentId: string;
        firstDescriptionId: string;
    };

    removeContentItem: (contentId: string) => void;
    setCampaignPrice: (value: number) => void;
    buildSavePayload: () => any | null;
};

export const useCampaignManagementStore = create<CampaignManagementStore>(
    (set, get) => ({
        original: null,
        editable: null,
        recentlyAddedAccountKeys: [],
        status: "",
        canEdit: false,
        view: 0,
        changeView: false,
        activeOptionIndex: null,
        deletingAccountKey: null,
        insightMode: false,
        initCampaign: (payload, optionIndex = 0) => {
            const normalized = normalizeCampaignForEdit(payload);
            const normalizedStatus = toStringSafe(payload?.status).toLowerCase();
            console.log(normalizedStatus,'status')
            const shouldOpenInsightFirst =
                normalizedStatus === "distributing" || normalizedStatus === "completed";
            console.log(shouldOpenInsightFirst)

            set({
                original: structuredClone(normalized),
                editable: structuredClone(normalized),
                status: normalizedStatus,
                canEdit: Boolean(payload?.canEdit),
                view: getInitialView({
                    status: payload?.status,
                    canEdit: payload?.canEdit,
                }),
                recentlyAddedAccountKeys: [],
                changeView: false,
                insightMode: shouldOpenInsightFirst,
                existingOptions: Array.isArray(payload?.existingOptions)
                    ? payload.existingOptions
                    : [0],
                activeOptionIndex: optionIndex,
            });
        },
        setInsightMode: (value) =>
            set((state) => ({
                insightMode:
                    typeof value === "function" ? value(state.insightMode) : value,
            })),
        setCampaignPrice: (value) =>
            set((state) => {
                if (!state.editable) return state;

                return {
                    editable: {
                        ...state.editable,
                        price: Number(value ?? 0),
                        isBudgetManual: true,
                    },
                };
            }),
        setDeletingAccountKey: (accountKey) => set({ deletingAccountKey: accountKey }),
        setChangeView: (value) =>
            set((state) => ({
                changeView:
                    typeof value === "function" ? value(state.changeView) : value,
            })),
        setAccountInsightField: (accountKey, field, value) =>
            set((state) => {
                if (!state.editable) return state;

                return {
                    editable: {
                        ...state.editable,
                        addedAccounts: state.editable.addedAccounts.map((acc) =>
                            getAccountKey(acc) === String(accountKey)
                                ? {
                                    ...acc,
                                    [field]:
                                        field === "postLink" || field === "screenshot"
                                            ? String(value)
                                            : Number(value),
                                }
                                : acc,
                        ),
                    },
                };
            }),
        resetEditableToOriginal: () =>
            set((state) => {
                if (!state.original) return state;

                return {
                    editable: structuredClone(state.original),
                    recentlyAddedAccountKeys: [],
                };
            }),
        markAccountAsAdded: (accountKey) =>
            set((state) => ({
                recentlyAddedAccountKeys: [
                    ...state.recentlyAddedAccountKeys,
                    String(accountKey),
                ],
            })),

        clearRecentlyAdded: (accountKey) =>
            set((state) => ({
                recentlyAddedAccountKeys: state.recentlyAddedAccountKeys.filter(
                    (key) => key !== String(accountKey),
                ),
            })),
        resetCampaign: () =>
            set({
                original: null,
                editable: null,
                status: "",
                canEdit: false,
                view: 0,
                insightMode: false,
                changeView: false,
                existingOptions: [],
                activeOptionIndex: null,
                recentlyAddedAccountKeys: [],
                deletingAccountKey: null,
            }),
        setView: (view) => set({ view }),

        isEditable: () => {
            const state = get();
            return isEditableNow({
                status: state.status,
                canEdit: state.canEdit,
                view: state.view,
            });
        },
        addContentDescription: (contentId, text = "") => {
            const newDescriptionId = objectId();

            set((state) => {
                if (!state.editable) return state;

                return {
                    editable: {
                        ...state.editable,
                        campaignContent: state.editable.campaignContent.map((item) =>
                            String(item._id) === String(contentId)
                                ? {
                                    ...item,
                                    descriptions: [
                                        ...item.descriptions,
                                        {
                                            _id: newDescriptionId,
                                            description: text,
                                        },
                                    ],
                                }
                                : item,
                        ),
                    },
                };
            });

            return newDescriptionId;
        },

        updateContentDescription: (contentId, descriptionId, value) =>
            set((state) => {
                if (!state.editable) return state;

                return {
                    editable: {
                        ...state.editable,
                        campaignContent: state.editable.campaignContent.map((item) =>
                            String(item._id) === String(contentId)
                                ? {
                                    ...item,
                                    descriptions: item.descriptions.map((desc) =>
                                        String(desc._id) === String(descriptionId)
                                            ? { ...desc, description: value }
                                            : desc,
                                    ),
                                }
                                : item,
                        ),
                    },
                };
            }),

        removeContentDescription: (contentId, descriptionId) =>
            set((state) => {
                if (!state.editable) return state;

                return {
                    editable: {
                        ...state.editable,
                        campaignContent: state.editable.campaignContent.map((item) =>
                            String(item._id) === String(contentId)
                                ? {
                                    ...item,
                                    descriptions: item.descriptions.filter(
                                        (desc) => String(desc._id) !== String(descriptionId),
                                    ),
                                }
                                : item,
                        ),
                    },
                };
            }),
        canManageAccounts: () => {
            const state = get();
            const normalizedStatus = String(state.status ?? "").toLowerCase();

            if (state.view !== -1) return false;

            if (normalizedStatus === "completed") {
                return Boolean(state.canEdit);
            }

            return true;
        },

        setCampaignName: (value) =>
            set((state) => {
                if (!state.editable) return state;
                return {
                    editable: {
                        ...state.editable,
                        campaignName: value,
                    },
                };
            }),

        setDisplayCurrency: (value) =>
            set((state) => {
                if (!state.editable) return state;
                return {
                    editable: {
                        ...state.editable,
                        displayCurrency: value,
                    },
                };
            }),

        setIsCpmAndResultHidden: (value) =>
            set((state) => {
                if (!state.editable) return state;
                return {
                    editable: {
                        ...state.editable,
                        isCpmAndResultHidden: value,
                    },
                };
            }),

        setIsPriceHidden: (value) =>
            set((state) => {
                if (!state.editable) return state;
                return {
                    editable: {
                        ...state.editable,
                        isPriceHidden: value,
                    },
                };
            }),

        setAccountDateRequest: (accountKey, dateRequest) =>
            set((state) => {
                if (!state.editable) return state;

                return {
                    editable: {
                        ...state.editable,
                        addedAccounts: state.editable.addedAccounts.map((acc) =>
                            getAccountKey(acc) === String(accountKey)
                                ? { ...acc, dateRequest }
                                : acc,
                        ),
                    },
                };
            }),

        setAccountSelectedContent: (accountKey, selected) =>
            set((state) => {
                if (!state.editable) return state;

                return {
                    editable: {
                        ...state.editable,
                        addedAccounts: state.editable.addedAccounts.map((acc) =>
                            getAccountKey(acc) === String(accountKey)
                                ? {
                                    ...acc,
                                    selectedCampaignContentItem: selected
                                        ? {
                                            campaignContentItemId: toStringSafe(
                                                selected.campaignContentItemId,
                                            ),
                                            descriptionId: toStringSafe(selected.descriptionId),
                                        }
                                        : null,
                                }
                                : acc,
                        ),
                    },
                };
            }),

        addAccounts: (accounts) =>
            set((state) => {
                if (!state.editable) return state;

                const prevAccounts = state.editable.addedAccounts;
                const prevKeys = new Set(prevAccounts.map(getAccountKey));

                const nextRaw = (accounts ?? []).filter(
                    (acc) => !prevKeys.has(getAccountKey(acc)),
                );

                if (!nextRaw.length) return state;

                const allContent = state.editable.campaignContent;

                const nextPrepared = nextRaw.map((acc) => {
                    const sm = String(acc.socialMedia ?? "").toLowerCase();
                    const group = getGroupBySocial(sm);

                    const defaultItem =
                        allContent.find(
                            (item) => String(item.socialMedia ?? "").toLowerCase() === sm,
                        ) ??
                        allContent.find(
                            (item) => String(item.socialMediaGroup ?? "") === group,
                        ) ??
                        null;

                    const defaultSelected =
                        defaultItem?._id && defaultItem?.descriptions?.[0]?._id
                            ? {
                                campaignContentItemId: String(defaultItem._id),
                                descriptionId: String(defaultItem.descriptions[0]._id),
                            }
                            : null;

                    return {
                        ...acc,
                        socialMedia: String(acc.socialMedia ?? "").toLowerCase(),
                        publicPrice: Number(acc.publicPrice ?? 0),
                        selectedCampaignContentItem: defaultSelected,
                        dateRequest: acc.dateRequest ?? "ASAP",
                    };
                });

                const nextAccounts = [...prevAccounts, ...nextPrepared];
                const nextAutoBudget = getAutoBudgetFromAccounts(nextAccounts);

                return {
                    editable: {
                        ...state.editable,
                        addedAccounts: nextAccounts,
                        price: state.editable.isBudgetManual
                            ? Number(state.editable.price ?? 0)
                            : nextAutoBudget,
                    },
                    recentlyAddedAccountKeys: [
                        ...state.recentlyAddedAccountKeys,
                        ...nextPrepared.map(getAccountKey),
                    ],
                };
            }),

        removeAccount: (accountKey) =>
            set((state) => {
                if (!state.editable) return state;

                const prevAcc = state.editable.addedAccounts;
                const removed = prevAcc.find(
                    (acc) => getAccountKey(acc) === String(accountKey),
                );

                if (!removed) return state;

                const nextAccounts = prevAcc.filter(
                    (acc) => getAccountKey(acc) !== String(accountKey),
                );

                const removedGroup = getGroupBySocial(removed.socialMedia);
                const stillHasGroup = nextAccounts.some(
                    (acc) => getGroupBySocial(acc.socialMedia) === removedGroup,
                );

                let nextContent = state.editable.campaignContent;

                if (!stillHasGroup) {
                    nextContent = nextContent.filter(
                        (item) => item.socialMediaGroup !== removedGroup,
                    );
                }

                const nextAutoBudget = getAutoBudgetFromAccounts(nextAccounts);

                return {
                    editable: {
                        ...state.editable,
                        addedAccounts: nextAccounts,
                        campaignContent: nextContent,
                        price: state.editable.isBudgetManual
                            ? Number(state.editable.price ?? 0)
                            : nextAutoBudget,
                    },
                    deletingAccountKey: null,
                    recentlyAddedAccountKeys: state.recentlyAddedAccountKeys.filter(
                        (key) => key !== String(accountKey),
                    ),
                };
            }),

        setContentField: (contentId, field, value) =>
            set((state) => {
                if (!state.editable) return state;

                return {
                    editable: {
                        ...state.editable,
                        campaignContent: state.editable.campaignContent.map((item) =>
                            String(item._id) === String(contentId)
                                ? { ...item, [field]: value }
                                : item,
                        ),
                    },
                };
            }),

        setContentDescriptions: (contentId, descriptions) =>
            set((state) => {
                if (!state.editable) return state;

                return {
                    editable: {
                        ...state.editable,
                        campaignContent: state.editable.campaignContent.map((item) =>
                            String(item._id) === String(contentId)
                                ? { ...item, descriptions }
                                : item,
                        ),
                    },
                };
            }),

        addContentItem: (socialMedia, payload = {}, inheritFromContentId) => {
            const state = get();
            const editable = state.editable;
            if (!editable) return { contentId: "", firstDescriptionId: "" };

            const sm = toStringSafe(socialMedia).toLowerCase();
            const group = getGroupBySocial(sm);

            const base =
                editable.campaignContent.find(
                    (item) => String(item._id) === String(inheritFromContentId),
                ) ??
                editable.campaignContent.find(
                    (item) => String(item.socialMedia ?? "").toLowerCase() === sm,
                ) ??
                editable.campaignContent.find(
                    (item) => String(item.socialMediaGroup ?? "") === group,
                ) ??
                null;

            const newId = objectId();

            const descriptions =
                payload?.descriptions?.map((desc) => ({
                    _id: toStringSafe(desc?._id || objectId()),
                    description: toStringSafe(desc?.description),
                })) ??
                (base?.descriptions ?? []).map((desc) => ({
                    _id: objectId(),
                    description: toStringSafe(desc?.description),
                }));

            const firstDescriptionId = String(descriptions?.[0]?._id ?? "");

            const nextItem: EditableCampaignContentItem = {
                _id: newId,
                socialMedia: sm,
                socialMediaGroup: group,
                mainLink: toStringSafe(payload?.mainLink ?? base?.mainLink),
                mediaCache: payload?.mediaCache ?? base?.mediaCache ?? undefined,
                taggedUser: toStringSafe(payload?.taggedUser ?? base?.taggedUser),
                taggedLink: toStringSafe(payload?.taggedLink ?? base?.taggedLink),
                additionalBrief: toStringSafe(payload?.additionalBrief ?? base?.additionalBrief),
                descriptions,
            };

            set((curr) => {
                if (!curr.editable) return curr;

                return {
                    editable: {
                        ...curr.editable,
                        campaignContent: [...curr.editable.campaignContent, nextItem],
                    },
                };
            });

            return {
                contentId: newId,
                firstDescriptionId,
            };
        },

        removeContentItem: (contentId) =>
            set((state) => {
                if (!state.editable) return state;

                const nextContent = state.editable.campaignContent.filter(
                    (item) => String(item._id) !== String(contentId),
                );

                const nextAccounts = state.editable.addedAccounts.map((acc) => {
                    if (
                        acc.selectedCampaignContentItem?.campaignContentItemId ===
                        String(contentId)
                    ) {
                        const sm = String(acc.socialMedia ?? "").toLowerCase();
                        const group = getGroupBySocial(sm);

                        const fallback =
                            nextContent.find(
                                (item) => String(item.socialMedia ?? "").toLowerCase() === sm,
                            ) ??
                            nextContent.find(
                                (item) => String(item.socialMediaGroup ?? "") === group,
                            ) ??
                            null;

                        return {
                            ...acc,
                            selectedCampaignContentItem:
                                fallback?._id && fallback?.descriptions?.[0]?._id
                                    ? {
                                        campaignContentItemId: String(fallback._id),
                                        descriptionId: String(fallback.descriptions[0]._id),
                                    }
                                    : null,
                        };
                    }

                    return acc;
                });

                return {
                    editable: {
                        ...state.editable,
                        campaignContent: nextContent,
                        addedAccounts: nextAccounts,
                    },
                };
            }),

        buildSavePayload: () => {
            const state = get();
            if (!state.editable) return null;

            const basePayload = buildBasePayload(state.editable);

            switch (state.status) {
                case "proposal":
                    return basePayload;

                case "draft":
                case "live":
                case "completed":
                case "pending":
                case "under_review":
                case "distributing":
                    return {
                        ...basePayload,
                        isCpmAndResultHidden: state.editable.isCpmAndResultHidden,
                        isPriceHidden: state.editable.isPriceHidden,
                    };

                default:
                    return {
                        ...basePayload,
                        isCpmAndResultHidden: state.editable.isCpmAndResultHidden,
                        isPriceHidden: state.editable.isPriceHidden,
                    };
            }
        },
    }),
);