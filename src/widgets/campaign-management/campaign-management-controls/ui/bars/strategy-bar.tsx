import { useEffect, useState } from "react";

import styles from "./bar.module.scss";
import type { EditableCampaign } from "@/entities/campaign-managment/store/campaign-management.store.ts";
import {
    formatCampaignDate,
    formatFollowers,
} from "@/entities/campaign-managment/model/campaign-management.helpers.ts";
import { getCampaignBudget } from "@/entities/campaign-managment/model/campaign-budget.helpers.ts";
import { useCampaignManagementStore } from "@/entities/campaign-managment/store/campaign-management.store.ts";
import {getCurrencySymbol} from "@/entities/campaign-managment-add-accounts/model/add-accounts.types.ts";

type Props = {
    campaign: EditableCampaign | null;
    isLockedStatus: boolean;
    status: string;
};

export const StrategyBar = ({ campaign, isLockedStatus, status }: Props) => {
    const setCampaignPrice = useCampaignManagementStore((s) => s.setCampaignPrice);


    const budget = getCampaignBudget(campaign);

    const [budgetInput, setBudgetInput] = useState(
        budget > 0 ? String(budget) : "",
    );

    useEffect(() => {
        setBudgetInput(budget > 0 ? String(budget) : "");
    }, [budget]);

    const reach = campaign?.totalFollowers ?? 0;
    const posts = campaign?.addedAccounts?.length ?? 0;
    const videos = campaign?.campaignContent?.length ?? 0;

    // const handleBudgetChange = (value: string) => {
    //     const normalized = value.replace(",", ".");
    //
    //     if (normalized === "") {
    //         setBudgetInput("");
    //         setCampaignPrice(0);
    //         return;
    //     }
    //
    //     if (!/^\d*\.?\d*$/.test(normalized)) {
    //         return;
    //     }
    //
    //     const cleaned = normalized.replace(/^0+(?=\d)/, "");
    //
    //     setBudgetInput(cleaned);
    //
    //     const next = Number(cleaned);
    //     setCampaignPrice(Number.isNaN(next) ? 0 : next);
    // };
    //
    // const inputWidth = `${Math.max(budgetInput.length || 1, 2)}ch`;

    return (
        <div className={styles.barStrategy}>
            {!isLockedStatus && (
                <div className={styles.barStrategy__button}>
                    <p>{`Status: ${status}`}</p>
                    <div className={styles.row} />
                </div>
            )}

            <div className={styles.barStrategy__button}>
                <p>{`Submitted: ${formatCampaignDate(campaign?.creationDate)}`}</p>
                <div className={styles.row} />
            </div>

            <div className={styles.barStrategy__button}>
                <div className={styles.barEditable}>
                    <span>Budget:{budgetInput}</span>
                    {/*<input*/}
                    {/*    type="text"*/}
                    {/*    inputMode="decimal"*/}
                    {/*    value={budgetInput}*/}
                    {/*    style={{ width: inputWidth }}*/}
                    {/*    placeholder="0"*/}
                    {/*    onChange={(e) => handleBudgetChange(e.target.value)}*/}
                    {/*/>*/}
                    <span>{getCurrencySymbol(campaign?.displayCurrency)}</span>
                </div>
                <div className={styles.row} />
            </div>

            <div className={styles.barStrategy__button}>
                <p>{`Reach: ${formatFollowers(reach)} followers`}</p>
                <div className={styles.row} />
            </div>

            <div className={styles.barStrategy__button}>
                <p>{`Posts: ${posts}`}</p>
                <div className={styles.row} />
            </div>

            <div className={styles.barStrategy__button}>
                <p>{`Video: ${videos}`}</p>
            </div>
        </div>
    );
};