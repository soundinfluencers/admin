import { create } from "zustand";
import type { PromoAccount } from "@/entities/admin-create-campaign/promo-accounts/model/promo-account.types";

type SelectedPromoAccount = PromoAccount & {
    __pickId: string;
};

type PromoSelectionStore = {
    selectedCards: SelectedPromoAccount[];
    toggleCard: (card: PromoAccount) => void;
    removeSelectedCard: (pickId: string) => void;
    clearSelectedCards: () => void;
    isSelected: (accountId: string) => boolean;
};

const makePickId = (card: PromoAccount) => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
    }

    return `${card.accountId}-${Date.now()}-${Math.random()}`;
};

export const useCampaignManagementAddAccountsStore =
    create<PromoSelectionStore>((set, get) => ({
        selectedCards: [],

        toggleCard: (card) =>
            set((state) => ({
                selectedCards: [
                    ...state.selectedCards,
                    {
                        ...card,
                        __pickId: makePickId(card),
                    },
                ],
            })),

        removeSelectedCard: (pickId) =>
            set((state) => ({
                selectedCards: state.selectedCards.filter(
                    (item) => String(item.__pickId) !== String(pickId),
                ),
            })),

        clearSelectedCards: () => set({ selectedCards: [] }),

        isSelected: (accountId) =>
            get().selectedCards.some(
                (item) => String(item.accountId) === String(accountId),
            ),
    }));