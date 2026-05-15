import React from "react";
import styles from "./table-row-card.module.scss";

import { useBuildCampaignParams } from "@/features/admin-create-campaign/build-campaign-filters/model/use-build-campaign-params";
import type { PromoAccount } from "@/entities/admin-create-campaign/promo-accounts/model/promo-account.types";
import { getSocialMediaIcon } from "@/shared/libs/get-social-media-icon";
import type { SocialMedia } from "@/entities/campaign-managment/model/campaign.managment";
import { formatFollowers } from "@/entities/campaign-managment/model/campaign-management.helpers";
import { AccountCheckbox } from "@/features/admin-create-campaign/account-checkbox/ui/account-checkbox";
import {TagsDropdown} from "@/widgets/admin-create-campaign/build-campaign/components/tags-dropdown.tsx";

interface Props {
    data: PromoAccount;
    setIsSmall: React.Dispatch<React.SetStateAction<boolean>>;
    isSmall: boolean;
    isInclude: boolean;
    isSelected: boolean;
    onToggle: (card: PromoAccount) => void;
}

const getPriceByCurrency = (
    prices: Record<string, number>,
    currency: { currency: string },
) => {
    return Number(prices?.[currency.currency] ?? prices?.EUR ?? 0);
};

export const TableRowCard: React.FC<Props> = ({
                                                  data,
                                                  setIsSmall,
                                                  isSmall,
                                                  isInclude,
                                                  isSelected,
                                                  onToggle,
                                              }) => {
    const { selectedCurrency } = useBuildCampaignParams();

    const handleToggle = () => {
        if (isInclude) return;
        onToggle(data);
    };

    React.useEffect(() => {
        const el = document.querySelector(`[data-id="${data.accountId}"]`);
        if (!el) return;

        const observer = new ResizeObserver((entries) => {
            const width = entries[0].contentRect.width;
            const nextIsSmall = width <= 896;

            setIsSmall((prev) => (prev === nextIsSmall ? prev : nextIsSmall));
        });

        observer.observe(el);
        return () => observer.disconnect();
    }, [data.accountId, setIsSmall]);

    const genres = [...(data.musicGenres || [])];
    const countries =
        data.countries?.map((c) => `${c.country} ${c.percentage}%`) ?? [];

    return (
        <div
            data-id={data.accountId}
            className={`${styles.row} ${isSmall ? styles.adaptive : ""}`}
        >
            <div className={styles.name}>
                <AccountCheckbox
                    onChange={handleToggle}
                    checked={isSelected}
                    label={data.username}
                />
            </div>

            <div className={styles.price}>
                <img src={data.logoUrl} alt="" />
                <span>
                    {getPriceByCurrency(data.prices, selectedCurrency)}
                    {selectedCurrency.key}
                </span>
            </div>

            <div className={styles.followers}>
                <img
                    src={getSocialMediaIcon(data.socialMedia as SocialMedia) || ""}
                    alt=""
                />
                {data.socialMedia !== "press" ? (
                    <span>{formatFollowers(data.followers)}</span>
                ) : (
                    <span>-</span>
                )}
            </div>

            <div className={styles.genres}>
                <TagsDropdown items={genres} placeholder="No genres" />
            </div>

            <div className={styles.countries}>
                <TagsDropdown items={countries} placeholder="No countries" />
            </div>
        </div>
    );
};