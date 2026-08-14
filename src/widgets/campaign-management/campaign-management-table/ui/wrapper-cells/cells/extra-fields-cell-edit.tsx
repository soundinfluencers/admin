import React from "react";
import { useCampaignManagementStore } from "@/entities/campaign-managment/store/campaign-management.store.ts";

type StoreField = "mainLink" | "taggedUser" | "taggedLink" | "additionalBrief";

type Props = {
    contentId?: string;
    field: StoreField;
    value?: string;
    placeholder?: string;
    additionalBriefId?: string;
    accountKey?: string;
};

export const ExtraFieldCellEdit = React.memo(function ExtraFieldCellEdit({
                                                                             contentId,
                                                                             field,
                                                                             value,
                                                                             placeholder,
                                                                             additionalBriefId,
                                                                             accountKey,
                                                                         }: Props) {
    const setContentField = useCampaignManagementStore((s) => s.setContentField);
    const [draftValue, setDraftValue] = React.useState(String(value ?? ""));

    React.useEffect(() => {
        setDraftValue(String(value ?? ""));
    }, [contentId, field, value]);

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
                value={draftValue}
                onChange={(e) => {
                    setDraftValue(e.target.value);
                    setContentField(
                        contentId,
                        field,
                        e.target.value,
                        additionalBriefId,
                        accountKey,
                    );
                }}
                placeholder={placeholder ?? field}
            />
        </>
    );
});
