import React from "react";
import clsx from "clsx";
import s from './form-block-header.module.scss';

interface FormBlockHeaderProps {
  title?: string;
  subtitle?: string;
  error?: string;
}

export const FormBlockHeader: React.FC<FormBlockHeaderProps> = ({
  title,
  subtitle,
  error,
}) => {

  return (
    <div className={s.header}>
      <h2 className={clsx(s.title, error && s.error)}>
        {title}
        <p className={s.errorMessage}>{error}</p>
      </h2>
      <span className={s.subtitle}>{subtitle}</span>
    </div>
  );
};
