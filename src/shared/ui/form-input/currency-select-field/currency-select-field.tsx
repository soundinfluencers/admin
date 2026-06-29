import {
  type FieldValues,
  type Path,
  useController,
  useFormContext,
} from "react-hook-form";

import { BaseCurrencySelect } from "@/shared/ui/currency-select";
import type { TCurrency } from "@/shared/types/types.ts";

interface CurrencySelectFieldProps<T extends FieldValues> {
  name: Path<T>;
  disabled?: boolean;
  className?: string;
}

export function CurrencySelectField<T extends FieldValues>({
  name,
  disabled = false,
  className,
}: CurrencySelectFieldProps<T>) {
  const { control } = useFormContext<T>();

  const {
    field: { value, onChange, name: fieldName },
    fieldState,
  } = useController({
    name,
    control,
  });

  return (
    <BaseCurrencySelect
      name={fieldName}
      value={value as TCurrency}
      onChange={onChange}
      disabled={disabled}
      className={className}
      aria-invalid={fieldState.invalid || undefined}
    />
  );
}
