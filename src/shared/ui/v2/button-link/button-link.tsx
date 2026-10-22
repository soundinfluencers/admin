import clsx from "clsx";
import { Link } from "react-router-dom";

import type { ButtonLinkProps } from "./button-link.types";

import s from "./button-link.module.scss";

export const ButtonLink = ({
  label,
  icon: Icon,
  variant = "base",
  size = "medium",
  fullWidth = false,
  className,
  ...props
}: ButtonLinkProps) => {
  const iconOnly = label === undefined;

  const linkClassName = clsx(
    s.link,
    s[variant],
    s[size],
    iconOnly ? s.iconOnly : s.text,
    fullWidth && s.fullWidth,
    className,
  );

  const content = (
    <>
      {Icon && (
        <span className={s.iconSlot} aria-hidden="true">
          <Icon focusable="false" />
        </span>
      )}

      {label !== undefined && (
        <span className={s.label}>{label}</span>
      )}
    </>
  );

  if (props.to !== undefined) {
    return (
      <Link {...props} className={linkClassName}>
        {content}
      </Link>
    );
  }

  return (
    <a {...props} className={linkClassName}>
      {content}
    </a>
  );
};
