import React from "react";
import type {StrategyRow} from "@/widgets/admin-create-campaign-strategy/model/campaign-strategy.types.ts";
import type { NestedOption } from "@/shared/ui/checkbox-tree/checkbox-tree.types.ts";
import {
    MUSIC_GENRES_COMMUNITY,
    THEME_TOPICS,
    MUSIC_GENRES_CREATOR,
    CONTENT_FOCUS_OPTIONS,
} from "@/features/influencers/social-account-form/model/social-account-form.constants.ts";

const getLeafLabels = (options: NestedOption[]): Array<[string, string]> =>
    options.flatMap((option): Array<[string, string]> =>
        option.children?.length
            ? getLeafLabels(option.children)
            : [[option.value, option.label]],
    );

const genreLabels = new Map(getLeafLabels([
    ...MUSIC_GENRES_COMMUNITY,
    ...THEME_TOPICS,
    ...MUSIC_GENRES_CREATOR,
    ...CONTENT_FOCUS_OPTIONS,
]));

type Props = {
    row: StrategyRow;
};

export const GenresCell: React.FC<Props> = ({ row }) => {
    const genres = (row.account.genres ?? []).filter((genre) => genre.trim().length > 0);

    if (!genres.length) {
        return <p className="hidden-text">—</p>;
    }

    return (
        <div className="td-chips strategy-genres">
            <ul className="chips">
                {genres.map((item) => (
                    <li key={item}>{genreLabels.get(item) ?? item}</li>
                ))}
            </ul>
        </div>
    );
};
