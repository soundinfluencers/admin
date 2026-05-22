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
    buildWhatsAppPromoData,
    buildWhatsAppPromoMessage,
} from "@/widgets/campaign-management/campaign-management-table/model/whats-app.helpers.ts";
import { sendCampaignWhatsAppOne } from "@/entities/campaign-managment/api/campaign-whatsapp.api.ts";
import { CircleLoader } from "@/shared/ui/circle-loader/circle-loader.tsx";

const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

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

    const editable = useCampaignManagementStore((s) => s.editable);
    const { clientId, isConnected } = useRealtime();

    const normalizedStatus = String(status ?? "").toLowerCase();
    const canSendWhatsApp = normalizedStatus === "distributing";

    const isLoading = isPdfLoading || isActionLoading || isWhatsAppSending;

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

    const handleDownloadPdf = async () => {
        if (!campaignId || isLoading) return;

        try {
            setIsPdfLoading(true);
            await getPDF(campaignId);
        } catch (error) {
            console.error("Failed to download PDF", error);
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

        try {
            setIsWhatsAppSending(true);

            let successCount = 0;
            let failedCount = 0;

            for (const account of accounts) {
                const influencerId = String(account.influencerId ?? "");
                const accountId = String(
                    account.socialAccountId ??
                    (account as any).accountId ??
                    "",
                );
                const socialMedia = String(account.socialMedia ?? "");

                if (!influencerId || !accountId || !socialMedia) {
                    failedCount += 1;
                    console.warn(
                        "Skipped WhatsApp account because required ids are missing",
                        account,
                    );
                    continue;
                }

                try {
                    const data = buildWhatsAppPromoData({
                        account,
                        campaignContent,
                    });

                    const message = buildWhatsAppPromoMessage(data);

                    await sendCampaignWhatsAppOne({
                        influencerId,
                        accountId,
                        socialMedia,
                        message,
                        clientId,
                    });

                    successCount += 1;
                } catch (error) {
                    failedCount += 1;
                    console.error("Failed to send WhatsApp to account", account, error);
                }

                await sleep(400);
            }

            if (successCount > 0 && failedCount === 0) {
                toast.success(`WhatsApp messages sent to ${successCount} influencers`);
                setIsOpen(false);
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
                        </div>
                    </div>
                </aside>
            </div>
        </>
    );
};