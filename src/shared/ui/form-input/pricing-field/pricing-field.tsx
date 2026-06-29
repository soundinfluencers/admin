import { type FieldValues, type Path, useFormContext } from "react-hook-form";
import { CurrencySelectField, PriceInput } from "@/shared/ui";
import clsx from "clsx";

import s from './pricing-field.module.scss';

interface PricingFieldProps<T extends FieldValues> {
  label: string;
  placeholder: string;
  priceName: Path<T>;
  currencyName: Path<T>;
}

export function PricingField<T extends FieldValues>({
  label,
  placeholder,
  priceName,
  currencyName,
}: PricingFieldProps<T>) {
  const { getFieldState, formState } = useFormContext<T>();
  const { error: priceError } = getFieldState(priceName, formState);

  return (
    <div className={s.pricingField}>
      <label
        htmlFor={String(priceName)}
        className={clsx(s.priceLabel, priceError && s.priceLabelError)}
      >
        {label}
      </label>

      <CurrencySelectField<T>
        name={currencyName}
      />
      <PriceInput<T>
        name={priceName}
        currencyName={currencyName}
        placeholder={placeholder}
        autoComplete="off"
      />
    </div>
  );
}

