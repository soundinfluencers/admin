import React from "react";

type Props = {
    value?: number | null;
    canEdit?: boolean;
    onChange?: (value: number | null) => void;
};

export const MetricCell = ({ value, canEdit = false, onChange }: Props) => {
    const [inputValue, setInputValue] = React.useState(
        value !== null && value !== undefined ? String(value) : "",
    );

    const [isFocused, setIsFocused] = React.useState(false);

    React.useEffect(() => {
        if (isFocused) return;

        setInputValue(value !== null && value !== undefined ? String(value) : "");
    }, [value, isFocused]);

    const commitValue = React.useCallback(() => {
        const trimmed = inputValue.trim();

        if (trimmed === "") {
            onChange?.(null);
            return;
        }

        const parsed = Number(trimmed);

        if (!Number.isFinite(parsed)) {
            onChange?.(null);
            return;
        }

        onChange?.(parsed);
    }, [inputValue, onChange]);

    if (!canEdit) {
        return <p>{value ?? "-"}</p>;
    }

    return (
        <input
            type="text"
            inputMode="decimal"
            value={inputValue}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onFocus={() => {
                setIsFocused(true);

                if (Number(value ?? 0) === 0 && inputValue === "0") {
                    setInputValue("");
                }
            }}
            onChange={(e) => {
                const nextValue = e.target.value;

                if (!/^\d*\.?\d*$/.test(nextValue)) return;

                setInputValue(nextValue);
            }}
            onBlur={() => {
                setIsFocused(false);

                if (inputValue.trim() === "") {
                    setInputValue(value !== null && value !== undefined ? String(value) : "");
                    return;
                }

                commitValue();
            }}
            onKeyDown={(e) => {
                e.stopPropagation();

                if (e.key === "Enter") {
                    e.currentTarget.blur();
                }

                if (e.key === "Escape") {
                    setInputValue(
                        value !== null && value !== undefined ? String(value) : "",
                    );
                    e.currentTarget.blur();
                }
            }}
            style={{
                width: "100%",
                background: "transparent",
                border: "none",
                outline: "none",
            }}
        />
    );
};