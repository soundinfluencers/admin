import type { ReactNode } from "react";

import s from './metric-card.module.scss';

interface MetricCardProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}

export const MetricCard = ({
  title,
  icon,
  children,
}: MetricCardProps) => {
  
  return (
    <div className={s.card}>
      <div className={s.header}>
        <h3 className={s.title}>{title}</h3>

        <span className={s.icon} aria-hidden="true">
          {icon}
        </span>
      </div>
      
      {children}
    </div>
  );
};
