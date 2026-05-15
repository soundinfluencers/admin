// widgets/admin-create-campaign-strategy/model/use-create-admin-campaign.ts
import React from "react";
import { toast } from "react-toastify";
import {
    buildAdminCreateCampaignPayload
} from "@/pages/admin-create-campaign-strategy/model/build-admin-create-campaign-payload.ts";
import {createAdminCampaign} from "@/entities/admin-create-campaign/campaign-builder/api/create-admin-campaign.ts";


type Params = {
    campaignName: string;
    totalPrice: number;
    accounts: any[];
    content: any[];
};

export const useCreateAdminCampaign = ({
                                           campaignName,
                                           totalPrice,
                                           accounts,
                                           content,
                                       }: Params) => {
    const [isCreateModalOpen, setCreateModalOpen] = React.useState(false);
    const [createdCampaignId, setCreatedCampaignId] = React.useState("");
    const [isCreating, setIsCreating] = React.useState(false);

    const createCampaign = React.useCallback(async () => {
        try {
            setIsCreating(true);

            const payload = buildAdminCreateCampaignPayload({
                campaignName,
                totalPrice,
                accounts,
                content,
            });

            console.log("ADMIN CREATE CAMPAIGN PAYLOAD", payload);

            const response = await createAdminCampaign(payload);

            const responseData =
                (response as any)?.data?.data ??
                (response as any)?.data ??
                response;

            const campaignId = String(responseData?.campaignId ?? "");

            if (!campaignId) {
                throw new Error("Campaign id was not returned");
            }

            setCreatedCampaignId(campaignId);
            setCreateModalOpen(true);

            toast.success("Campaign created successfully");
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Failed to create campaign";

            toast.error(message);
        } finally {
            setIsCreating(false);
        }
    }, [campaignName, totalPrice, accounts, content]);

    return {
        isCreating,
        isCreateModalOpen,
        setCreateModalOpen,
        createdCampaignId,
        createCampaign,
    };
};