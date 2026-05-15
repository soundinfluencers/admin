import React from "react";
import type {StrategyRow} from "@/widgets/admin-create-campaign-strategy/model/campaign-strategy.types.ts";


type Props = {
    row: StrategyRow;
};

export const CountriesCell: React.FC<Props> = ({ row }) => {
    const countries = row.account.countries ?? [];

    if (!countries.length) {
        return <p className="hidden-text">—</p>;
    }

    return (
        <div className="td-chips">
            <ul className="chips">
                {countries.map((item) => (
                    <li key={`${item.country}-${item.percentage}`}>
                        {item.country} {item.percentage}%
                    </li>
                ))}
            </ul>
        </div>
    );
};