import { useEffect, useState } from "react";

import styles from "./bar.module.scss";

import edit from "./assets/edit-3.png";
import insight from "./assets/bar-chart-2.svg";
import activity from "./assets/activity.svg";

import type { EditableCampaign } from "@/entities/campaign-managment/store/campaign-management.store.ts";
import {
    formatCampaignDate,
    formatFollowers,
} from "@/entities/campaign-managment/model/campaign-management.helpers.ts";
import { EyeHide } from "@/features/campaign-management-add-accounts/eye-hide/eye-hide.tsx";
import {
    CurrencyDropdown,
    type CurrencyCode,
} from "@/features/campaign-management-add-accounts/currency-dropdown/ui/currency-dropdown.tsx";
import { useCampaignManagementStore } from "@/entities/campaign-managment/store/campaign-management.store.ts";
import { getCampaignBudget } from "@/entities/campaign-managment/model/campaign-budget.helpers.ts";

type Props = {
    campaign: EditableCampaign | null;
};

const getResultCPM = (cpm: number) => {
    if (cpm < 3) return "Excellent";
    if (cpm < 5) return "Highly Above Average";
    if (cpm < 9) return "Above Average";
    if (cpm < 12) return "Average";
    return "Low Average";
};

// const currencySymbolMap: Record<CurrencyCode, string> = {
//     EUR: "€",
//     USD: "$",
//     GBP: "£",
// };

export const InsightBar = ({ campaign }: Props) => {
    const setDisplayCurrency = useCampaignManagementStore((s) => s.setDisplayCurrency);
    const setIsPriceHidden = useCampaignManagementStore((s) => s.setIsPriceHidden);
    const setIsCpmAndResultHidden = useCampaignManagementStore((s) => s.setIsCpmAndResultHidden);
    const setCampaignPrice = useCampaignManagementStore((s) => s.setCampaignPrice);
    // const canEdit = useCampaignManagementStore((s) => s.isEditable());

    const currency = (campaign?.displayCurrency as CurrencyCode) || "EUR";
    // const currencySymbol = currencySymbolMap[currency];

    const resultCPM = getResultCPM(Number(campaign?.cpm ?? 0));
    const budget = getCampaignBudget(campaign);

    const [budgetInput, setBudgetInput] = useState(
        budget > 0 ? String(budget) : "",
    );

    useEffect(() => {
        setBudgetInput(budget > 0 ? String(budget) : "");
    }, [budget]);

    const posts = campaign?.addedAccounts?.length ?? 0;
    const videos = campaign?.campaignContent?.length ?? 0;
    const reach = campaign?.totalFollowers ?? 0;

    const impressions = campaign?.totalImpressions ?? 0;
    const likes = campaign?.totalLikes ?? 0;
    const comments = campaign?.totalComments ?? 0;
    const saves = campaign?.totalSaves ?? 0;
    const shares = campaign?.totalShares ?? 0;

    const isPriceHidden = Boolean(campaign?.isPriceHidden);
    const isCpmHidden = Boolean(campaign?.isCpmAndResultHidden);

    const handleBudgetChange = (value: string) => {
        const normalized = value.replace(",", ".");

        if (normalized === "") {
            setBudgetInput("");
            setCampaignPrice(0);
            return;
        }

        if (!/^\d*\.?\d*$/.test(normalized)) {
            return;
        }

        const cleaned = normalized.replace(/^0+(?=\d)/, "");

        setBudgetInput(cleaned);

        const next = Number(cleaned);
        setCampaignPrice(Number.isNaN(next) ? 0 : next);
    };

    const inputWidth = `${Math.max(budgetInput.length || 1, 2)}ch`;

    return (
        <div className={styles.barSection}>
            <div className={`${styles.barSectionInfo} ${styles.block}`}>
                <div className={styles.barSectionInfoTitle}>
                    <img src={edit} alt="" />
                    <h2>Brief</h2>
                </div>

                <div className={styles.barSectionInfoContent}>
                    <div className={styles.barSectionInfoLeftSection}>
                        <p>
                            Submitted: <span>{formatCampaignDate(campaign?.creationDate)}</span>
                        </p>

                        <div className={styles.eye}>
                            <p>
                                Budget:{" "}
                                <span>
                                    {isPriceHidden ? (
                                        "••••"
                                    ) :  <span className={styles.barEditableInline}>
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                value={budgetInput}
                                                style={{ width: inputWidth }}
                                                placeholder="0"
                                                onChange={(e) => handleBudgetChange(e.target.value)}
                                            />
                                        </span>}
                                </span>
                            </p>

                            <CurrencyDropdown
                                value={currency}
                                onChange={(value) => setDisplayCurrency(value)}
                            />

                            <EyeHide
                                isHidden={isPriceHidden}
                                onToggle={() => setIsPriceHidden(!isPriceHidden)}
                            />
                        </div>

                        <p>
                            Posts: <span>{posts}</span>
                        </p>
                    </div>

                    <div className={styles.barSectionInfoRightSection}>
                        <p>
                            Reach: <span>{formatFollowers(reach)} followers</span>
                        </p>
                        <p>
                            Videos: <span>{videos}</span>
                        </p>
                    </div>
                </div>
            </div>

            <div className={`${styles.barSectionInfo} ${styles.block}`}>
                <div className={styles.barSectionInfoTitle}>
                    <img src={insight} alt="" />
                    <h2>Insights</h2>
                </div>

                <div className={styles.barSectionInfoContent}>
                    <div className={styles.barSectionInfoLeftSection}>
                        <p>
                            Impressions: <span>{impressions}</span>
                        </p>
                        <p>
                            Likes: <span>{likes}</span>
                        </p>
                        <p>
                            Saves: <span>{saves}</span>
                        </p>
                    </div>

                    <div className={styles.barSectionInfoRightSection}>
                        <p>
                            Comments: <span>{comments}</span>
                        </p>
                        <p>
                            Shares: <span>{shares}</span>
                        </p>
                    </div>
                </div>
            </div>

            <div className={`${styles.barSectionInfo} ${styles.block}`}>
                <div className={styles.barSectionInfoTitle}>
                    <img src={activity} alt="" />
                    <h2>Performance</h2>
                </div>

                <div className={styles.barSectionInfoContent}>
                    <div className={styles.barSectionInfoLeftSection}>
                        <div className={styles.eye}>
                            <p>
                                CPM:{" "}
                                <span>
                                    {isCpmHidden ? "••••" : Number(campaign?.cpm ?? 0).toFixed(2)}
                                </span>
                            </p>

                            <EyeHide
                                isHidden={isCpmHidden}
                                onToggle={() =>
                                    setIsCpmAndResultHidden(!isCpmHidden)
                                }
                            />
                        </div>

                        <p>
                            Average Instagram CPM: <span>5€ to 12€</span>
                        </p>

                        <p>
                            Result: <span>{resultCPM}</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};