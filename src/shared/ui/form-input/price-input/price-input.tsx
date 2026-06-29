import { useMemo, useState } from "react";
import {
  type FieldValues,
  type Path,
  useController,
  useFormContext,
  useWatch,
} from "react-hook-form";
import type { TCurrency } from "@/shared/types/types.ts";
import { Input } from "@/shared/ui";

const getCurrencySymbol = (currency: TCurrency) => {
  switch (currency) {
    case "GBP":
      return "\u00A3";
    case "USD":
      return "\u0024";
    case "EUR":
    default:
      return "\u20AC";
  }
};

const sanitizePriceInput = (raw: string) => raw.replace(/\D/g, "");

interface PriceInputProps<T extends FieldValues> {
  name: Path<T>;
  currencyName: Path<T>;
  label?: string;
  placeholder?: string;
  autoComplete?: string;
  disabled?: boolean;
}

export function PriceInput<T extends FieldValues>({
  name,
  currencyName,
  label,
  placeholder,
  autoComplete,
  disabled = false,
}: PriceInputProps<T>) {
  const { control } = useFormContext<T>();

  const {
    field: { ref, value, onChange, onBlur },
    fieldState,
  } = useController({
    name,
    control,
  });

  const currency = useWatch({
    control,
    name: currencyName,
  }) as TCurrency;

  const [isFocused, setIsFocused] = useState(false);
  const [draft, setDraft] = useState("");

  const currencySymbol = useMemo(() => {
    return getCurrencySymbol(currency);
  }, [currency]);

  const stringValue = String(value ?? "");

  const displayValue = isFocused
    ? draft
    : stringValue !== ""
      ? `${stringValue}${currencySymbol}`
      : "";

  const placeholderValue = placeholder ?? `100${currencySymbol}`;

  const handleFocus = () => {
    setIsFocused(true);
    setDraft(stringValue);
  };

  const handleChange = (rawValue: string) => {
    const nextValue = sanitizePriceInput(rawValue);

    setDraft(nextValue);
    onChange(nextValue);
  };

  const handleBlur = () => {
    setIsFocused(false);

    if (!draft) {
      setDraft("");
      onChange("");
      onBlur();
      return;
    }

    const normalized = String(Math.max(0, Number(draft)));

    setDraft(normalized);
    onChange(normalized);
    onBlur();
  };

  return (
    <Input
      id={String(name)}
      name={String(name)}
      ref={ref}
      label={label}
      type="text"
      inputMode="numeric"
      value={displayValue}
      placeholder={placeholderValue}
      autoComplete={autoComplete}
      disabled={disabled}
      error={fieldState.error?.message}
      onFocus={handleFocus}
      onChange={(e) => handleChange(e.target.value)}
      onBlur={handleBlur}
    />
  );
}
