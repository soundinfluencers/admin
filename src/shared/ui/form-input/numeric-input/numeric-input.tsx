import { useController, useFormContext, type FieldValues, type Path } from "react-hook-form";
import { Input } from "@/shared/ui";

const sanitizeIntegerInput= (raw: string) => raw.replace(/\D/g, "");
const sanitizeDecimalInput= (raw: string) => {
  let s = raw.replace(/,/g, ".").replace(/[^\d.-]/g, "");

  s = s.replace(/(?!^)-/g, "");

  const firstDot = s.indexOf(".");
  if (firstDot !== -1) {
    s = s.slice(0, firstDot + 1) + s.slice(firstDot + 1).replace(/\./g, "");
  }

  return s;
};

interface NumericInputProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  placeholder?: string;
  autoComplete?: string;
  disabled?: boolean;
  allowDecimal?: boolean;
}

export function NumericInput<T extends FieldValues>({
  name,
  label,
  placeholder,
  autoComplete,
  disabled = false,
  allowDecimal = false,
}: NumericInputProps<T>) {
  const { control } = useFormContext<T>();
  const {
    field: { ref, value, onChange, onBlur },
    fieldState,
  } = useController({
    name,
    control,
  });

  const handleChange = (rawValue: string) => {
    const nextValue = allowDecimal
      ? sanitizeDecimalInput(rawValue)
      : sanitizeIntegerInput(rawValue);

    if (nextValue === "") {
      onChange(null);
      return;
    }

    onChange(nextValue);
  };

  return (
    <Input
      id={name}
      name={name}
      ref={ref}
      label={label}
      type={"text"}
      inputMode={allowDecimal ? "decimal" : "numeric"}
      value={(value ?? "") as string}
      placeholder={placeholder}
      autoComplete={autoComplete}
      disabled={disabled}
      error={fieldState.error?.message}
      onChange={(e) => handleChange(e.target.value)}
      onBlur={onBlur}
    />
  );
}
