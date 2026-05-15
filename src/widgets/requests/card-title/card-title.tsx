import React from "react";

interface CardTitleProps {
  title: string
  icon?: string
}

import s from './card-title.module.scss';

export const CardTitle: React.FC<CardTitleProps> = ({
  title,
  icon,
}) => {
  return (
    <div className={s.wrapper}>
      {icon && (
        <img
          src={icon}
          alt=""
          className={s.icon}
          width={24}
          height={24}
        />
      )}

      <p className={s.title}>{title}</p>
    </div>
  );
};
