import React from "react";
import repeat from "../assets/repeat.svg";
import styles from "./toggle-tables.module.scss";

interface Props {
    onChange: () => void;
    flag: boolean;
}

export const ToggleTables: React.FC<Props> = ({ onChange, flag }) => {
    return (
        <button
            type="button"
            onClick={onChange}
            className={`${styles.toggleTablesBtn} ${!flag ? styles.active : ""}`}
        >
            <img src={repeat} alt="" />
            <p>{flag ? "Campaign Strategy" : "Campaign Insights"}</p>
        </button>
    );
};