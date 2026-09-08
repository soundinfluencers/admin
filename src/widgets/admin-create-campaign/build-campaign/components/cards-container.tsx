import React from "react";
import { TableRowCard } from "./table-row-card";
import { PromoCardGrid } from "./promo-card-grid";
import styles from "./cards-container.module.scss";
import type {
    CampaignCardsViewMode,
    CampaignCurrencyCode,
} from "@/entities/admin-create-campaign/campaign-filter/model/campaign-filter.types";
import { toast } from "react-toastify";
import type { PromoAccount } from "@/entities/admin-create-campaign/promo-accounts/model/promo-account.types";
import { TableCardSkeleton } from "@/shared/ui/skeletons/table-card-skeleton";
import { CardSkeleton } from "@/shared/ui/skeletons/card-skeleton";
import { useCampaignManagementAddAccountsStore } from "@/entities/campaign-managment-add-accounts/store/campaign-management-add-accounts.store.ts";
import { useCampaignBuilderStore } from "@/entities/admin-create-campaign/campaign-builder/model/campaign-builder.store";

interface Props {
    view: CampaignCardsViewMode;
    setIsSmall: React.Dispatch<React.SetStateAction<boolean>>;
    isSmall: boolean;
    promosCards: PromoAccount[];
    isInitialLoading: boolean;
    isFetchingMore: boolean;
    isRefetching: boolean;
    isAttachMode: boolean;
    selectedCurrencyCode: CampaignCurrencyCode;
}

const getExactPresetPrice = (
    card: PromoAccount,
    currency: CampaignCurrencyCode,
) => {
    const price = card.prices[currency];

    if (typeof price !== "number" || !Number.isFinite(price)) {
        throw new Error(
            `Missing ${currency} preset price for account ${card.accountId}`,
        );
    }

    return price;
};

export const CardsContainer: React.FC<Props> = ({
                                                    view,
                                                    setIsSmall,
                                                    isSmall,
                                                    promosCards,
                                                    isInitialLoading,
                                                    isFetchingMore,
                                                    isRefetching,
                                                    isAttachMode,
                                                    selectedCurrencyCode,
                                                }) => {
    const dimStyle = isRefetching ? { opacity: 0.6 } : undefined;
    const selectedCards = useCampaignManagementAddAccountsStore((s) => s.selectedCards);
    const toggleCard = useCampaignManagementAddAccountsStore((s) => s.toggleCard);

    const selectedPromoCardIds = useCampaignBuilderStore((s) => s.selectedPromoCardIds);
    const togglePromoCard = useCampaignBuilderStore((s) => s.actions.togglePromoCard);

    const isSelected = React.useCallback(
        (card: PromoAccount) => {
            if (isAttachMode) {
                return selectedCards.some(
                    (item) => String(item.accountId) === String(card.accountId),
                );
            }

            return selectedPromoCardIds.includes(card.accountId);
        },
        [isAttachMode, selectedCards, selectedPromoCardIds],
    );

    const handleToggle = React.useCallback(
        (card: PromoAccount) => {
            if (isAttachMode) {
                toggleCard(card);
                return;
            }

            try {
                togglePromoCard({
                    accountId: card.accountId,
                    influencerId: card.influencerId,
                    socialMedia: card.socialMedia,
                    username: card.username,
                    profileType: card.profileType,
                    price: getExactPresetPrice(card, selectedCurrencyCode),
                    prices: card.prices,
                    dateRequest: "ASAP",
                    followers: card.followers,
                    countries: card.countries,
                    genres: card.musicGenres,
                    logoUrl: card.logoUrl,
                });
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Failed to select campaign account",
                );
            }
        },
        [isAttachMode, selectedCurrencyCode, toggleCard, togglePromoCard],
    );

    return (
        <div className={styles.block}>
            <div className={styles.main} style={dimStyle}>
                <div
                    className={`${styles.cardsContainer} ${
                        view === "table" ? styles.viewed : ""
                    }`}
                >
                    {view === "table" ? (
                        <div className={styles.promosGrid}>
                            <div
                                className={`${styles.promosGridHeader} ${
                                    isSmall ? styles.adaptive : ""
                                }`}
                            >
                                <div>Name</div>
                                <div>Price</div>
                                <div>Followers</div>
                                <div className={isSmall ? styles.center : ""}>Genres</div>
                                <div className={isSmall ? styles.center : ""}>Countries</div>
                            </div>

                            {isInitialLoading
                                ? Array.from({ length: 24 }).map((_, i) => (
                                    <TableCardSkeleton key={i} />
                                ))
                                : promosCards.map((card) => (
                                    <TableRowCard
                                        key={card.accountId}
                                        data={card}
                                        isSelected={isSelected(card)}
                                        isSmall={isSmall}
                                        setIsSmall={setIsSmall}
                                        isInclude={false}
                                        onToggle={handleToggle}
                                    />
                                ))}
                        </div>
                    ) : isInitialLoading ? (
                        Array.from({ length: 24 }).map((_, i) => (
                            <CardSkeleton key={i} />
                        ))
                    ) : (
                        promosCards.map((card) => (
                            <PromoCardGrid
                                key={card.accountId}
                                data={card}
                                isSelected={isSelected(card)}
                                isInclude={false}
                                onToggle={handleToggle}
                            />
                        ))
                    )}
                </div>

                {isRefetching && (
                    <div style={{ padding: 8, textAlign: "center" }}>Updating…</div>
                )}
            </div>

            {isFetchingMore && !isInitialLoading && (
                <div style={{ marginTop: "8px" }} className={styles.cardsContainer}>
                    {view === "table"
                        ? Array.from({ length: 6 }).map((_, i) => (
                            <TableCardSkeleton key={`more-${i}`} />
                        ))
                        : Array.from({ length: 6 }).map((_, i) => (
                            <CardSkeleton key={`more-${i}`} />
                        ))}
                </div>
            )}
        </div>
    );
};
