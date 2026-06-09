

import React from "react";
import {
    buildCampaignManagementInsightRows,
} from "@/widgets/campaign-management/campaign-management-table/model/campaign-management-table.helpers.ts";
import {
    getCampaignManagementInsightColumns,
} from "@/widgets/campaign-management/campaign-management-table/ui/campaign-management-insight-columns.tsx";
import {
    TableCampaignInsight,
} from "@/widgets/campaign-management/campaign-management-table/ui/table-campaign-management/ui/tableInsight.tsx";
import {
    getAccountKey,
    useCampaignManagementStore,
} from "@/entities/campaign-managment/store/campaign-management.store";
import type {
    CampaignManagementInsightRow,
} from "@/widgets/campaign-management/campaign-management-table/model/campaign-management-table.types.ts";
import {Modal} from "@/shared/ui/modal/modal.tsx";
import {payPromoCampaign, sendPromoEmail} from "@/entities/campaign-managment/api/campaign-controls.api.ts";
import {toast} from "react-toastify";
import {uploadCampaignFile} from "@/entities/campaign-managment/api/upload-campaign-file.ts";
import {CircleLoader} from "@/shared/ui/circle-loader/circle-loader.tsx";
import {
    buildWhatsAppInfluencerPromoData, buildWhatsAppInfluencerPromoMessage,
} from "@/widgets/campaign-management/campaign-management-table/model/whats-app.helpers.ts";
import {sendCampaignWhatsAppOne} from "@/entities/campaign-managment/api/campaign-whatsapp.api.ts";
import type {CampaignStatus} from "@/entities/campaign-managment/model/campaign.managment.ts";
import {useRealtime} from "@/app/providers/realtime-provider/use-realtime.ts";

type WhatsAppPromoAccount = {
    influencerId?: string;
    socialAccountId?: string;
    accountId?: string;
    socialMedia?: string;
    username?: string;
    addedAccountsId?: string;
};
type Props = {
    networks: any[];
    totals: {
        followers: number;
        impressions: number;
        likes: number;
        comments: number;
        saves: number;
        shares: number;
    };
    canEdit: boolean;
    canManageAccounts: boolean;
    canContactInfluencer: boolean;
    campaignId: string;
    statusParam?: string | null;
    optionIndex: number;
    totalPrice?: number | null;
    loadCampaignByOption?: (
        nextOptionIndex: number,
        nextStatus?: CampaignStatus,
    ) => Promise<void>;
    currency: string;
};

export const CampaignManagementInsightTable = ({
                                                   networks,
                                                   totals,
                                                   canEdit,
                                                   canManageAccounts,
                                                   campaignId,
                                                   statusParam,
                                                   optionIndex,
                                                   totalPrice,
                                                   loadCampaignByOption,canContactInfluencer,currency
                                               }: Props) => {
    const { clientId,isConnected } = useRealtime();
    const realtimeClientId = clientId;
    const fileInputRef = React.useRef<HTMLInputElement | null>(null);
    const editable = useCampaignManagementStore((s) => s.editable);
    const [whatsAppModal, setWhatsAppModal] = React.useState<{
        isOpen: boolean;
        data: null | {
            influencerName: string;
            promos: Array<{
                influencerName: string;
                platform: string;
                page: string;
                content: string;
                description: string;
                storyTag: string;
                storyLink: string;
                specialRequest: string;
                reward: string;
            }>;
        };
        accounts: WhatsAppPromoAccount[];
        isSending: boolean;
    }>({
        isOpen: false,
        data: null,
        accounts: [],
        isSending: false,
    });
    const rows = React.useMemo(
        () => buildCampaignManagementInsightRows(networks),
        [networks],
    );
    const removeAccount = useCampaignManagementStore((s) => s.removeAccount);
    const [deleteModal, setDeleteModal] = React.useState<{
        isOpen: boolean;
        accountKey: string;
        username: string;
    }>({
        isOpen: false,
        accountKey: "",
        username: "",
    });

    const [linkModal, setLinkModal] = React.useState<{
        isOpen: boolean;
        accountKey: string;
        field: "postLink" | "screenshot" | null;
        value: string;
        title: string;
        previewUrl: string;
        isUploading: boolean;
    }>({
        isOpen: false,
        accountKey: "",
        field: null,
        value: "",
        title: "",
        previewUrl: "",
        isUploading: false,
    });
    // const whatsappFields = [
    //     { label: "Platform", value: whatsAppModal.data?.platform },
    //     { label: "Page", value: whatsAppModal.data?.page },
    //     { label: "Content", value: whatsAppModal.data?.content },
    //     { label: "Description", value: whatsAppModal.data?.description },
    //     { label: "Story Tag", value: whatsAppModal.data?.storyTag },
    //     { label: "Story Link", value: whatsAppModal.data?.storyLink },
    //     { label: "Special request", value: whatsAppModal.data?.specialRequest },
    //     { label: "Reward", value: whatsAppModal.data?.reward },
    // ];
    const setAccountInsightField = useCampaignManagementStore(
        (s) => s.setAccountInsightField,
    );
    const recentlyAddedAccountKeys = useCampaignManagementStore(
        (s) => s.recentlyAddedAccountKeys,
    );
    const [showCpm, setShowCpm] = React.useState(false);
    const handlePayPromo = React.useCallback(
        async (row: CampaignManagementInsightRow) => {
            const promoId = row.account.addedAccountsId;
            if (!campaignId || !promoId) return;

            try {
                await payPromoCampaign({
                    campaignId,
                    promoId,
                });

                await loadCampaignByOption?.(0);

                toast.success("Promo marked as paid");
            } catch (error) {
                console.error("Failed to pay promo", error);
                toast.error("Failed to mark promo as paid");
            }
        },
        [campaignId, loadCampaignByOption],
    );
    const handleOpenLinkModal = React.useCallback(
        (row: CampaignManagementInsightRow, field: "postLink" | "screenshot") => {
            const accountKey = getAccountKey(row.account);
            const currentValue =
                field === "postLink"
                    ? row.account.postLink ?? ""
                    : row.account.screenshot ?? "";

            setLinkModal({
                isOpen: true,
                accountKey,
                field,
                value: currentValue,
                title: field === "postLink" ? "Edit post link" : "Edit screenshot link",
                previewUrl: field === "screenshot" ? currentValue : "",
                isUploading: false,
            });
        },
        [],
    );
    const handleFileChange = React.useCallback(
        async (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (!file) return;

            try {
                setLinkModal((prev) => ({
                    ...prev,
                    isUploading: true,
                }));

                const response = await uploadCampaignFile(file);
                const uploadedUrl = String(response ?? "");

                if (!uploadedUrl) {
                    throw new Error("Upload failed: file url was not returned");
                }

                setLinkModal((prev) => ({
                    ...prev,
                    value: uploadedUrl,
                    previewUrl: uploadedUrl,
                    isUploading: false,
                }));

                toast.success("File uploaded successfully");
            } catch (error) {
                console.error("Failed to upload file", error);

                setLinkModal((prev) => ({
                    ...prev,
                    isUploading: false,
                }));

                toast.error("Failed to upload file");
            }
        },
        [],
    );
    const handleSendEmail = React.useCallback(
        async (row: CampaignManagementInsightRow) => {
            const promoId = row.account.addedAccountsId;
            if (!campaignId || !promoId) return;

            try {
                await sendPromoEmail({
                    campaignId,
                    promoId,
                });

                toast.success("Email sent");
            } catch (error) {
                console.error("Failed to send email", error);
                toast.error("Failed to send email");
            }
        },
        [campaignId],
    );
    const handleOpenDeleteModal = React.useCallback(
        (row: CampaignManagementInsightRow) => {
            setDeleteModal({
                isOpen: true,
                accountKey: getAccountKey(row.account),
                username: row.account.username ?? "this account",
            });
        },
        [],
    );
    const handleConfirmDelete = React.useCallback(() => {
        if (!deleteModal.accountKey) return;

        removeAccount(deleteModal.accountKey);

        setDeleteModal({
            isOpen: false,
            accountKey: "",
            username: "",
        });
    }, [deleteModal.accountKey, removeAccount]);
    const handleSaveLinkModal = React.useCallback(() => {
        if (!linkModal.field || !linkModal.accountKey) return;

        setAccountInsightField(linkModal.accountKey, linkModal.field, linkModal.value);

        setLinkModal({
            isOpen: false,
            accountKey: "",
            field: null,
            value: "",
            title: "",
            previewUrl: "",
            isUploading: false,
        });
    }, [linkModal, setAccountInsightField]);

    const handleOpenWhatsAppModal = React.useCallback(
        (row: CampaignManagementInsightRow) => {
            if (!editable) return;

            const influencerId = String(row.account?.influencerId ?? "");

            const influencerAccounts = (editable.addedAccounts ?? []).filter(
                (account) => String(account?.influencerId ?? "") === influencerId,
            );

            const accountsForMessage = influencerAccounts.length
                ? influencerAccounts
                : [row.account];

            const data = buildWhatsAppInfluencerPromoData({
                accounts: accountsForMessage,
                campaignContent: editable.campaignContent,
            });

            setWhatsAppModal({
                isOpen: true,
                data,
                accounts: accountsForMessage,
                isSending: false,
            });
        },
        [editable],
    );
    const handleSendWhatsAppOne = React.useCallback(async () => {
        if (!whatsAppModal.data || !whatsAppModal.accounts.length) return;

        if (!realtimeClientId || !isConnected) {
            toast.error("Socket client is not ready");
            return;
        }

        const firstAccount = whatsAppModal.accounts[0];

        try {
            setWhatsAppModal((prev) => ({
                ...prev,
                isSending: true,
            }));

            const message = buildWhatsAppInfluencerPromoMessage(whatsAppModal.data);

            const payload = {
                influencerId: String(firstAccount.influencerId ?? ""),
                accountId: String(
                    firstAccount.socialAccountId ??
                    firstAccount.accountId ??
                    "",
                ),
                socialMedia: String(firstAccount.socialMedia ?? ""),
                message,
                clientId: realtimeClientId,
            };

            console.log("[WHATSAPP INFLUENCER PAYLOAD]", payload);

            await sendCampaignWhatsAppOne(payload);

            toast.success("WhatsApp message sent");

            setWhatsAppModal({
                isOpen: false,
                data: null,
                accounts: [],
                isSending: false,
            });
        } catch (error) {
            console.error("Failed to send WhatsApp message", error);

            setWhatsAppModal((prev) => ({
                ...prev,
                isSending: false,
            }));

            toast.error("Failed to send WhatsApp message");
        }
    }, [whatsAppModal, realtimeClientId, isConnected]);
    const columns = React.useMemo(
        () =>
            getCampaignManagementInsightColumns({
                status: statusParam,
                canEdit,
                canContactInfluencer,
                showCpm,
                recentlyAddedAccountKeys,
                onDelete: handleOpenDeleteModal,
                onWhatsApp: handleOpenWhatsAppModal,
                onEmail: handleSendEmail,
                onEditLink: handleOpenLinkModal,
                onMetricChange: (row, field, value) => {
                    setAccountInsightField(getAccountKey(row.account), field, value);
                },
                onPay: handlePayPromo,
                onToggleCpm: () => setShowCpm((prev) => !prev),
            }),
        [
            statusParam,
            canEdit,
            canContactInfluencer,
            showCpm,
            recentlyAddedAccountKeys,
            handleOpenDeleteModal,
            handleOpenWhatsAppModal,
            handleSendEmail,
            handleOpenLinkModal,
            setAccountInsightField,
            handlePayPromo,
        ],
    );
    return (
        <div className="tableBase">
            <TableCampaignInsight
                data={rows}
                columns={columns}
                isFetching={false}
                emptyText="No insights found"
                totals={totals}
                canManageAccounts={canManageAccounts}
                campaignId={campaignId}
                statusParam={statusParam}
                optionIndex={optionIndex}
                getRowKey={(row) => row.accountKey}
                totalPrice={totalPrice}
                currency={currency}
            />

            {linkModal.isOpen && (
                <Modal
                    onClose={() =>
                        setLinkModal({
                            isOpen: false,
                            accountKey: "",
                            field: null,
                            value: "",
                            title: "",
                            previewUrl: "",
                            isUploading: false,
                        })
                    }
                >
                    <div className="create-option">
                        <h2>{linkModal.title}</h2>

                        {linkModal.field === "screenshot" ? (
                            <div className="create-option-upload">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{ display: "none" }}
                                />

                                <button
                                    type="button"
                                    className={`upload-preview ${linkModal.previewUrl ? "hasImage" : ""}`}
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={linkModal.isUploading}
                                >
                                    {linkModal.previewUrl ? (
                                        <>
                                            <img
                                                src={linkModal.previewUrl}
                                                alt="Screenshot preview"
                                                className="upload-preview__image"
                                            />

                                            <div className="upload-preview__overlay">
                                                {linkModal.isUploading ? (
                                                    <div className="upload-preview__loader">
                                                        <CircleLoader />
                                                        <span>Uploading...</span>
                                                    </div>
                                                ) : (
                                                    <span>Change image</span>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="upload-preview__empty">
                                            {linkModal.isUploading ? (
                                                <div className="upload-preview__loader">
                                                    <CircleLoader />
                                                    <span>Uploading...</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <span className="upload-preview__icon">+</span>
                                                    <span className="upload-preview__title">
                                                        Upload screenshot
                                                    </span>
                                                    <span className="upload-preview__hint">
                                                        Click to choose image
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </button>
                            </div>
                        ) : (
                            <input
                                className="create-option-input"
                                type="text"
                                value={linkModal.value}
                                onChange={(e) =>
                                    setLinkModal((prev) => ({
                                        ...prev,
                                        value: e.target.value,
                                    }))
                                }
                                placeholder="Paste link"
                            />
                        )}

                        <div className="create-option-btn">
                            <button
                                type="button"
                                className="modal-secondary-btn"
                                onClick={() =>
                                    setLinkModal({
                                        isOpen: false,
                                        accountKey: "",
                                        field: null,
                                        value: "",
                                        title: "",
                                        previewUrl: "",
                                        isUploading: false,
                                    })
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="modal-primary-btn"
                                onClick={handleSaveLinkModal}
                                disabled={linkModal.isUploading || !linkModal.value}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
            {whatsAppModal.isOpen && whatsAppModal.data && (
                <Modal
                    onClose={() =>
                        setWhatsAppModal({
                            isOpen: false,
                            data: null,
                            accounts: [],
                            isSending: false,
                        })
                    }
                >
                    <div className="create-option">
                        <h2>WhatsApp message</h2>

                        <div className="whatsapp-preview">
                            <div className="whatsapp-preview__base">
                                <div className="whatsapp-preview__title">
                                    <h3>
                                        <strong>
                                            Hi {whatsAppModal.data?.influencerName || "there"},
                                        </strong>
                                    </h3>
                                    <p>You have a new promo request.</p>
                                </div>

                                <p className="whatsapp-preview__caption">Campaign details:</p>
                            </div>

                            <div className="whatsapp-preview__content">
                                {whatsAppModal.data.promos.flatMap((promo, index) => {
                                    const fields = [
                                        { label: "Platform", value: promo.platform },
                                        { label: "Page", value: promo.page },
                                        { label: "Content", value: promo.content },
                                        { label: "Description", value: promo.description },
                                        { label: "Story Tag", value: promo.storyTag },
                                        { label: "Story Link", value: promo.storyLink },
                                        { label: "Special request", value: promo.specialRequest },
                                        { label: "Reward", value: promo.reward },
                                    ];

                                    return [


                                        ...fields.map((field) => (
                                            <div
                                                key={`promo-${index}-${field.label}`}
                                                className="whatsapp-preview__row"
                                            >
                                                <p>{field.label}:</p>
                                                <p>{field.value || "—"}</p>
                                            </div>
                                        )),
                                    ];
                                })}
                            </div>

                            <div className="whatsapp-preview__footer">
                                <p className="whatsapp-preview__subtext">
                                    You can manage this promo(s) in your account here:
                                    <br />
                                    https://go.soundinfluencers.com/account/influencer/new-promos
                                </p>

                                <h4 className='whatsapp-preview__subtitle'>
                                    Let us know if you’d like to take part in this campaign(s).
                                </h4>
                            </div>
                        </div>

                        <div className="create-option-btn">
                            <button
                                type="button"
                                className="modal-primary-btn"
                                onClick={handleSendWhatsAppOne}
                                disabled={whatsAppModal.isSending}
                            >
                                {whatsAppModal.isSending ? "Sending..." : "Send"}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
            {deleteModal.isOpen && (
                <Modal
                    onClose={() =>
                        setLinkModal({
                            isOpen: false,
                            accountKey: "",
                            field: null,
                            value: "",
                            title: "",
                            previewUrl: "",
                            isUploading: false,
                        })
                    }
                >
                    <div className="create-option">
                        <h2>Delete</h2>
                        <p>
                            You want to delete{' '}
                            {deleteModal.username}{' '}
                            from this campaign?
                        </p>

                        <div className="create-option-btn">
                            <button
                                type="button"
                                className='modal-secondary-btn'
                                onClick={() =>
                                    setDeleteModal({
                                        isOpen: false,
                                        accountKey: "",
                                        username: "",
                                    })
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className='modal-primary-btn'
                                onClick={handleConfirmDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};