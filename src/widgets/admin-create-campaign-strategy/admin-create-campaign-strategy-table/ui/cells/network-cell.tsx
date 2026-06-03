import React from "react";
import type {StrategyRow} from "@/widgets/admin-create-campaign-strategy/model/campaign-strategy.types.ts";
import {getSocialMediaIcon} from "@/shared/libs/get-social-media-icon.ts";
import type {TSocialMedia} from "@/shared/types/types.ts";


type Props = {
    row: StrategyRow;
};

export const NetworkCell: React.FC<Props> = ({ row }) => {
    const account = row.account;

    return (
        <div className="username_row">
            <img
                src={
                    getSocialMediaIcon(
                        account.socialMedia as TSocialMedia,
                    ) || ""
                }
                alt={account.socialMedia}
            />
            <p title={account.username} className="hidden-text username">{account.username || "—"}</p>
        </div>
    );
};