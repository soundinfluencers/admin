import check from "../assets/check.svg";
import styles from "./account-checkbox.module.scss";

type Props = {
    label: string;
    checked?: boolean;
    onChange?: (checked: boolean) => void;
};

export const AccountCheckbox = ({
                                    label,
                                    checked = false,
                                    onChange,
                                }: Props) => {
    return (
        <label className={styles.root} onClick={(e) => e.stopPropagation()}>
            <div className={styles.inputWrap}>
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange?.(e.target.checked)}
                />
                <img
                    className={`${styles.icon} ${checked ? styles.iconChecked : ""}`}
                    src={check}
                    alt=""
                />
            </div>

            <span className={styles.label}>{label}</span>
        </label>
    );
};