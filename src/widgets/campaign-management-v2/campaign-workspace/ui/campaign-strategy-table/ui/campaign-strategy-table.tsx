import { useMemo } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";

import { Table } from "@/shared/ui/v2/table-v2/table";
import type { ICampaignDetails } from "@/entities/campaign/model/campaign-details.types";

import { campaignStrategyTableColumns} from "../model/campaign-strategy-table.columns";
import type { CampaignStrategyRow } from "../model/campaign-strategy-table.types";

interface CampaignStrategyTableProps {
  campaign: ICampaignDetails;
}

const getRowId = (row: CampaignStrategyRow): string => row.addedAccountsId;

export const CampaignStrategyTable = ({
  campaign,
}: CampaignStrategyTableProps) => {
  const { addedAccounts, campaignContent } = campaign;

  const rows = useMemo<CampaignStrategyRow[]>(() => {
    const contentById = new Map(
      campaignContent.map((content, index) => [
        content._id,
        {
          content,
          label: `Video ${index + 1}`,
        },
      ] as const),
    );

    return addedAccounts.map((account) => {
      const selection = account.selectedContent;

      const assigned = selection?.campaignContentItemId
        ? contentById.get(selection.campaignContentItemId)
        : undefined;

      const content = assigned?.content;

      const description = content?.descriptions.find(
        (item) => item._id === selection?.descriptionId,
      );

      const briefs = Array.isArray(content?.additionalBrief)
        ? content.additionalBrief
        : [];

      const brief = briefs.find(
        (item) => item._id === selection?.additionalBriefId,
      );

      return {
        addedAccountsId: account.addedAccountsId,
        username: account.username,
        socialMedia: account.socialMedia,
        followers: account.followers,
        dateRequest: account.dateRequest,
        postLink: account.postLink,
        screenshot: account.screenshot,
        contentLabel: assigned?.label ?? "",
        description: description?.description ?? "",
        brief: brief?.additionalBrief ?? "",
        storyTag: content?.taggedUser ?? "",
        storyLink: content?.taggedLink ?? "",
      };
    });
  }, [addedAccounts, campaignContent]);

  return (
    <Tooltip.Provider
      delayDuration={200}
      skipDelayDuration={0}
      disableHoverableContent={false}
    >
      <Table
        key={campaign.campaignId}
        data={rows}
        columns={campaignStrategyTableColumns}
        getRowId={getRowId}
        enableSorting
      />
    </Tooltip.Provider>
  );
};
