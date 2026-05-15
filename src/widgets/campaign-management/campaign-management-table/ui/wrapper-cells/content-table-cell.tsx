import React from "react";

import type {
    CampaignManagementRow,
} from "@/widgets/campaign-management/campaign-management-table/model/campaign-management-table.types";

import {
    useCampaignManagementStore,
} from "@/entities/campaign-managment/store/campaign-management.store";

import {
    ContentCellEdit,
} from "@/widgets/campaign-management/campaign-management-table/ui/wrapper-cells/cells/content-cell-edit.tsx";

import {
    ContentCell,
} from "@/widgets/campaign-management/campaign-management-table/ui/wrapper-cells/cells/content-cell.tsx";

import {
    PressContentCellEdit,
} from "@/widgets/campaign-management/campaign-management-table/ui/wrapper-cells/cells/press-content-cell-edit.tsx";

import {
    PressContentCell,
} from "@/widgets/campaign-management/campaign-management-table/ui/wrapper-cells/cells/press-content-cell.tsx";

type Props = {
    row: CampaignManagementRow;
    canEdit: boolean;
    status?: string;
};

export const ContentTableCell: React.FC<Props> = ({
                                                      row,
                                                      canEdit,
                                                      status,
                                                  }) => {
    const setAccountSelectedContent = useCampaignManagementStore(
        (s) => s.setAccountSelectedContent,
    );

    const [isOpen, setIsOpen] = React.useState(false);

    const normalizedStatus = String(status ?? "").toLowerCase();
    const isCompleted = normalizedStatus === "completed";
    const canChangeContent = canEdit && !isCompleted;

    const setSelectedContent = React.useCallback(
        (nextIndex: number | ((prev: number) => number)) => {
            if (isCompleted) return;

            const resolvedIndex =
                typeof nextIndex === "function"
                    ? nextIndex(row.selectedContentIndex)
                    : nextIndex;

            const nextItem = row.platformItems?.[resolvedIndex];
            const nextDesc = nextItem?.descriptions?.[0];

            if (!nextItem) return;

            setAccountSelectedContent(row.accountKey, {
                campaignContentItemId: String(nextItem._id ?? ""),
                descriptionId: String(nextDesc?._id ?? ""),
            });
        },
        [
            isCompleted,
            row.selectedContentIndex,
            row.platformItems,
            row.accountKey,
            setAccountSelectedContent,
        ],
    );

    const setSelectedPd = React.useCallback(
        (nextPd: number) => {
            if (isCompleted) return;

            const item = row.platformItems?.[row.selectedContentIndex];
            const desc = item?.descriptions?.[nextPd];

            if (!item || !desc) return;

            setAccountSelectedContent(row.accountKey, {
                campaignContentItemId: String(item._id ?? ""),
                descriptionId: String(desc._id ?? ""),
            });
        },
        [
            isCompleted,
            row.platformItems,
            row.selectedContentIndex,
            row.accountKey,
            setAccountSelectedContent,
        ],
    );

    if (row.group === "press") {
        if (canChangeContent) {
            return (
                <PressContentCellEdit
                    contentId={row.selectedItem?._id}
                    value={row.selectedItem?.mainLink}
                />
            );
        }

        return (
            <PressContentCell value={row.selectedItem?.mainLink} />
        );
    }

    if (canChangeContent) {
        return (
            <ContentCellEdit
                isOpen={isOpen}
                onOpenChange={setIsOpen}
                accountKey={row.accountKey}
                selectedItem={row.selectedItem}
                platformItems={row.platformItems}
                selectedContent={row.selectedContentIndex}
                setSelectedContent={setSelectedContent}
                setSelectedPd={setSelectedPd}
                socialMedia={row.account.socialMedia}
                media0={row.selectedItem?.mediaCache?.items?.[0]}
                group={row.group}
                status={normalizedStatus}
            />
        );
    }

    return (
        <ContentCell
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            platformItems={row.platformItems}
            selectedContent={row.selectedContentIndex}
            setSelectedContent={setSelectedContent}
            setSelectedPd={setSelectedPd}
            socialMedia={row.account.socialMedia}
            media0={row.selectedItem?.mediaCache?.items?.[0]}
            group={row.group}
            status={normalizedStatus}
        />
    );
};