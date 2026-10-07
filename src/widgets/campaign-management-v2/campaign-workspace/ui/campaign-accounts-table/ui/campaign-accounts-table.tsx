import { useMemo } from "react";
import { Table } from "@/shared/ui/v2/table-v2/table.tsx";
import { getCampaignAccountsTableColumns } from "../model/campaign-accounts-table.columns.tsx";

import type {
  ICampaignDetails,
  IMarkPromoPaidResponse,
  TEditableField,
} from "@/entities/campaign/model/campaign-details.types.ts";

interface CampaignAccountsTableProps {
  canRemoveAccount: boolean;
  campaignId: string;
  accounts: ICampaignDetails["addedAccounts"];
  canEditMetrics: boolean;
  canMarkAsPaid: boolean;
  canEditPostDetails: boolean;
  onUpdatePostLink: (addedAccountsId: string, postLink: string) => void;
  onUpdateScreenshot: (addedAccountsId: string, screenshot: string) => void;
  onUpdateAccountMetricField: (addedAccountsId: string, field: TEditableField, value: number) => void;
  onPromoPaid: (result: IMarkPromoPaidResponse["data"]) => void | Promise<void>;
  onAccountRemove: (addedAccountsId: string) => void;
}

const getAccountRowId = (account: ICampaignDetails["addedAccounts"][number]): string => {
  return account.addedAccountsId;
};

export const CampaignAccountsTable = ({
  canRemoveAccount,
  campaignId,
  accounts,
  canEditMetrics,
  canMarkAsPaid,
  canEditPostDetails,
  onUpdatePostLink,
  onUpdateScreenshot,
  onUpdateAccountMetricField,
  onPromoPaid,
  onAccountRemove,
}: CampaignAccountsTableProps) => {

  const columns = useMemo(
    () => getCampaignAccountsTableColumns({
      canRemoveAccount,
      campaignId,
      canEditMetrics,
      canMarkAsPaid,
      canEditPostDetails,
      onUpdatePostLink,
      onUpdateScreenshot,
      onUpdateAccountMetricField,
      onPromoPaid,
      onAccountRemove,
    }),
    [
      canRemoveAccount,
      campaignId, 
      canEditMetrics, 
      canMarkAsPaid,
      canEditPostDetails,
      onUpdatePostLink,
      onUpdateScreenshot, 
      onUpdateAccountMetricField, 
      onPromoPaid, 
      onAccountRemove
    ],
  );

  return (
    <Table
      data={accounts}
      columns={columns}
      getRowId={getAccountRowId}
      showFooter
    />
  );
};
