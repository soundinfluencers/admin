import { type FieldValues, type Path, useController, useFormContext } from "react-hook-form";
import { useUploadImageMutation } from "@/entities/file";
import { ImageUpload } from "@/shared/ui/image-upload";

interface ImageUploadFieldProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  size?: 'sm' | 'lg';
}

export function ImageUploadField<T extends FieldValues>({
  name,
  label,
  placeholder,
  disabled = false,
  size = 'sm',
}: ImageUploadFieldProps<T>) {
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
    onChange("");
  };

  return (
    <ImageUpload
      name={name}
      label={label}
      placeholder={placeholder}
      value={value}
      error={fieldState.error?.message}
      disabled={disabled}
      isPending={isPending}
      onFileSelect={handleFileSelect}
      onRemove={handleRemove}
      size={size}
    />
  );
}
