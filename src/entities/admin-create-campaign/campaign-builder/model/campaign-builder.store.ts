import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
    CampaignBuilderStore,
    SelectedCampaignAccount,
} from "./campaign-builder.types";

const initialState = {
    campaignName: "",
    selectedPromoCardIds: [],
    selectedAccounts: [],
    campaignContent: [],
    totalPrice: 0,
    postContentDraft: null,
    blocksDraft: null,
} satisfies Omit<CampaignBuilderStore, "actions">;

const calcTotal = (accounts: SelectedCampaignAccount[]) =>
    accounts.reduce((sum, item) => sum + Number(item.price ?? 0), 0);

export const useCampaignBuilderStore = create<CampaignBuilderStore>()(
    persist(
        (set) => ({
            ...initialState,

            actions: {
                setCampaignName: (value) => set({ campaignName: value }),

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
            }),
            version: 1,
        },
    ),
);