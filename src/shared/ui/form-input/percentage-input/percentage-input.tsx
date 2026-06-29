import { useState } from "react";
import { useController, useFormContext, type FieldValues, type Path } from "react-hook-form";
import { Input } from "@/shared/ui";

const sanitizePercentageInput = (raw: string) => {
  const normalized = raw.replace(/,/g, ".");

  if (!/^\d{0,3}(\.\d{0,2})?$/.test(normalized)) {
    return null;
  }

  if (normalized !== "" && normalized !== "." && Number(normalized) > 100) {
    return null;
  }

  return normalized;
};

interface PercentageInputProps<T extends FieldValues> {
  name: Path<T>;
  label?: string;
  placeholder?: string;
  className?: string;
  autoComplete?: string;
  disabled?: boolean;
}

export function PercentageInput<T extends FieldValues>({
  name,
  label,
  placeholder,
  className,
  autoComplete,
  disabled = false,
}: PercentageInputProps<T>) {
  const { control } = useFormContext<T>();

  const {
    field: { ref, value, onChange, onBlur },
    fieldState,
  } = useController({
    name,
    control,
  });

  const [isFocused, setIsFocused] = useState(false);
  const [draft, setDraft] = useState("");

  const stringValue = String(value ?? "");

  const displayValue = isFocused
    ? draft
    : stringValue !== ""
      ? `${stringValue}%`
      : "";

  const handleFocus = () => {
    setIsFocused(true);
    setDraft(stringValue);
  };

  const handleChange = (rawValue: string) => {
    const nextValue = sanitizePercentageInput(rawValue);

    if (nextValue === null) return;

    setDraft(nextValue);
    onChange(nextValue);
  };

  const handleBlur = () => {
    setIsFocused(false);

    if (draft === "" || draft === ".") {
      setDraft("");
      onChange("");
      onBlur();
      return;
    }

    const normalizedNumber = Math.min(100, Number(draft));
    const normalizedString = String(normalizedNumber);

    setDraft(normalizedString);
    onChange(normalizedString);
    onBlur();
  };

  return (
    <Input
      id={String(name)}
      name={String(name)}
      ref={ref}
      label={label}
      className={className}
      type="text"
      inputMode="decimal"
      value={displayValue}
      placeholder={placeholder}
      autoComplete={autoComplete}
      disabled={disabled}
      error={fieldState.error?.message}
      onFocus={handleFocus}
      onChange={(e) => handleChange(e.target.value)}
      onBlur={handleBlur}
    />
  );
}
