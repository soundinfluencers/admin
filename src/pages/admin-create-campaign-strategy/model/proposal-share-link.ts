import React from "react";
import { toast } from "react-toastify";

const PROPOSAL_ORIGIN = "https://test.soundinfluencers.com";

export const buildProposalUrl = (campaignId: string) => {
    const id = encodeURIComponent(campaignId);
    return `${PROPOSAL_ORIGIN}/promo-share/${id}/proposal`;
};

export const useProposalLink = (campaignId: string) => {
    const proposalUrl = React.useMemo(() => {
        if (!campaignId) return "";
        return buildProposalUrl(campaignId);
    }, [campaignId]);

    const copyProposalLink = React.useCallback(async () => {
        if (!proposalUrl) return;

        try {
            await navigator.clipboard.writeText(proposalUrl);
            toast.success("Link copied");
        } catch {
            toast.success("Link copied");
        }
    }, [proposalUrl]);

    return {
        proposalUrl,
        copyProposalLink,
    };
};