import type { ReactNode } from "react";
import clsx from "clsx";

import s from './editor-field.module.scss';

interface EditorFieldProps {
  label: string;
  htmlFor: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

export const EditorField = ({
  label,
  htmlFor,
  action,
  children,
  className = "",
}: EditorFieldProps) => {
  
  return (
    <div className={clsx(s.field, className)}>
      <div className={s.header}>
        <label htmlFor={htmlFor}>{label}</label>
        {action}
      </div>

      {children}
    </div>
  );
};
