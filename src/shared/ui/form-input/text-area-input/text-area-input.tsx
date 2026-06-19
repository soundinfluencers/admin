import { useController, useFormContext, type FieldValues, type Path } from "react-hook-form";
import { TextArea } from "@/shared/ui";

interface BaseTextAreaProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  placeholder?: string;
  autoComplete?: string;
  disabled?: boolean;
  className?: string;
}

export function TextAreaInput<T extends FieldValues>({
  name,
  label,
  placeholder,
  autoComplete = 'off',
  disabled = false,
  className = "",
}: BaseTextAreaProps<T>) {
  const { control } = useFormContext<T>();
  const {
    field: { ref, value, onChange, onBlur },
    fieldState,
  } = useController({
    name,
    control,
  });

  return (
    <TextArea
      id={name}
      name={name}
      ref={ref}
      label={label}
      value={(value ?? "") as string}
      placeholder={placeholder}
      autoComplete={autoComplete}
      disabled={disabled}
      error={fieldState.error?.message}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      className={className}
    />
  );
}
