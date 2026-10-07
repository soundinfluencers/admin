import { useController, useFormContext, type FieldValues, type Path } from "react-hook-form";
import { Input, type InputProps } from "@/shared/ui/v2/input-v2/input.tsx";

type TextInputProps<T extends FieldValues> = Omit<
  InputProps,
  "name" | "value" | "defaultValue" | "onChange" | "onBlur" | "error"
> & {
  name: Path<T>;
};

export function TextInput<T extends FieldValues>({
  name,
  type = "text",
  autoComplete = "off",
  disabled = false,
  ...props
}: TextInputProps<T>) {
  const { control } = useFormContext<T>();

  const {
    field: {
      ref,
      name: fieldName,
      value,
      onChange,
      onBlur,
      disabled: fieldDisabled,
    },
    fieldState: { error },
  } = useController({
    name,
    control,
    disabled,
  });

  return (
    <Input
      {...props}
      ref={ref}
      name={fieldName}
      type={type}
      autoComplete={autoComplete}
      disabled={fieldDisabled}
      value={(value ?? "") as string}
      onChange={(event) => onChange(event.target.value)}
      onBlur={onBlur}
      error={error?.message}
    />
  );
}


