import { useMemo } from "react";
import {
    useCampaignBuilderStore
} from "@/entities/admin-create-campaign/campaign-builder/model/campaign-builder.store.ts";
import type {CampaignContentItem} from "@/entities/campaign-managment/model/campaign.managment.ts";


export const useEditableContentItem = (
    contentId?: string,
    fallback?: CampaignContentItem | null,
) => {
    const editableItem = useCampaignBuilderStore((state) =>
        contentId
            ? state.campaignContent.find(
            (item) => String(item._id) === String(contentId),
        ) ?? null
            : null,
    );

    return useMemo(
        () => editableItem ?? fallback ?? null,
        [editableItem, fallback],
    );
};