import React from "react";
import clsx from "clsx";

import s from './page-title.module.scss';

interface PageTitleProps {
  title: string;
  subtitle?: string;
  className?: string;
  subtitleClassName?: string;
}

export const PageTitle: React.FC<PageTitleProps> = ({
  title,
  subtitle,
  className,
  subtitleClassName,
}) => {
  return (
    <div className={clsx(s.container, className)}>
      <h1 className={s.title}>{title}</h1>
      {subtitle && <p className={subtitleClassName}>{subtitle}</p>}
    </div>
  );
};
