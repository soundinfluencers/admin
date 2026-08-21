import React from "react";
import img from "../../assets/menu.svg";
import close from "../../assets/x.svg";
import styles from "./menu.module.scss";
import pdf from "../../assets/iwwa_file-pdf.svg";
import whatsApp from "../../assets/logos_whatsapp-icon (1).svg";
import check from "../../assets/check-circle.svg";
import reopen from "../../assets/refresh-ccw.svg";
import { toast } from "react-toastify";

import {
    closeCampaign,
    reopenCampaign,
} from "@/entities/campaign-managment/api/campaign-controls.api.ts";
import { getPDF } from "@/entities/campaign-managment/model/campaign-management.helpers.ts";
import type { CampaignStatus } from "@/entities/campaign-managment/model/campaign.managment.ts";
import { useRealtime } from "@/app/providers/realtime-provider/use-realtime.ts";
import { useCampaignManagementStore } from "@/entities/campaign-managment/store/campaign-management.store.ts";
import {
    buildWhatsAppInfluencerPromoData,
    buildWhatsAppInfluencerPromoMessage,
    groupAccountsByInfluencer,
} from "@/widgets/campaign-management/campaign-management-table/model/whats-app.helpers.ts";
import { sendCampaignWhatsAppOne } from "@/entities/campaign-managment/api/campaign-whatsapp.api.ts";
import { CircleLoader } from "@/shared/ui/circle-loader/circle-loader.tsx";

import { Table } from "@/shared/ui/table/table";

import type {
    WhatsAppSendRow,
    WhatsAppSendStatus,
} from "@/widgets/campaign-management/campaign-management-controls/ui/menu/model/menu.types.ts";
import {
    buildInitialWhatsAppRows,
} from "@/widgets/campaign-management/campaign-management-controls/ui/menu/model/whats-app-table.helpers.ts";
import {
    whatsAppColumns,
} from "@/widgets/campaign-management/campaign-management-controls/ui/menu/ui/contact-cells.tsx";

const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

const formatSendDate = (value: string | Date = new Date()) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });
};

export const Menu = ({
                         status,
                         campaignId,
                         onSuccess,
                     }: {
    status: string;
    campaignId: string | null;
    onSuccess?: (nextStatus: CampaignStatus) => void | Promise<void>;
}) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [isPdfLoading, setIsPdfLoading] = React.useState(false);
    const [isActionLoading, setIsActionLoading] = React.useState(false);
    const [isWhatsAppSending, setIsWhatsAppSending] = React.useState(false);
    const [whatsAppRows, setWhatsAppRows] = React.useState<WhatsAppSendRow[]>([]);

    const previousCampaignIdRef = React.useRef<string | null>(null);

    const editable = useCampaignManagementStore((s) => s.editable);
    const { clientId, isConnected, lastWhatsappStatus } = useRealtime();

    const normalizedStatus = String(status ?? "").toLowerCase();

    const canSendWhatsApp =
        normalizedStatus !== "proposal" &&
        normalizedStatus !== "completed";

    const isLoading = isPdfLoading || isActionLoading || isWhatsAppSending;

    /**
     * Сбрасываем таблицу только когда реально зашли в другую campaign.
     * При закрытии/открытии drawer ничего не сбрасывается.
     */
    React.useEffect(() => {
        if (!campaignId) return;

        if (previousCampaignIdRef.current === null) {
            previousCampaignIdRef.current = campaignId;
            setWhatsAppRows([]);
            return;
        }

        if (previousCampaignIdRef.current !== campaignId) {
            previousCampaignIdRef.current = campaignId;
            setWhatsAppRows([]);
        }
    }, [campaignId]);

    /**
     * При открытии меню создаём пустую таблицу только если rows ещё нет.
     * Поэтому после отправки SENT/FAILED сохраняются при закрытии.
     */
    React.useEffect(() => {
        if (!isOpen) return;
        if (whatsAppRows.length > 0) return;

        setWhatsAppRows(
            buildInitialWhatsAppRows({
                accounts: editable?.addedAccounts ?? [],
            }),
        );
    }, [isOpen, editable?.addedAccounts, whatsAppRows.length]);

    React.useEffect(() => {
        if (!isOpen) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !isLoading) {
                setIsOpen(false);
            }
        };

        document.addEventListener("keydown", onKeyDown);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = "";
        };
    }, [isOpen, isLoading]);

    const updateRowStatus = React.useCallback(
        (
            targetInfluencerId: string,
            nextStatus: WhatsAppSendStatus,
            fallbackRows: WhatsAppSendRow[] = [],
            date?: string,
        ) => {
            if (!targetInfluencerId) return;

            setWhatsAppRows((prev) => {
                const sourceRows = prev.length ? prev : fallbackRows;

                return sourceRows.map((row) =>
                    row.influencerId === targetInfluencerId
                        ? {
                            ...row,
                            status: nextStatus,
                            date: date ?? formatSendDate(),
                        }
                        : row,
                );
            });
        },
        [],
    );

    React.useEffect(() => {
        if (!lastWhatsappStatus) return;
        if (lastWhatsappStatus.campaignId !== campaignId) return;

        const nextStatus: WhatsAppSendStatus =
            lastWhatsappStatus.status === "sending"
                ? "SENDING"
                : lastWhatsappStatus.status === "sent"
                    ? "SENT"
                    : "FAILED";
        const fallbackRows = buildInitialWhatsAppRows({
            accounts: editable?.addedAccounts ?? [],
        });

        updateRowStatus(
            lastWhatsappStatus.influencerId,
            nextStatus,
            fallbackRows,
            formatSendDate(lastWhatsappStatus.date),
        );
    }, [campaignId, editable?.addedAccounts, lastWhatsappStatus, updateRowStatus]);

    const handleDownloadPdf = async () => {
        if (!campaignId || isLoading) return;

        try {
            setIsPdfLoading(true);
            await getPDF(campaignId);
        } catch (error) {
            console.error("Failed to download PDF", error);
            toast.error("Failed to download PDF");
        } finally {
            setIsPdfLoading(false);
        }
    };

    const handleCloseCampaign = async () => {
        if (!campaignId || isLoading) return;

        try {
            setIsActionLoading(true);

            await closeCampaign(campaignId);
            await onSuccess?.("completed");

            toast.success("Campaign closed successfully");
            setIsOpen(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to close campaign");
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleReopenCampaign = async () => {
        if (!campaignId || isLoading) return;

        try {
            setIsActionLoading(true);

            await reopenCampaign(campaignId);
            await onSuccess?.("distributing");

            toast.success("Campaign reopened successfully");
            setIsOpen(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to reopen campaign");
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleSendAllWhatsApp = async () => {
        if (isLoading) return;

        if (!campaignId) {
            toast.error("Campaign is not selected");
            return;
        }

        if (!canSendWhatsApp) {
            toast.error("WhatsApp is available only for distributing campaigns");
            return;
        }

        if (!editable) {
            toast.error("Campaign data is not ready");
            return;
        }

        if (!clientId || !isConnected) {
            toast.error("Socket client is not ready");
            return;
        }

        const accounts = editable.addedAccounts ?? [];
        const campaignContent = editable.campaignContent ?? [];

        if (!accounts.length) {
            toast.error("No influencers to send");
            return;
        }

        const initialRows = buildInitialWhatsAppRows({ accounts });
        setWhatsAppRows(initialRows);

        const accountsByInfluencer = groupAccountsByInfluencer(accounts);
        const influencerGroups = Object.values(accountsByInfluencer);

        try {
            setIsWhatsAppSending(true);

            let successCount = 0;
            let failedCount = 0;

            for (const influencerAccounts of influencerGroups) {
                const firstAccount = influencerAccounts[0];

                const influencerId = String(firstAccount?.influencerId ?? "");
                const accountId = String(
                    firstAccount?.socialAccountId ??
                    firstAccount?.accountId ??
                    "",
                );
                const socialMedia = String(firstAccount?.socialMedia ?? "");

                if (!influencerId || !accountId || !socialMedia) {
                    failedCount += 1;

                    updateRowStatus(influencerId, "FAILED", initialRows);

                    console.warn(
                        "Skipped WhatsApp influencer because required ids are missing",
                        influencerAccounts,
                    );

                    continue;
                }

                updateRowStatus(influencerId, "SENDING", initialRows);

                try {
                    const data = buildWhatsAppInfluencerPromoData({
                        accounts: influencerAccounts,
                        campaignContent,
                    });

                    const message = buildWhatsAppInfluencerPromoMessage(data);

                    await sendCampaignWhatsAppOne({
                        campaignId,
                        influencerId,
                        accountId,
                        socialMedia,
                        message,
                        clientId,
                    });

                    successCount += 1;
                    updateRowStatus(influencerId, "SENT", initialRows);
                } catch (error) {
                    failedCount += 1;
                    updateRowStatus(influencerId, "FAILED", initialRows);

                    console.error(
                        "Failed to send WhatsApp to influencer",
                        influencerAccounts,
                        error,
                    );
                }

                await sleep(400);
            }

            if (successCount > 0 && failedCount === 0) {
                toast.success(`WhatsApp messages sent to ${successCount} influencers`);
                return;
            }

            if (successCount > 0 && failedCount > 0) {
                toast.warning(
                    `WhatsApp partially sent: ${successCount} sent, ${failedCount} failed`,
                );
                return;
            }

            toast.error("Failed to send WhatsApp messages");
        } catch (error) {
            console.error(error);
            toast.error("Failed to send WhatsApp messages");
        } finally {
            setIsWhatsAppSending(false);
        }
    };

    const handleCloseDrawer = () => {
        if (isLoading) return;
        setIsOpen(false);
    };

    return (
        <>
            <button
                type="button"
                className={styles.menu}
                onClick={() => setIsOpen(true)}
            >
                <img src={img} alt="" />
                Menu
            </button>

            <div
                className={`${styles.drawerRoot} ${isOpen ? styles.open : ""}`}
                aria-hidden={!isOpen}
            >
                <div className={styles.overlay} onClick={handleCloseDrawer} />

                <aside className={styles.drawer}>
                    <div className={styles.drawerHeader}>
                        <h2 className={styles.title}>Menu</h2>

                        <button
                            type="button"
                            className={styles.closeButton}
                            onClick={handleCloseDrawer}
                            aria-label="Close menu"
                            disabled={isLoading}
                        >
                            <img src={close} alt="" />
                        </button>
                    </div>

                    <div className={styles.drawerBody}>
                        <div className={styles.drawerBody__content}>
                            <div className={styles.drawerBody__block}>
                                <button
                                    type="button"
                                    className={styles.drawerBodyButton}
                                    onClick={handleDownloadPdf}
                                    disabled={isLoading || !campaignId}
                                >
                                    {isPdfLoading ? (
                                        <CircleLoader />
                                    ) : (
                                        <img src={pdf} alt="" />
                                    )}

                                    <p>{isPdfLoading ? "Loading..." : "PDF file"}</p>
                                </button>

                                {normalizedStatus === "completed" ? (
                                    <button
                                        type="button"
                                        className={styles.drawerBodyButton}
                                        onClick={handleReopenCampaign}
                                        disabled={isLoading}
                                    >
                                        {isActionLoading ? (
                                            <CircleLoader />
                                        ) : (
                                            <img src={reopen} alt="" />
                                        )}

                                        <p>
                                            {isActionLoading
                                                ? "Loading..."
                                                : "Reopen Campaign"}
                                        </p>
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        className={styles.drawerBodyButton}
                                        onClick={handleCloseCampaign}
                                        disabled={isLoading}
                                    >
                                        {isActionLoading ? (
                                            <CircleLoader />
                                        ) : (
                                            <img src={check} alt="" />
                                        )}

                                        <p>
                                            {isActionLoading
                                                ? "Loading..."
                                                : "Close Campaign"}
                                        </p>
                                    </button>
                                )}
                            </div>

                            {canSendWhatsApp && (
                                <div className={styles.drawerBody__block}>
                                    <button
                                        type="button"
                                        className={styles.drawerBodyButton}
                                        onClick={handleSendAllWhatsApp}
                                        disabled={
                                            isLoading ||
                                            !isConnected ||
                                            !clientId ||
                                            !editable?.addedAccounts?.length
                                        }
                                    >
                                        {isWhatsAppSending ? (
                                            <CircleLoader />
                                        ) : (
                                            <img src={whatsApp} alt="" />
                                        )}

                                        <p>
                                            {isWhatsAppSending
                                                ? "Sending..."
                                                : "Send all"}
                                        </p>
                                    </button>
                                </div>
                            )}

                            {canSendWhatsApp && (
                                <div className={styles.whatsAppTable}>
                                    <Table
                                        data={whatsAppRows}
                                        columns={whatsAppColumns}
                                        minWidth={529}
                                        tableLayout="fixed"
                                        emptyText="No WhatsApp messages"
                                        skeletonRows={4}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </aside>
            </div>
        </>
    );
};
