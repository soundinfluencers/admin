

import { $api } from "@/app/api/http.ts";

type DeleteAdminProposalOptionProps = {
    campaignId: string;
    optionIndex: number;
};

export const deleteAdminProposalOption = async ({
                                                    campaignId,
                                                    optionIndex,
                                                }: DeleteAdminProposalOptionProps) => {
    const res = await $api.delete(`/proposal-system/${campaignId}`, {
        params: {
            optionIndex,
        },
    });

    return res.data?.data ?? res.data;
};