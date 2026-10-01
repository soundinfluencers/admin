import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { getCampaignByStatus } from "@/entities/campaign-managment/api/fetch-status-campaign";
import { updateCampaignByStatus } from "@/entities/campaign-managment/api/update-campaign";
import {
    normalizeCampaignForEdit,
    useCampaignManagementStore,
} from "@/entities/campaign-managment/store/campaign-management.store";
import type { CampaignStatus } from "@/entities/campaign-managment/model/campaign.managment";

type RequestScope = { key: string; requestId: number; saving: boolean };
type SaveBody = Parameters<typeof updateCampaignByStatus>[0]["body"];
type CampaignSaveResult =
    | { kind: "skipped" }
    | { kind: "saved"; updated: Awaited<ReturnType<typeof updateCampaignByStatus>> };

const getScopeKey = (id: string | null, status: string | null, option: number) =>
    JSON.stringify([id, status?.toLowerCase(), option]);

export const useCampaignLoading = (
    campaignId: string | null,
    statusParam: CampaignStatus | null,
    optionIndex: number,
) => {
    const [isCampaignLoading, setIsCampaignLoading] = useState(false);
    const scopeRef = useRef<RequestScope | null>(null);
    const scopeKey = getScopeKey(campaignId, statusParam, optionIndex);

    // Invalidate responses on route changes and unmount (including Add accounts).
    useLayoutEffect(() => {
        scopeRef.current = { key: scopeKey, requestId: 0, saving: false };
        setIsCampaignLoading(false);
        return () => { scopeRef.current = null; };
    }, [scopeKey]);

    const loadCampaignByOption = useCallback(
        async (nextOptionIndex: number, nextStatus?: CampaignStatus) => {
            const resolvedStatus = nextStatus || statusParam;
            const scope = scopeRef.current;
            if (!campaignId || !resolvedStatus || !scope || scope.saving) return;
            if (scope.key !== getScopeKey(campaignId, resolvedStatus, nextOptionIndex)) return;

            const snapshot = useCampaignManagementStore.getState();
            const requestId = ++scope.requestId;
            const isCurrent = () => scopeRef.current === scope && scope.requestId === requestId;
            setIsCampaignLoading(true);

            try {
                const response = await getCampaignByStatus({
                    campaignId,
                    status: resolvedStatus,
                    optionIndex: nextOptionIndex,
                });
                const current = useCampaignManagementStore.getState();
                // A local edit or Reset during the request also supersedes its snapshot.
                if (!isCurrent() || !response || String(response.campaignId) !== campaignId) return;
                if (current.editable !== snapshot.editable || current.original !== snapshot.original) return;

                current.initCampaign(response, nextOptionIndex);
            } catch (error) {
                if (isCurrent()) console.error("Failed to load campaign", error);
            } finally {
                if (isCurrent()) setIsCampaignLoading(false);
            }
        },
        [campaignId, statusParam],
    );

    useEffect(() => {
        if (!campaignId || !statusParam) return;
        const state = useCampaignManagementStore.getState();
        // Preserve under_review drafts on the pending route already used by Save.
        const isSameStatus = state.status.toLowerCase() === statusParam.toLowerCase() ||
            (state.status === "under_review" && statusParam.toLowerCase() === "pending");
        const isSameCampaign = state.editable?.campaignId === campaignId &&
            state.activeOptionIndex === optionIndex &&
            isSameStatus;
        // Continue the draft, including accounts attached on the separate builder route.
        // A clean snapshot is always fetched again when entering this route.
        if (isSameCampaign && JSON.stringify(state.editable) !== JSON.stringify(state.original)) return;
        void loadCampaignByOption(optionIndex, statusParam);
    }, [campaignId, statusParam, optionIndex, loadCampaignByOption]);

    const saveCampaign = useCallback(
        async (body: SaveBody, requestStatus: CampaignStatus): Promise<CampaignSaveResult> => {
            const scope = scopeRef.current;
            if (!campaignId || !scope || scope.key !== scopeKey || scope.saving) return { kind: "skipped" };
            const snapshot = useCampaignManagementStore.getState();
            if (snapshot.editable?.campaignId !== campaignId || snapshot.activeOptionIndex !== optionIndex) return { kind: "skipped" };

            // Save supersedes earlier GETs; GETs started during Save must not win over it.
            const requestId = ++scope.requestId;
            scope.saving = true;
            setIsCampaignLoading(false);
            try {
                const updated = await updateCampaignByStatus({
                    campaignId,
                    status: requestStatus,
                    optionIndex,
                    body,
                });
                const result: CampaignSaveResult = { kind: "saved", updated };
                if (scopeRef.current !== scope || scope.requestId !== requestId) return result;
                const current = useCampaignManagementStore.getState();
                if (!updated || String(updated.campaignId) !== campaignId || current.original !== snapshot.original) return result;

                if (current.editable === snapshot.editable) {
                    current.initCampaign(updated, optionIndex);
                } else if (current.editable?.campaignId === campaignId && current.activeOptionIndex === optionIndex) {
                    // Keep edits made after Save started; Reset still uses the saved snapshot.
                    useCampaignManagementStore.setState({ original: normalizeCampaignForEdit(updated) });
                }
                return result;
            } finally {
                scope.saving = false;
            }
        },
        [campaignId, optionIndex, scopeKey],
    );

    return { isCampaignLoading, loadCampaignByOption, saveCampaign };
};
