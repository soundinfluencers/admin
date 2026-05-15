import React from "react";
import chevronDown from "../assets/chevron-down.svg";

import styles from "./dropdown-select.module.scss";
import {useClickOutside} from "@/shared/hooks/use-click-outside.ts";

interface DropdownProps {
    isOpen: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    children: React.ReactNode;
    selected: string;
    isChange?: boolean;
}

export const DropdownSelect: React.FC<DropdownProps> = ({
                                                            isOpen,
                                                            setOpen,
                                                            children,
                                                            selected,
                                                            isChange = false,
                                                        }) => {
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    useClickOutside(dropdownRef, () => setOpen(false));

    return (
        <div
            ref={dropdownRef}
            className={`${styles.root} ${isChange ? styles.less : ""}`}
        >
            <div
                onClick={() => setOpen((prev) => !prev)}
                className={`${styles.title} ${isOpen ? styles.titleActive : ""}`}
            >
                <p className={styles.text}>{selected}</p>
                <img
                    className={`${styles.icon} ${isOpen ? styles.iconActive : ""}`}
                    src={chevronDown}
                    alt=""
                />
            </div>

            {isOpen && (
                <div
                    className={`${styles.select} ${isOpen ? styles.selectActive : ""}`}
                >
                    {children}
                </div>
            )}
        </div>
    );
};