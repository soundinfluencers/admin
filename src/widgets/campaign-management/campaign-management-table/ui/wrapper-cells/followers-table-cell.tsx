
import type { CampaignManagementRow } from "../../model/campaign-management-table.types";

type Props = {
    row: CampaignManagementRow;
};

export const FollowersTableCell = ({ row }: Props) => {
    return <p className='followers'>{row.account.followers}</p>;
};