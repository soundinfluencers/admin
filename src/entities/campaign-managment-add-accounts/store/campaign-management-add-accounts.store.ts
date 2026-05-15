import { create } from "zustand";
import type { PromoAccount } from "@/entities/admin-create-campaign/promo-accounts/model/promo-account.types";

type PromoSelectionStore = {
    selectedCards: PromoAccount[];
    toggleCard: (card: PromoAccount) => void;
    clearSelectedCards: () => void;
    isSelected: (accountId: string) => boolean;
};

export const useCampaignManagementAddAccountsStore = create<PromoSelectionStore>((set, get) => ({
    selectedCards: [],

    toggleCard: (card) =>
        set((state) => {
            const exists = state.selectedCards.some(
                (item) => String(item.accountId) === String(card.accountId),
            );

            if (exists) {
                return {
                    selectedCards: state.selectedCards.filter(
                        (item) => String(item.accountId) !== String(card.accountId),
                    ),
                };
            }

            return {
                selectedCards: [...state.selectedCards, card],
            };
        }),

    clearSelectedCards: () => set({ selectedCards: [] }),

    isSelected: (accountId) =>
        get().selectedCards.some(
            (item) => String(item.accountId) === String(accountId),
        ),
}));