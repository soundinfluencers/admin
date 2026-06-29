import {
  useController,
  useFormContext,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { CheckboxTree } from "@/shared/ui/checkbox-tree/checkbox-tree.tsx";
import type { NestedOption } from "@/shared/ui/checkbox-tree/checkbox-tree.types";

interface CheckboxTreeFieldProps<T extends FieldValues> {
  name: Path<T>;
  options: NestedOption[];
  variant?: "creator" | "community";
  disabled?: boolean;
}

export function CheckboxTreeField<T extends FieldValues>({
  name,
  options,
  variant,
  disabled = false,
}: CheckboxTreeFieldProps<T>) {
  const { control } = useFormContext<T>();

  const {
    field: { value, onChange },
  } = useController({
    name,
    control,
  });

  return (
    <CheckboxTree
      options={options}
      selectedValues={(value ?? []) as string[]}
      disabled={disabled}
      variant={variant}
      onChange={onChange}
    />
  );
}
