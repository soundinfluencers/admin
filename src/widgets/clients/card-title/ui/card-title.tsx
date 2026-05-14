import React from "react";

import s from './card-title.module.scss';

interface CardTitleProps {
  title: string;
  rightSlot?: React.ReactNode;
}

export const CardTitle: React.FC<CardTitleProps> = ({ rightSlot, title }) => {
  return (
    <h2 className={s.title}>
      {title}
      {rightSlot && (
        rightSlot
      )}
    </h2>
  );
};
