//@ts-nocheck
import { useNavigate } from "react-router-dom";

import { useCampaignBuilderStore } from "@/entities/admin-create-campaign/campaign-builder/model/campaign-builder.store";
import styles from "./admin-create-campaign-post-content.module.scss";

import {PageBreadcrumbs} from "@/widgets/page-breadcrumbs";
import {CampaignPostContentPage} from "@/widgets/admin-create-campaign-post-content/ui/campaign-post-content-page.tsx";
import {CAMPAIGN_CURRENCY_OPTIONS} from "@/features/admin-create-campaign/build-campaign-filters/model/build-campaign-params.constants.ts";

const getCurrencyCode = (symbol: string) => {
    const currency = CAMPAIGN_CURRENCY_OPTIONS.find(
        (option) => option.key === symbol,
    )?.currency;

    if (!currency) {
        throw new Error(`Unsupported campaign currency symbol: ${symbol}`);
    }

    return currency;
};

export const AdminCreateCampaignPostContentPage = () => {
    const navigate = useNavigate();

    const selectedAccounts = useCampaignBuilderStore((s) => s.selectedAccounts);
    const campaignName = useCampaignBuilderStore((s) => s.campaignName);
    const campaignContent = useCampaignBuilderStore((s) => s.campaignContent);
    const totalPrice = useCampaignBuilderStore((s) => s.totalPrice);
    const selectedCurrency = useCampaignBuilderStore((s) => s.selectedCurrency);
    const blocksDraft = useCampaignBuilderStore((s) => s.blocksDraft);
    const setCampaignContent = useCampaignBuilderStore(
        (s) => s.actions.setCampaignContent,
    );
    const syncSelectedAccountsContent = useCampaignBuilderStore(
        (s) => s.actions.syncSelectedAccountsContent,
    );





    const mappedAccounts = selectedAccounts.map((item) => ({
        accountId: item.accountId,
        influencerId: item.influencerId,
        socialMedia: item.socialMedia,
        username: item.username,
        profileType: item.profileType,
        logoUrl: item.logoUrl,
        followers: item.followers,
        price: item.price,
        dateRequest: item.dateRequest,
        source: item.source,
    }));

    return (
        <div>
            <div className={styles.navMenu}>
                <PageBreadcrumbs
                    items={[
                        { label: "Dashboard", to: "/dashboard" },
                        {
                            label: "Create campaign",
                            to: `/dashboard/create-new-campaign?currency=${getCurrencyCode(selectedCurrency)}`,
                        },
                        { label: "Content" },

                    ]}
                />
            </div>

            <CampaignPostContentPage
                defaultCampaignContent={campaignContent}
                accounts={mappedAccounts}
                totalPrice={totalPrice}
                defaultCampaignName={campaignName}
                defaultBlocks={blocksDraft ?? undefined}
                onSubmitPayload={(payload) => {
                    setCampaignContent(payload.campaignContent);
                    syncSelectedAccountsContent(payload.addedAccounts);
                    console.log(payload)
                    navigate("/dashboard/create-new-campaign/content/strategy");
                }}
            />
        </div>
    );
};
