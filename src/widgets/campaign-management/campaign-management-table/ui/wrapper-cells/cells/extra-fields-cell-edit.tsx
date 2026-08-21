import React from "react";
import { useCampaignManagementStore } from "@/entities/campaign-managment/store/campaign-management.store.ts";

type StoreField = "mainLink" | "taggedUser" | "taggedLink" | "additionalBrief";

type Props = {
    contentId?: string;
    field: StoreField;
    value?: string;
    additionalBriefId?: string;
    placeholder?: string;
};

export const ExtraFieldCellEdit = React.memo(function ExtraFieldCellEdit({
                                                                              contentId,
                                                                              field,
                                                                              value,
                                                                              additionalBriefId,
                                                                              placeholder,
                                                                          }: Props) {
    const setContentField = useCampaignManagementStore((s) => s.setContentField);

    if (!contentId) {
        return (
            <td className="tableBase__td">
                —
            </td>
        );
    }

    return (
        <>
            <input className='hidden-text'
                value={String(value ?? "")}
                onChange={(e) =>
                    setContentField(
                        contentId,
                        field,
                        e.target.value,
                        additionalBriefId,
                    )
                }
                placeholder={placeholder ?? field}
            />
        </>
    );
});
