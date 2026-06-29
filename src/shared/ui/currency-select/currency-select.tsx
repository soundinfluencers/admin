import {
  type ComponentPropsWithoutRef,
  type ReactNode,
  useId,
} from "react";
import clsx from "clsx";

import type { TCurrency } from "@/shared/types/types.ts";

import s from "./currency-select.module.scss";

export interface CurrencySelectOption {
  value: TCurrency;
  label: ReactNode;
  disabled?: boolean;
}

const CURRENCY_SELECT_OPTIONS: CurrencySelectOption[] = [
  { value: "GBP", label: "£" },
  { value: "USD", label: "$" },
  { value: "EUR", label: "€" },
];

interface BaseCurrencySelectProps
  extends Omit<ComponentPropsWithoutRef<"div">, "onChange"> {
  value?: TCurrency | null;
  onChange: (value: TCurrency) => void;
  options?: CurrencySelectOption[];
  name?: string;
  disabled?: boolean;
  optionClassName?: string;
}

export const BaseCurrencySelect = ({
  value,
  onChange,
  options = CURRENCY_SELECT_OPTIONS,
  name,
  disabled = false,
  optionClassName = "",
  className,
  ...rest
}: BaseCurrencySelectProps) => {
  const generatedName = useId();
  const generatedId = useId();

  const groupName = name ?? generatedName;

  return (
    <div className={clsx(s.currencySelector, className)} {...rest}>
      {options.map((currency) => {
        const inputId = `${generatedId}-${currency.value}`;
        const isDisabled = disabled || currency.disabled;
        const isSelected = value === currency.value;

        return (
          <label
            htmlFor={inputId}
            className={clsx(
              s.option,
              optionClassName,
              isSelected && s.selected,
              isDisabled && s.disabled,
            )}
            key={currency.value}
          >
            <input
              type="radio"
              id={inputId}
              name={groupName}
              value={currency.value}
              checked={isSelected}
              onChange={() => onChange(currency.value)}
              className={s.input}
              disabled={isDisabled}
            />

            <span className={s.label}>{currency.label}</span>
          </label>
        );
      })}
    </div>
  );
};
