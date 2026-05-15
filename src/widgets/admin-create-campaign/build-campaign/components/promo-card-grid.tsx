import React from "react";
import chevronDown from "../assets/Vector (17).svg";

import { GenresCountriesPopover } from "./genres-countries-popover";
import styles from "./promo-card-grid.module.scss";
import { useBuildCampaignParams } from "@/features/admin-create-campaign/build-campaign-filters/model/use-build-campaign-params";
import type { PromoAccount } from "@/entities/admin-create-campaign/promo-accounts/model/promo-account.types";
import { getSocialMediaIcon } from "@/shared/libs/get-social-media-icon";
import type { SocialMedia } from "@/entities/campaign-managment/model/campaign.managment";
import { formatFollowers } from "@/entities/campaign-managment/model/campaign-management.helpers";

interface Props {
    data: PromoAccount;
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

export const PromoCardGrid: React.FC<Props> = ({
                                                   data,
                                                   isInclude,
                                                   isSelected,
                                                   onToggle,
                                               }) => {
    const dropdownRef = React.useRef<HTMLDivElement>(null);
    const { selectedCurrency } = useBuildCampaignParams();

    const [open, setOpen] = React.useState(false);

    const hasGenres = (data.musicGenres?.length ?? 0) > 0;
    const hasCountries = (data.countries?.length ?? 0) > 0;
    const hasMeta = hasGenres || hasCountries;

    const onSelect = () => {
        if (isInclude) return;
        onToggle(data);
    };

    return (
        <div
            ref={dropdownRef}
            onClick={onSelect}
            className={`${styles.card} ${open ? styles.open : ""} ${
                isInclude ? styles.include : ""
            } ${isSelected ? styles.active : ""}`}
        >
            <div className={styles.head}>
                <div className={styles.cost}>
                    <img src={data.logoUrl} alt="" />
                    <p>
                        {getPriceByCurrency(data.prices, selectedCurrency)}
                        {selectedCurrency.key}
                    </p>
                </div>

                <div className={styles.social}>
                    <img
                        src={getSocialMediaIcon(data.socialMedia as SocialMedia) || ""}
                        alt=""
                    />
                    {data.socialMedia !== "press" && (
                        <p>{formatFollowers(data.followers)}</p>
                    )}
                </div>
            </div>

            <div className={styles.information}>
                <div className={styles.overflow}>
                    <p>{data.username}</p>
                </div>

                <div onClick={(e) => e.stopPropagation()}>
                    {hasMeta && (
                        <div
                            onClick={() => setOpen((prev) => !prev)}
                            className={`${styles.infoHead} ${
                                open ? styles.infoHeadActive : ""
                            }`}
                        >
                            <img src={chevronDown} alt="" />
                        </div>
                    )}
                </div>

                {open && hasMeta && (
                    <GenresCountriesPopover
                        refElement={dropdownRef}
                        setOpen={setOpen}
                        open={open}
                        data={{
                            musicGenres: data.musicGenres ?? [],
                            countries: data.countries ?? [],
                        }}
                        isInclude={isInclude}
                        isSelected={isSelected}
                    />
                )}
            </div>

            {isInclude && (
                <div className={styles.includedText}>
                    <p>Included in your selected offer</p>
                </div>
            )}
        </div>
    );
};