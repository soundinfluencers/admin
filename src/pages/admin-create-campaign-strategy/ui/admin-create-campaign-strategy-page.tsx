import React from "react";
import { useNavigate } from "react-router-dom";

import styles from "./admin-create-campaign-strategy-page.module.scss";

import { PageBreadcrumbs } from "@/widgets/page-breadcrumbs";
import { Modal } from "@/shared/ui/modal/modal";

import { useCampaignBuilderStore } from "@/entities/admin-create-campaign/campaign-builder/model/campaign-builder.store";
import { groupAdminCreateCampaignData } from "@/widgets/admin-create-campaign-strategy/model/group-admin-create-campaign-data";

import { ViewAudience } from "@/widgets/campaign-management/campaign-management-controls/ui/view-audience/view-audience";
import { ViewChange } from "@/widgets/campaign-management/campaign-management-controls/ui/view-change/view-change";

import { LiveViewCard } from "@/widgets/campaign-management/campaign-management-table/ui/campaign-management-live-card/ui/live-view-card";
import {
    buildCampaignBarData,
} from "@/widgets/admin-create-campaign-strategy/admin-create-campaign-strategy-bars/model/campaign-strategy-bar.helpers";
import { Bar } from "@/widgets/admin-create-campaign-strategy/admin-create-campaign-strategy-bars/ui/bar";
import {
    CampaignStrategySection,
} from "@/widgets/admin-create-campaign-strategy/admin-create-campaign-strategy-table/ui/campaign-strategy-section";
import {
    Checkbox,
} from "@/widgets/admin-create-campaign-strategy/admin-create-campaign-strategy-table/ui/check-box-row/ui/checkbox";
import {useCreateAdminCampaign} from "@/pages/admin-create-campaign-strategy/model/use-create-admin-campaign.ts";
import {useProposalLink} from "@/pages/admin-create-campaign-strategy/model/proposal-share-link.ts";



export const AdminCreateCampaignStrategyPage = () => {
    const navigate = useNavigate();

    const campaignName = useCampaignBuilderStore((s) => s.campaignName);
    const accounts = useCampaignBuilderStore((s) => s.selectedAccounts);
    const content = useCampaignBuilderStore((s) => s.campaignContent);
    const totalPrice = useCampaignBuilderStore((s) => s.totalPrice);
    const reset = useCampaignBuilderStore((s) => s.actions.reset);

    const setAccountDateRequest = useCampaignBuilderStore(
        (s) => s.actions.setAccountDateRequest,
    );

    const setSelectedCampaignContentItemRaw = useCampaignBuilderStore(
        (s) => s.actions.setSelectedCampaignContentItem,
    );

    const setSelectedCampaignContentItem = React.useCallback(
        (
            accountId: string,
            selected: { campaignContentItemId: string; descriptionId: string } | null,
        ) => {
            if (!selected) return;
            setSelectedCampaignContentItemRaw(accountId, selected);
        },
        [setSelectedCampaignContentItemRaw],
    );

    const [checked, setChecked] = React.useState(true);
    const [view, setView] = React.useState<-1 | 0 | 1>(-1);
    const [insights, setInsights] = React.useState(false);

    const grouped = React.useMemo(
        () =>
            groupAdminCreateCampaignData({
                accounts,
                items: content,
            }),
        [accounts, content],
    );

    const actions = React.useMemo(
        () => ({
            setAccountDateRequest,
            setAccountSelectedContent: setSelectedCampaignContentItem,
        }),
        [setAccountDateRequest, setSelectedCampaignContentItem],
    );

    const barData = React.useMemo(
        () =>
            buildCampaignBarData({
                totalPrice,
                accounts,
                content,
                submittedAt: new Date(),
            }),
        [totalPrice, accounts, content],
    );

    const {
        isCreating,
        isCreateModalOpen,
        setCreateModalOpen,
        createdCampaignId,
        createCampaign,
    } = useCreateAdminCampaign({
        campaignName,
        totalPrice,
        accounts,
        content,
    });
    const { proposalUrl, copyProposalLink } = useProposalLink(createdCampaignId);
    const openCreatedCampaign = React.useCallback(() => {
        if (!createdCampaignId) return;

        reset();

        navigate(
            `/dashboard/campaigns/campaign-management?id=${createdCampaignId}&status=proposal&optionIndex=0&mode=strategy`,
        );
    }, [createdCampaignId, navigate, reset]);

    return (
        <div className={styles.container}>
            <div className={styles.navMenu}>
                <PageBreadcrumbs
                    items={[
                        { label: "Dashboard", to: "/dashboard" },
                        { label: "Create campaign", to: "/dashboard/create-new-campaign" },
                        { label: "Content", to: "/dashboard/create-new-campaign/content" },
                        { label: "Strategy"}
                    ]}
                />
            </div>

            <div className={styles.page}>
                <div className={styles.header}>
                    <h1>{campaignName || "Campaign strategy"}</h1>

                    <Bar
                        submittedLabel={barData.submittedLabel}
                        budgetLabel={barData.budgetLabel}
                        reachLabel={barData.reachLabel}
                        postsLabel={barData.postsLabel}
                        videosLabel={barData.videosLabel}
                    />

                    <div className={styles.controls}>
                        <div className={styles.controlsContent}>
                            {view !== 1 && (
                                <ViewAudience
                                    flag={insights}
                                    onChange={() => setInsights((prev) => !prev)}
                                />
                            )}
                        </div>

                        <ViewChange
                            view={view}
                            setView={setView}
                            isProposal={false}
                        />
                    </div>
                </div>

                {view === -1 ? (
                    <div className={styles.pageContent}>
                        {!!grouped.mainCreator.accounts.length && (
                            <CampaignStrategySection
                                title={grouped.mainCreator.title}
                                group="main"
                                mode="readonlyDate"
                                accounts={grouped.mainCreator.accounts}
                                items={grouped.mainCreator.items}
                                totalPrice={totalPrice}
                                actions={actions}
                                insights={insights}
                            />
                        )}

                        {!!grouped.mainCommunity.accounts.length && (
                            <CampaignStrategySection
                                title={grouped.mainCommunity.title}
                                group="main"
                                mode="readonlyDate"
                                accounts={grouped.mainCommunity.accounts}
                                items={grouped.mainCommunity.items}
                                totalPrice={totalPrice}
                                actions={actions}
                                insights={insights}
                            />
                        )}

                        {!!grouped.mainOther.accounts.length && (
                            <CampaignStrategySection
                                title={grouped.mainOther.title}
                                group="main"
                                mode="readonlyDate"
                                accounts={grouped.mainOther.accounts}
                                items={grouped.mainOther.items}
                                totalPrice={totalPrice}
                                actions={actions}
                                insights={insights}
                            />
                        )}

                        {!!grouped.music.accounts.length && (
                            <CampaignStrategySection
                                title={grouped.music.title}
                                group="music"
                                mode="readonlyDate"
                                accounts={grouped.music.accounts}
                                items={grouped.music.items}
                                totalPrice={totalPrice}
                                actions={actions}
                                insights={insights}
                            />
                        )}

                        {!!grouped.press.accounts.length && (
                            <CampaignStrategySection
                                title={grouped.press.title}
                                group="press"
                                mode="readonlyDate"
                                accounts={grouped.press.accounts}
                                items={grouped.press.items}
                                totalPrice={totalPrice}
                                actions={actions}
                                insights={insights}
                            />
                        )}
                    </div>
                ) : (
                    <div className={styles.pageContentCards}>
                        {!!grouped.mainCreator.items.length &&
                            grouped.mainCreator.items.map((item) => (
                                <LiveViewCard
                                    key={item._id}
                                    item={item}
                                    networks={grouped.mainCreator.accounts}
                                    canEdit={false}
                                />
                            ))}

                        {!!grouped.mainCommunity.items.length &&
                            grouped.mainCommunity.items.map((item) => (
                                <LiveViewCard
                                    key={item._id}
                                    item={item}
                                    networks={grouped.mainCommunity.accounts}
                                    canEdit={false}
                                />
                            ))}

                        {!!grouped.mainOther.items.length &&
                            grouped.mainOther.items.map((item) => (
                                <LiveViewCard
                                    key={item._id}
                                    item={item}
                                    networks={grouped.mainOther.accounts}
                                    canEdit={false}
                                />
                            ))}

                        {!!grouped.music.items.length &&
                            grouped.music.items.map((item) => (
                                <LiveViewCard
                                    key={item._id}
                                    item={item}
                                    networks={grouped.music.accounts}
                                    canEdit={false}
                                />
                            ))}

                        {!!grouped.press.items.length &&
                            grouped.press.items.map((item) => (
                                <LiveViewCard
                                    key={item._id}
                                    item={item}
                                    networks={grouped.press.accounts}
                                    canEdit={false}
                                />
                            ))}
                    </div>
                )}

                <div className={styles.footerActions}>
                    <Checkbox
                        name="Allow automatic influencer replacement if a creator opts out."
                        isChecked={checked}
                        onChange={setChecked}
                    />

                    <button
                        className={styles.proceedButton}
                        type="button"
                        onClick={createCampaign}
                        disabled={isCreating}
                    >
                        {isCreating ? "Creating..." : "Proceed"}
                    </button>
                </div>
            </div>

            {isCreateModalOpen && (
                <Modal
                    onClose={() => {
                        setCreateModalOpen(false);
                        reset();
                        navigate("/dashboard");
                    }}
                >
                    <div className={styles.proposalModal}>
                        <h2>Campaign created</h2>

                        <input
                            type="text"
                            value={proposalUrl}
                            readOnly
                            placeholder="Proposal link"

                        />

                        <div className={styles.proposalModalButtons}>
                            <button
                                type="button"
                                className={styles.proceedButtonCopy}
                                onClick={() => {
                                    copyProposalLink();
                                }}
                            >
                                Copy link
                            </button>

                            <button
                                type="button"
                                className={styles.proceedButtonProposal}
                                onClick={openCreatedCampaign}
                            >
                                Open campaign
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};