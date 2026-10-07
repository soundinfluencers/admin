import clsx from "clsx";
import { type ComponentPropsWithoutRef, forwardRef, type ReactNode, useId } from "react";

import CircleAlertIcon from "@/shared/assets/icons/circle-alert.svg?react";

import s from './input.module.scss';

export interface InputProps extends ComponentPropsWithoutRef<"input"> {
  label?: string;
  error?: string;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  rootClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className,
    rootClassName,
    label, 
    error, 
    id, 
    name, 
    leftSlot, 
    rightSlot,
    "aria-invalid": ariaInvalid,
    "aria-describedby": ariaDescribedBy,
    ...props 
  }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;

    const describedBy =
      [ariaDescribedBy, error ? errorId : undefined]
      .filter(Boolean)
      .join(" ") || undefined;

    return (
      <div className={clsx(s.root, rootClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className={clsx(s.label, error && s.labelError)}
          >
            {label}
          </label>
        )}

        <div className={clsx(s.control, error && s.controlError)}>
          {leftSlot && <div className={s.slot}>{leftSlot}</div>}

          <input
            ref={ref}
            id={inputId}
            name={name}
            className={clsx(s.input, className)}
            aria-invalid={error ? true : ariaInvalid}
            aria-describedby={describedBy}
            {...props}
          />

          {rightSlot && <div className={s.slot}>{rightSlot}</div>}
        </div>

        {error && (
          <span id={errorId} className={s.error}>
            <CircleAlertIcon aria-hidden="true" />
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
