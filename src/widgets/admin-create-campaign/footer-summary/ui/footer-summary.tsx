import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./footer-summary.module.scss";

import plus from "@/assets/icons/plus.svg";

import { useCampaignManagementStore } from "@/entities/campaign-managment/store/campaign-management.store";
import { useCampaignBuilderStore } from "@/entities/admin-create-campaign/campaign-builder/model/campaign-builder.store";
import {
    ensureContentForAccounts,
    mapCardToEditableAccount,
} from "@/entities/campaign-managment-add-accounts/model/add-accounts.helpers";
import {
    useCampaignManagementAddAccountsStore,
} from "@/entities/campaign-managment-add-accounts/store/campaign-management-add-accounts.store.ts";

const getCardPrice = (card: any) => Number(card?.prices?.EUR ?? 0);

export const FooterSummary: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const campaignId = searchParams.get("id") ?? "";
    const status = searchParams.get("status") ?? "";
    const optionIndex = Number(searchParams.get("optionIndex") ?? "0");
    const isAttachMode = Boolean(campaignId);


    const selectedCards = useCampaignManagementAddAccountsStore((s) => s.selectedCards);
    const clearSelectedCards = useCampaignManagementAddAccountsStore((s) => s.clearSelectedCards);
    const selectedCurrency = useCampaignBuilderStore((s) => s.selectedCurrency);
    const editable = useCampaignManagementStore((s) => s.editable);
    const addAccounts = useCampaignManagementStore((s) => s.addAccounts);
    const addContentItem = useCampaignManagementStore((s) => s.addContentItem);
    const setAccountSelectedContent = useCampaignManagementStore(
        (s) => s.setAccountSelectedContent,
    );


    const selectedPromoCardIds = useCampaignBuilderStore((s) => s.selectedPromoCardIds);
    const selectedAccounts = useCampaignBuilderStore((s) => s.selectedAccounts);
    // const totalPrice = useCampaignBuilderStore((s) => s.totalPrice);
    const setTotalPrice = useCampaignBuilderStore((s) => s.actions.setTotalPrice);

    const attachTotalPrice = React.useMemo(() => {
        return selectedCards.reduce((sum, card) => sum + getCardPrice(card), 0);
    }, [selectedCards]);

    const createTotalPrice = React.useMemo(() => {
        return selectedAccounts.reduce((sum, account) => {
            return sum + Number(account.price ?? 0);
        }, 0);
    }, [selectedAccounts]);

    const networksCount = isAttachMode
        ? selectedCards.length
        : selectedPromoCardIds.length;

    const summaryTotalPrice = isAttachMode
        ? attachTotalPrice
        : createTotalPrice;

    const canProceed = networksCount > 0;

    const onAttachProceed = React.useCallback(() => {
        if (selectedCards.length === 0) return;
        if (!editable) return;

        const mappedAccounts = selectedCards.map(mapCardToEditableAccount);

        const ensured = ensureContentForAccounts({
            accounts: mappedAccounts,
            campaignContent: editable.campaignContent,
            addContentItem,
        });

        const accountsWithSelected = mappedAccounts.map((account) => {
            const ensuredItem = ensured.get(String(account.socialMedia).toLowerCase());

            return {
                ...account,
                selectedCampaignContentItem: ensuredItem
                    ? {
                        campaignContentItemId: ensuredItem.contentId,
                        descriptionId: ensuredItem.firstDescriptionId,
                    }
                    : null,
            };
        });

        addAccounts(accountsWithSelected);

        accountsWithSelected.forEach((account) => {
            const key = String(account.addedAccountsId ?? account.socialAccountId);
            if (!key || !account.selectedCampaignContentItem) return;

            setAccountSelectedContent(key, account.selectedCampaignContentItem);
        });

        clearSelectedCards();

        navigate(
            `/dashboard/campaigns/campaign-management?id=${campaignId}&status=${status}&optionIndex=${optionIndex}`,
        );
    }, [
        selectedCards,
        editable,
        addContentItem,
        addAccounts,
        setAccountSelectedContent,
        clearSelectedCards,
        navigate,
        campaignId,
        status,
        optionIndex,
    ]);

    const onCreateProceed = React.useCallback(() => {
        if (!selectedPromoCardIds.length) return;

        setTotalPrice(createTotalPrice);
        navigate("/dashboard/create-new-campaign/content");
    }, [selectedPromoCardIds.length, setTotalPrice, createTotalPrice, navigate]);

    return (
        <div className={styles.root}>
            <div className={styles.content}>
                <p>
                    Networks: <span className={styles.count}>{networksCount}</span>
                </p>

                <img src={plus} alt="" />

                <p>
                    Total: <span className={styles.count}>{summaryTotalPrice}{selectedCurrency}</span>
                </p>
            </div>

            <button
                className={canProceed ? styles.active : styles.disabled}
                disabled={!canProceed}
                onClick={isAttachMode ? onAttachProceed : onCreateProceed}
            >
                {isAttachMode ? "Add accounts" : "Proceed"}
            </button>
        </div>
    );
};