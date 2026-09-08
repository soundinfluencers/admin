import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
    CampaignBuilderStore,
    SelectedCampaignAccount,
} from "./campaign-builder.types";
import type {
    CampaignCurrencyCode,
} from "@/entities/admin-create-campaign/campaign-filter/model/campaign-filter.types";

const initialState = {
    campaignName: "",
    selectedPromoCardIds: [],
    selectedAccounts: [],
    campaignContent: [],
    totalPrice: 0,
    selectedCurrency: "€",
    postContentDraft: null,
    blocksDraft: null,
} satisfies Omit<CampaignBuilderStore, "actions">;

const calcTotal = (accounts: SelectedCampaignAccount[]) =>
    accounts.reduce((sum, item) => sum + Number(item.price ?? 0), 0);

const getExactPresetPrice = (
    account: SelectedCampaignAccount,
    currency: CampaignCurrencyCode,
) => {
    const price = account.prices?.[currency];

    if (typeof price !== "number" || !Number.isFinite(price)) {
        throw new Error(
            `Missing ${currency} preset price for account ${account.accountId}`,
        );
    }

    return price;
};

export const useCampaignBuilderStore = create<CampaignBuilderStore>()(
    persist(
        (set) => ({
            ...initialState,

            actions: {
                setCampaignName: (value) => set({ campaignName: value }),
                setSelectedCurrency: ({ currency, key }) =>
                    set((state) => {
                        const selectedAccounts = state.selectedAccounts.map((account) => ({
                            ...account,
                            price: getExactPresetPrice(account, currency),
                        }));

                        return {
                            selectedCurrency: key,
                            selectedAccounts,
                            totalPrice: calcTotal(selectedAccounts),
                        };
                    }),
                setSelectedPromoCardIds: (ids) => set({ selectedPromoCardIds: ids }),

                togglePromoCardId: (id) =>
                    set((state) => {
                        const exists = state.selectedPromoCardIds.includes(id);

                        return {
                            selectedPromoCardIds: exists
                                ? state.selectedPromoCardIds.filter((item) => item !== id)
                                : [...state.selectedPromoCardIds, id],
                        };
                    }),

                setTotalPrice: (value) => set({ totalPrice: value }),

                setSelectedAccounts: (accounts) =>
                    set({
                        selectedAccounts: accounts,
                        totalPrice: calcTotal(accounts),
                    }),

                upsertSelectedAccount: (account) =>
                    set((state) => {
                        const exists = state.selectedAccounts.some(
                            (item) => item.accountId === account.accountId,
                        );

                        const nextAccounts = exists
                            ? state.selectedAccounts.map((item) =>
                                item.accountId === account.accountId ? account : item,
                            )
                            : [...state.selectedAccounts, account];

                        return {
                            selectedAccounts: nextAccounts,
                            totalPrice: calcTotal(nextAccounts),
                        };
                    }),

                togglePromoCard: (account) =>
                    set((state) => {
                        const existing = state.selectedAccounts.find(
                            (item) => item.accountId === account.accountId,
                        );

                        const existsInPromoIds = state.selectedPromoCardIds.includes(
                            account.accountId,
                        );

                        const nextPromoIds = existsInPromoIds
                            ? state.selectedPromoCardIds.filter((id) => id !== account.accountId)
                            : [...state.selectedPromoCardIds, account.accountId];

                        let nextAccounts = state.selectedAccounts;

                        if (existsInPromoIds) {
                            nextAccounts = state.selectedAccounts.filter(
                                (item) => item.accountId !== account.accountId,
                            );
                        } else {
                            if (existing) {
                                nextAccounts = state.selectedAccounts.map((item) =>
                                    item.accountId === account.accountId
                                        ? { ...item, ...account, source: "manual" }
                                        : item,
                                );
                            } else {
                                nextAccounts = [
                                    ...state.selectedAccounts,
                                    { ...account, source: "manual" as const },
                                ];
                            }
                        }

                        return {
                            selectedPromoCardIds: nextPromoIds,
                            selectedAccounts: nextAccounts,
                            totalPrice: calcTotal(nextAccounts),
                        };
                    }),

                setSelectedCampaignContentItem: (accountId, selectedCampaignContentItem) =>
                    set((state) => ({
                        selectedAccounts: state.selectedAccounts.map((account) =>
                            account.accountId === accountId
                                ? { ...account, selectedCampaignContentItem }
                                : account,
                        ),
                    })),

                setAccountDateRequest: (accountId, dateRequest) =>
                    set((state) => ({
                        selectedAccounts: state.selectedAccounts.map((account) =>
                            account.accountId === accountId
                                ? { ...account, dateRequest }
                                : account,
                        ),
                    })),

                setCampaignContent: (items) => set({ campaignContent: items }),

                setPostContentDraft: (value) => set({ postContentDraft: value }),

                setBlocksDraft: (value) => set({ blocksDraft: value }),

                syncSelectedAccountsContent: (addedAccounts) =>
                    set((state) => ({
                        selectedAccounts: state.selectedAccounts.map((account) => {
                            const matched = addedAccounts.find(
                                (item) =>
                                    String(item.socialAccountId) === String(account.accountId),
                            );

                            if (!matched) return account;

                            return {
                                ...account,
                                selectedCampaignContentItem:
                                    matched.selectedCampaignContentItem ?? null,
                                dateRequest: matched.dateRequest ?? account.dateRequest ?? "ASAP",
                                profileType: matched.profileType ?? account.profileType,
                            };
                        }),
                    })),

                reset: () =>
                    set({
                        ...initialState,
                    }),
            },
        }),
        {
            name: "admin-create-campaign-builder-store",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                campaignName: state.campaignName,
                selectedPromoCardIds: state.selectedPromoCardIds,
                selectedAccounts: state.selectedAccounts,
                campaignContent: state.campaignContent,
                totalPrice: state.totalPrice,
                postContentDraft: state.postContentDraft,
                blocksDraft: state.blocksDraft,
                selectedCurrency: state.selectedCurrency,
            }),
            version: 2,
            migrate: (persistedState, version) => {
                const state = persistedState as Partial<CampaignBuilderStore>;
                const hasIncompatibleSelectedAccounts =
                    version < 2 &&
                    Array.isArray(state.selectedAccounts) &&
                    state.selectedAccounts.some((account) => !account.prices);

                if (!hasIncompatibleSelectedAccounts) {
                    return state as CampaignBuilderStore;
                }

                return {
                    ...state,
                    selectedPromoCardIds: [],
                    selectedAccounts: [],
                    campaignContent: [],
                    totalPrice: 0,
                    postContentDraft: null,
                    blocksDraft: null,
                } as CampaignBuilderStore;
            },
        },
    ),
);
