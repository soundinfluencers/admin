import type { ICampaignDetails } from "@/entities/campaign/model/campaign-details.types.ts";
import { Table } from "@/shared/ui/table-v2/table.tsx";
import { campaignAccountsTableColumns } from "../model/campaign-accounts-table.columns.tsx";

interface CampaignAccountsTableProps {
  accounts: ICampaignDetails["addedAccounts"];
}

const getAccountRowId = (account: ICampaignDetails["addedAccounts"][number]): string => {
  return account.addedAccountsId;
};

export const CampaignAccountsTable = ({
  accounts,
}: CampaignAccountsTableProps) => {
  
  return (
    <Table
      data={accounts}
      columns={campaignAccountsTableColumns}
      getRowId={getAccountRowId}
      showFooter
    />
  );
};
