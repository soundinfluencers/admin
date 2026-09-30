import type { ReactNode } from "react";

import s from './edit-section.module.scss';

interface EditSectionProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export const EditSection = ({
  children,
  title,
  subtitle,
}: EditSectionProps) => {
  
  return (
    <div className={s.section}>
      <div className={s.intro}>
        <h4 className={s.title}>{title}</h4>
        <p className={s.subtitle}>{subtitle}</p>
      </div>

      {children}
    </div>
  );
};
