//@ts-nocheck

import React from "react";

import { buildCampaignManagementRows } from "../model/build-campaign-management-rows";
import type {
    CampaignAddedAccount,
    CampaignContentItem,
    TableGroup,
} from "@/entities/campaign-managment/model/campaign.managment.ts";

import {
    getCampaignManagementColumns,
} from "@/widgets/campaign-management/campaign-management-table/ui/campaign-management-columns.tsx";

import {
    TableCampaign,
} from "@/widgets/campaign-management/campaign-management-table/ui/table-campaign-management/ui/tableStrategy.tsx";

import {
    useCampaignManagementStore,
} from "@/entities/campaign-managment/store/campaign-management.store.ts";

type Props = {
    items: CampaignContentItem[];
    networks: CampaignAddedAccount[];
    optionIndex: number;
    group: TableGroup;
    changeView: boolean;
    canEdit: boolean;
    canManageAccounts: boolean;
    totalPrice: number | null;
    currency?: string
};

export const CampaignManagementTable = ({
                                            items,
                                            networks,
                                            optionIndex,
                                            group,
                                            changeView,
                                            canEdit,
                                            canManageAccounts,
    totalPrice,currency
                                        }: Props) => {
    const status = useCampaignManagementStore((state) => state.status);

    // const recentlyAddedAccountKeys = useCampaignManagementStore(
    //     (state) => state.recentlyAddedAccountKeys,
    // );

    const deletingAccountKey = useCampaignManagementStore(
        (state) => state.deletingAccountKey,
    );

    const rows = React.useMemo(
        () =>
            buildCampaignManagementRows({
                items,
                networks,
                optionIndex,
                group,
                changeView,
                canEdit,
            }),
        [items, networks, optionIndex, group, changeView, canEdit],
    );

    const columns = React.useMemo(
        () =>
            getCampaignManagementColumns({
                group,
                changeView,
                canEdit,
                status,
            }),
        [group, changeView, canEdit, status],
    );
    const totalFollowers = React.useMemo(() => {
        if (group === "press") return null;

        return networks.reduce((sum, account) => {
            return sum + Number(account.followers ?? 0);
        }, 0);
    }, [networks, group]);

    // const totalPrice = React.useMemo(() => {
    //     return networks.reduce((sum, account) => {
    //         return sum + Number(account.publicPrice ?? 0);
    //     }, 0);
    // }, [networks]);

    return (
        <div className="tableBase">
            <TableCampaign
                canEdit={canEdit}
                data={rows}
                currency={currency}
                totalFollowers={totalFollowers}
                totalPrice={totalPrice}
                columns={columns}
                canManageAccounts={canManageAccounts}
                isFetching={false}
                emptyText="No influencers found"
                optionIndex={optionIndex}
                highlightedRowKeys={[]}
                deletingRowKey={deletingAccountKey}
                getRowKey={(row) => String((row as { accountKey: string }).accountKey)}
            />
        </div>
    );
};