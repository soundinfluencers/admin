import {useEffect, useState, useCallback, useMemo} from "react";
import { useSearchParams } from "react-router-dom";

import styles from "./campaign-managment.module.scss";

import { getCampaignByStatus } from "@/entities/campaign-managment/api/fetch-status-campaign.ts";
import { updateCampaignByStatus } from "@/entities/campaign-managment/api/update-campaign.ts";
import type { CampaignStatus } from "@/entities/campaign-managment/model/campaign.managment.ts";
import type { ViewMode } from "@/entities/campaign-managment/model/campaign-management-table.types";

import { CampaignManagementBar } from "@/widgets/campaign-management/campaign-management-controls/ui/campaign-management-bar.tsx";

import { useCampaignManagementStore } from "@/entities/campaign-managment/store/campaign-management.store.ts";
import { groupCampaignData } from "@/widgets/campaign-management/campaign-management-table/model/group-campaign-data.ts";
import { PageBreadcrumbs } from "@/widgets/page-breadcrumbs";
import { toast } from "react-toastify";

import { getCampaignKindByStatus } from "@/entities/campaign-managment/model/campaign-management.helpers.ts";
import {
    CampaignManagementTable
} from "@/widgets/campaign-management/campaign-management-table/ui/campaign-management-table.tsx";
import {
    LiveViewCard
} from "@/widgets/campaign-management/campaign-management-table/ui/campaign-management-live-card/ui/live-view-card.tsx";
import {
    CampaignManagementInsightTable
} from "@/widgets/campaign-management/campaign-management-table/ui/campaign-management-insight-table.tsx";
import {
    LiveViewCardInsight
} from "@/widgets/campaign-management/campaign-management-table/ui/campaign-management-live-card/ui/live-view-card-insight.tsx";
import {
    UpdateInsight
} from "@/widgets/campaign-management/campaign-management-controls/ui/update-insights/ui/update-insight.tsx";
import {Menu} from "@/widgets/campaign-management/campaign-management-controls/ui/menu/ui/menu.tsx";
import {SaveReset} from "@/widgets/campaign-management/campaign-management-controls/ui/save-reset/save-reset.tsx";
import {
    InternalCost
} from "@/widgets/campaign-management/campaign-management-controls/ui/internal-cost/ui/internal-cost.tsx";
import {Modal} from "@/shared/ui/modal/modal.tsx";
import {addAdminProposalOption} from "@/entities/campaign-managment/api/add-option.ts";
import {getCampaignBudget} from "@/entities/campaign-managment/model/campaign-budget.helpers.ts";
import {getDefaultModeByStatus, type PageMode} from "@/pages/campaign-managment/model/get-default-mode.ts";


export const CampaignManagment = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const campaignId = searchParams.get("id");
    const statusParam = searchParams.get("status") as CampaignStatus | null;
    const optionIndex = Number(searchParams.get("optionIndex") ?? "0");
    const modeKey = `${campaignId ?? ""}:${statusParam ?? ""}:${optionIndex}`;

    const [modeState, setModeState] = useState<{
        key: string;
        mode: PageMode;
    }>(() => ({
        key: modeKey,
        mode: getDefaultModeByStatus(statusParam),
    }));

    const pageMode =
        modeState.key === modeKey
            ? modeState.mode
            : getDefaultModeByStatus(statusParam);

    const insightMode = pageMode === "insight";


    const initCampaign = useCampaignManagementStore((s) => s.initCampaign);
    const view = useCampaignManagementStore((s) => s.view);
    const setView = useCampaignManagementStore((s) => s.setView);
    const changeView = useCampaignManagementStore((s) => s.changeView);
    const setChangeView = useCampaignManagementStore((s) => s.setChangeView);
    const editable = useCampaignManagementStore((s) => s.editable);
    const activeOptionIndex = useCampaignManagementStore((s) => s.activeOptionIndex);
    const isEditable = useCampaignManagementStore((s) => s.isEditable);
    const canManageAccounts = useCampaignManagementStore((s) => s.canManageAccounts);
    const buildSavePayload = useCampaignManagementStore((s) => s.buildSavePayload);
    const resetEditableToOriginal = useCampaignManagementStore((s) => s.resetEditableToOriginal);
    const campaignName = useCampaignManagementStore((s) => s.editable?.campaignName ?? "");
    const existingOptions = useCampaignManagementStore((s) => s.existingOptions);
    const status = useCampaignManagementStore((s) => s.status);
    const canEdit = useCampaignManagementStore((s) => s.canEdit);
    const resetCampaignState = useCampaignManagementStore((s) => s.resetCampaign);
    const [optionModal, setOptionModal] = useState(false);
    const resolvedStatus = status || statusParam;
    const kind = getCampaignKindByStatus(resolvedStatus);
    const [isCampaignLoading, setIsCampaignLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    console.log(editable,'editable')
    const isInitialLoading = isCampaignLoading || !editable || editable.campaignId !== campaignId || activeOptionIndex !== optionIndex;
    const handleOpenAddOptionModal = () => {
        setOptionModal(true);
    };

    const handleCloseAddOptionModal = () => {
        setOptionModal(false);
    };
    const loadCampaignByOption = useCallback(
        async (nextOptionIndex: number, nextStatus?: CampaignStatus) => {
            const resolvedStatus = nextStatus || statusParam;

            if (!campaignId || !resolvedStatus) return;

            try {
                setIsCampaignLoading(true);

                const response = await getCampaignByStatus({
                    status: resolvedStatus,
                    campaignId,
                    optionIndex: nextOptionIndex,
                });

                if (!response) return;

                initCampaign(response, nextOptionIndex);
            } catch (error) {
                console.error("Failed to load campaign", error);
            } finally {
                setIsCampaignLoading(false);
            }
        },
        [campaignId, statusParam, initCampaign],
    );
    const reloadCampaignFromScratch = useCallback(
        async (nextStatus: CampaignStatus) => {
            if (!campaignId) return;

            const nextParams = new URLSearchParams(searchParams);
            nextParams.set("status", nextStatus);
            setSearchParams(nextParams);

            resetCampaignState();
            await loadCampaignByOption(optionIndex, nextStatus);
        },
        [
            campaignId,
            searchParams,
            optionIndex,
            setSearchParams,
            resetCampaignState,
            loadCampaignByOption,
        ],
    );

    const handleOptionChange = (nextOptionIndex: number) => {
        if (nextOptionIndex === activeOptionIndex) return;

        const nextParams = new URLSearchParams(searchParams);
        nextParams.set("optionIndex", String(nextOptionIndex));
        setSearchParams(nextParams);
    };
    useEffect(() => {
        setModeState({
            key: modeKey,
            mode: getDefaultModeByStatus(statusParam),
        });
    }, [modeKey, statusParam]);
    useEffect(() => {
        if (!campaignId || !statusParam) return;

        const normalizedStatusParam = String(statusParam).toLowerCase();

        const hasSameCampaign = editable?.campaignId === campaignId;
        const hasSameOption = activeOptionIndex === optionIndex;
        const hasSameStatus = String(status || "").toLowerCase() === normalizedStatusParam;

        if (hasSameCampaign && hasSameOption && hasSameStatus) return;

        loadCampaignByOption(optionIndex, statusParam);
    }, [
        campaignId,
        statusParam,
        optionIndex,
        editable?.campaignId,
        activeOptionIndex,
        status,
        loadCampaignByOption,
    ]);

    const handleSave = async () => {
        if (!campaignId || !status) return;
        const requestStatus: CampaignStatus =
            status === "under_review" ? "pending" : (status as CampaignStatus);
        const body = buildSavePayload();
        if (!body) return;
        console.log(body,'payload');
        console.log("status", status);
        try {
            setIsSaving(true);

            const updated = await updateCampaignByStatus({
                status: requestStatus,
                campaignId,
                optionIndex,
                body,
            });

            if (updated) {
                initCampaign(updated, optionIndex);
            }

            toast.success("Campaign saved successfully");
        } catch (error) {
            console.error("Failed to update campaign", error);
        } finally {
            setIsSaving(false);
        }
    };
    const handleAddOption = async (inheritCurrentOption: boolean) => {
        if (!campaignId || !editable) return;

        const allOptions = Array.isArray(existingOptions) ? existingOptions : [0];
        const nextOptionIndex = allOptions.length ? Math.max(...allOptions) + 1 : 0;
        const currentBudget = getCampaignBudget(editable);
        const body = inheritCurrentOption
            ? {
                campaignName: editable.campaignName,
                socialMedia: editable.socialMedia,
                price: currentBudget,
                campaignPrice: currentBudget,
                addedAccounts: editable.addedAccounts.map((acc) => ({
                    socialAccountId: acc.socialAccountId,
                    influencerId: acc.influencerId,
                    socialMedia: acc.socialMedia,
                    username: acc.username,
                    selectedCampaignContentItem: acc.selectedCampaignContentItem
                        ? {
                            campaignContentItemId:
                            acc.selectedCampaignContentItem.campaignContentItemId,
                            descriptionId:
                            acc.selectedCampaignContentItem.descriptionId,
                        }
                        : null,
                    dateRequest: acc.dateRequest,
                })),
                campaignContent: editable.campaignContent.map((item) => ({
                    _id: item._id,
                    socialMedia: item.socialMedia,
                    socialMediaGroup: item.socialMediaGroup,
                    mainLink: item.mainLink,
                    descriptions: item.descriptions.map((desc) => ({
                        _id: desc._id,
                        description: desc.description,
                    })),
                    taggedUser: item.taggedUser,
                    taggedLink: item.taggedLink,
                    additionalBrief: item.additionalBrief,
                })),
            }
            : {
                campaignName: editable.campaignName,
                addedAccounts: [],
                campaignContent: [],
            };
        console.log("body", body);
        try {
            setIsSaving(true);
            setOptionModal(false);

            await addAdminProposalOption(campaignId, body);

            const nextParams = new URLSearchParams(searchParams);
            nextParams.set("optionIndex", String(nextOptionIndex));
            setSearchParams(nextParams);

            await loadCampaignByOption(nextOptionIndex);

            toast.success("Option added successfully");
        } catch (error) {
            console.error("Failed to add option", error);
        } finally {
            setIsSaving(false);
        }
    };
    const handleToggleMode = useCallback(() => {
        const normalizedStatus = String(statusParam ?? "").toLowerCase();

        if (normalizedStatus === "proposal") {
            setModeState({
                key: modeKey,
                mode: "strategy",
            });
            return;
        }

        setModeState((prev) => {
            const currentMode =
                prev.key === modeKey
                    ? prev.mode
                    : getDefaultModeByStatus(statusParam);

            return {
                key: modeKey,
                mode: currentMode === "insight" ? "strategy" : "insight",
            };
        });
    }, [modeKey, statusParam]);
    const items = editable?.campaignContent ?? [];
    const networks = editable?.addedAccounts ?? [];

    const grouped = groupCampaignData({
        networks,
        items,
    });
    const insightTotals = {
        followers: Number(editable?.totalFollowers ?? 0),
        impressions: Number(editable?.totalImpressions ?? 0),
        likes: Number(editable?.totalLikes ?? 0),
        comments: Number(editable?.totalComments ?? 0),
        saves: Number(editable?.totalSaves ?? 0),
        shares: Number(editable?.totalShares ?? 0),
    };

    const insightTotalPrice = useMemo(() => {
        return networks.reduce((sum, account) => {
            return sum + Number(account.publicPrice ?? 0);
        }, 0);
    }, [networks]);

    const isLockedStatus = status === "distributing" || status === "completed" || status === "distributing" || status === 'pending';
    const renderStrategyTables = () => (
        <>
            {grouped.main.networks.length > 0 && (
                <>
                    <h3>Video Distribution</h3>
                    <CampaignManagementTable
                        items={grouped.main.items}
                        networks={grouped.main.networks}
                        optionIndex={optionIndex}
                        group="main"
                        changeView={changeView}
                        canEdit={isEditable()}
                        canManageAccounts={canManageAccounts()}
                    />
                </>
            )}

            {grouped.music.networks.length > 0 && (
                <>
                    <h3>Music Placements</h3>
                    <CampaignManagementTable
                        items={grouped.music.items}
                        networks={grouped.music.networks}
                        optionIndex={optionIndex}
                        group="music"
                        changeView={changeView}
                        canEdit={isEditable()}
                        canManageAccounts={canManageAccounts()}
                    />
                </>
            )}

            {grouped.press.networks.length > 0 && (
                <>
                    <h3>Press Coverage</h3>
                    <CampaignManagementTable
                        items={grouped.press.items}
                        networks={grouped.press.networks}
                        optionIndex={optionIndex}
                        group="press"
                        changeView={changeView}
                        canEdit={isEditable()}
                        canManageAccounts={canManageAccounts()}
                    />
                </>
            )}
        </>
    );

    const renderStrategyCards = () => (
        <div className={`${styles.wrapperCard} ${styles.liveView}`}>
            {grouped.main.items.map((item) => (
                <LiveViewCard
                    key={item._id}
                    item={item}
                    networks={grouped.main.networks}
                    canEdit={isEditable()}

                />
            ))}

            {grouped.music.items.map((item) => (
                <LiveViewCard
                    key={item._id}
                    item={item}
                    networks={grouped.music.networks}
                    canEdit={isEditable()}
                />
            ))}

            {grouped.press.items.map((item) => (
                <LiveViewCard
                    key={item._id}
                    item={item}
                    networks={grouped.press.networks}
                    canEdit={isEditable()}
                />
            ))}
        </div>
    );

    const renderInsightTable = () => {
        const canContactInfluencer =
            String(status || statusParam || "").toLowerCase() === "distributing";

        return (
            <>
                <h3>Campaign Insights</h3>

                <CampaignManagementInsightTable
                    networks={networks}
                    totals={insightTotals}
                    canEdit={isEditable()}
                    canManageAccounts={canManageAccounts()}
                    canContactInfluencer={canContactInfluencer}
                    campaignId={campaignId ?? ""}
                    statusParam={status || statusParam}
                    optionIndex={optionIndex}
                    totalPrice={insightTotalPrice}
                    loadCampaignByOption={loadCampaignByOption}
                />
            </>
        );
    };
    const renderInsightCards = () => (
        <div className={`${styles.wrapperCard} ${styles.liveView}`}>
            {networks.map((account) => (
                <LiveViewCardInsight
                    key={account.addedAccountsId ?? account.socialAccountId ?? account.username}
                    item={account}                />
            ))}
        </div>
    );
    if (isInitialLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.containerNav}>
                    <PageBreadcrumbs
                        items={[
                            { label: "Dashboard", to: "/dashboard" },
                            { label: "Campaigns", to: "/dashboard/campaigns" },
                            { label: "Campaign Management" },
                        ]}
                    />
                </div>

                <div className={styles.loader}>
                    Loading campaign...
                </div>
            </div>
        );
    }
    return (
        <div className={styles.container}>
            <div className={styles.containerNav}>
                <PageBreadcrumbs
                    items={[
                        { label: "Dashboard", to: "/dashboard" },
                        { label: "Campaigns", to: "/dashboard/campaigns" },
                        { label: "Campaign Management" },
                    ]}
                />
                {
                    status !== 'proposal' &&
                    <div className={styles.containerNav__content}>
                        <UpdateInsight
                            campaignId={campaignId}
                            campaignName={campaignName}
                            onSuccess={() => loadCampaignByOption(optionIndex)}
                        />
                        <Menu campaignId={campaignId} status={status} onSuccess={reloadCampaignFromScratch}/>
                    </div>
                }
            </div>

            <div className={styles.containerBar}>
                <div className={styles.title}>
                    <div className={styles.title__block}>
                        {campaignName && <h2 className={styles.title}>{campaignName}</h2>}
                        {isLockedStatus &&  <p>status: {status}</p>}
                    </div>
                    {status !== "proposal" && (
                        <div className={status !== "completed" ? styles.title__flex : styles.title__flexWidth}>
                            <InternalCost internalCost={editable?.internalCost || 0} />

                            {status !== "completed" && (
                                <SaveReset
                                    onSave={handleSave}
                                    onReset={resetEditableToOriginal}
                                    isSaving={isSaving}
                                />
                            )}
                        </div>
                    )}
                </div>

                <CampaignManagementBar
                    status={status || statusParam}
                    view={view as ViewMode}
                    setView={setView}
                    changeView={changeView}
                    setChangeView={setChangeView}
                    canEdit={canEdit}
                    handleSave={handleSave}
                    resetCampaign={resetEditableToOriginal}
                    optionIndexes={existingOptions}
                    activeOption={optionIndex}
                    onChangeOption={handleOptionChange}
                    onAddOption={handleOpenAddOptionModal}
                    campaignId={campaignId ?? ""}
                    socialMedia={editable?.socialMedia}
                    kind={kind}
                    insightMode={insightMode}
                    setInsightMode={handleToggleMode}
                    campaign={editable}
                />
            </div>

            {view === 1
                ? insightMode
                    ? renderInsightCards()
                    : renderStrategyCards()
                : insightMode
                    ? renderInsightTable()
                    : renderStrategyTables()}
            {optionModal && (
                <Modal onClose={handleCloseAddOptionModal}>
                    <div className="create-option">
                        <h2>Proposal option</h2>
                        <p>
                            Do you want to include the current Pages & Content from Option{" "}
                            {optionIndex + 1}?
                        </p>
                        <div className="create-option-btn">
                            <button
                                type="button"
                                className='modal-secondary-btn'
                                onClick={() => handleAddOption(false)}
                            >
                                No
                            </button>

                            <button
                                type="button"
                                className='modal-primary-btn'
                                onClick={() => handleAddOption(true)}
                            >
                                Yes
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>

    );
};