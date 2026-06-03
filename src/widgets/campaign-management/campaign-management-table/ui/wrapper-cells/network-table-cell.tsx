
import type { CampaignManagementRow } from "../../model/campaign-management-table.types";
import {getSocialMediaIcon} from "@/shared/libs/get-social-media-icon.ts";
import type {TSocialMedia} from "@/shared/types/types.ts";

type Props = {
    row: CampaignManagementRow;
};

export const NetworkTableCell = ({ row }: Props) => {

    return <div className='username_row'>
        <img src={getSocialMediaIcon(row.account.socialMedia as TSocialMedia)} alt=""/>
        <p title={row.account.username} className='hidden-text-user'>{row.account.username}</p>
    </div>;
};