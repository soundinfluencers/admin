// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { type FieldValues, type Path, useController, useFormContext } from "react-hook-form";
import { ImageUpload } from "@/shared/ui/image-upload";
import { useUploadImageMutation } from "@/entities/file/model/use-upload-image-mutation.ts";

interface BaseImageUploadProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  placeholder?: string;
  disabled?: boolean;
}

export function BaseImageUpload<T extends FieldValues>({
  name,
  label,
  placeholder,
  disabled = false,
}: BaseImageUploadProps<T>) {
  const { control } = useFormContext<T>();

  const {
    field: { value, onChange },
    fieldState,
  } = useController({
    name,
    control,
  });

  const { mutate, isPending } = useUploadImageMutation();

  const handleFileSelect = async (file: File) => {
    console.log("File to upload", file);

    mutate(file, {
      onSuccess: ({ data }) => {
        onChange(data);
      }
    });
  };

  const handleRemove = () => {
    onChange(null);
  };

  return (
    <ImageUpload
      name={name}
      label={label}
      placeholder={placeholder}
      value={value ?? ""}
      error={fieldState.error?.message}
      disabled={disabled}
      isPending={isPending}
      onFileSelect={handleFileSelect}
      onRemove={handleRemove}
      size="sm"
    />
  );
}
