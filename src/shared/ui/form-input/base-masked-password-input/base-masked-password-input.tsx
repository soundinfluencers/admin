import { useState } from "react";
import { useController, useFormContext, type FieldValues, type Path } from "react-hook-form";
import { Input } from "@/shared/ui";
import clsx from "clsx";

import eye from '@/assets/icons/eye.svg';
import closeEye from '@/assets/icons/eye-off.svg';

import s from './base-masked-password-input.module.scss';

interface BaseMaskedPasswordInputProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  placeholder?: string;
  autoComplete?: string;
  disabled?: boolean;
}

export function BaseMaskedPasswordInput<T extends FieldValues>({
  name,
  label,
  placeholder,
  autoComplete,
  disabled = false,
}: BaseMaskedPasswordInputProps<T>) {
  const { control } = useFormContext<T>();
  const {
    field: { ref, value, onChange, onBlur },
    fieldState,
  } = useController({
    name,
    control,
  });

  const [isVisible, setIsVisible] = useState(false);
  const hasValue = Boolean(value?.toString()?.length);

  return (
    <Input
      id={name}
      name={name}
      className={s.input}
      ref={ref}
      label={label}
      type={isVisible ? "text" : "password"}
      value={(value ?? "") as string}
      placeholder={placeholder}
      autoComplete={autoComplete}
      disabled={disabled}
      error={fieldState.error?.message}
      onChange={onChange}
      onBlur={onBlur}
      rightSlot={
        hasValue ? (
          <button
            className={clsx(s.showBtn)}
            type="button"
            onClick={() => setIsVisible((prev) => !prev)}
          >
            <img
              src={isVisible ? closeEye : eye}
              alt={isVisible ? "Hide password" : "Show password"}
            />
          </button>
        ) : null
      }
    />
  );
}
