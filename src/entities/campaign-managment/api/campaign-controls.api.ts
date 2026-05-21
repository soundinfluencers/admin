import { $api } from "@/app/api/http.ts";

type PayPromoProps = {
    campaignId: string;
    promoId: string;
};

type UpdateAllPostDetailsBody = {
    campaignId: string;
    campaignName: string;
    clientId: string;
};

export const getPdfFile = async (campaignId: string) => {
    return await $api.get(`/campaigns/${campaignId}/pdf`, {
        responseType: "blob",
        timeout: 15000,
    });
};

export const closeCampaign = async (campaignId: string) => {
    return await $api.post(`/admin/campaigns/${campaignId}/close`);
};

export const reopenCampaign = async (campaignId: string) => {
    return await $api.post(`/admin/campaigns/${campaignId}/reopen`);
};

export const payPromoCampaign = async ({
                                           campaignId,
                                           promoId,
                                       }: PayPromoProps) => {
    const res = await $api.patch(`/admin/campaigns/${campaignId}/pay/${promoId}`);
    return res.data.data;
};

export const updateAllPostDetails = async ({
                                               campaignId,
                                               campaignName,
                                               clientId,
                                           }: UpdateAllPostDetailsBody) => {
    const res = await $api.post("/scrapers/post-details/all", {
        campaignId,
        campaignName,
        clientId,
    });

    return res.data?.data ?? res.data;
};