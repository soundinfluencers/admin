import clsx from "clsx";

import { Spinner } from "@/shared/ui/v2/spinner";

import type { ButtonProps } from "./button.types";

import s from "./button.module.scss";

export const Button = ({
  label,
  icon: Icon,
  isLoading,
  loadingLabel,
  reserveLabel,
  variant = "base",
  size = "medium",
  fullWidth = false,
  disabled = false,
  type = "button",
  className,
  ref,
  ...props
}: ButtonProps) => {
  const loading = isLoading === true;

  // even isLoading=false reserves space for the loading state
  const hasLoadingState =
    isLoading !== undefined || loadingLabel !== undefined;

  const pendingLabel = loadingLabel ?? label;
  const spinnerSize = {
    small: 14,
    medium: 16,
    large: 18,
  }[size];

  return (
    <button
      {...props}
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={clsx(
        s.button,
        s[variant],
        s[size],
        fullWidth && s.fullWidth,
        className,
      )}
    >
      <span className={s.contentStack}>
        <span
          className={clsx(
            s.content,
            loading && s.inactive,
          )}
          aria-hidden={loading || undefined}
        >
          {Icon && (
            <span
              className={s.iconSlot}
              aria-hidden="true"
            >
              <Icon focusable="false" />
            </span>
          )}

          <span className={s.label}>{label}</span>
        </span>

        {hasLoadingState && (
          <span
            className={clsx(
              s.content,
              !loading && s.inactive,
            )}
            aria-hidden={!loading || undefined}
          >
            <span
              className={s.iconSlot}
              aria-hidden="true"
            >
              {loading && (
                <Spinner size={spinnerSize} />
              )}
            </span>

            <span className={s.label}>
              {pendingLabel}
            </span>
          </span>
        )}

        {reserveLabel !== undefined && (
          <span
            className={clsx(s.content, s.inactive)}
            aria-hidden="true"
          >
            {Icon && <span className={s.iconSlot} />}
            <span className={s.label}>{reserveLabel}</span>
          </span>
        )}
      </span>
    </button>
  );
};
