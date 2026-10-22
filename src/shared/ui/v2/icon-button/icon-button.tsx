import clsx from "clsx";

import { Spinner } from "@/shared/ui/v2/spinner";

import type { IconButtonProps } from "./icon-button.types";

import s from "./icon-button.module.scss";

const SPINNER_SIZE = {
  small: 16,
  medium: 16,
  large: 18,
} as const;

export const IconButton = ({
  icon: Icon,
  variant = "base",
  size = "small",
  isLoading = false,
  disabled = false,
  type = "button",
  className,
  ref,
  ...props
}: IconButtonProps) => {
  return (
    <button
      {...props}
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={clsx(
        s.button,
        s[variant],
        s[size],
        className,
      )}
    >
      <span className={s.iconSlot} aria-hidden="true">
        {isLoading ? (
          <Spinner size={SPINNER_SIZE[size]} />
        ) : Icon ? (
          <Icon focusable="false" />
        ) : null}
      </span>
    </button>
  );
};
