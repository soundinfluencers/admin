import { useEffect, type PropsWithChildren } from "react";
import { matchPath, useLocation } from "react-router-dom";

import { useCampaignManagementStore } from "@/pages/campaign-management-v2/store/campaign-management.store";

const CAMPAIGN_EDIT_PATH =
  "/dashboard/campaigns/campaign-management/:status/:campaignId/*";

export const CampaignDraftLifecycle = ({
  children,
}: PropsWithChildren) => {
  const { pathname } = useLocation();

  useEffect(() => {
    const { draft, baseline, resetDraft } =
      useCampaignManagementStore.getState();

    const snapshot = draft ?? baseline;

    if (!snapshot) return;

    const match = matchPath(CAMPAIGN_EDIT_PATH, pathname);

    const isSameEditingContext =
      match !== null &&
      match.params.campaignId === snapshot.params.campaignId &&
      match.params.status === snapshot.params.status;

    if (!isSameEditingContext) {
      resetDraft();
    }
  }, [pathname]);

  return <>{children}</>;
};
