import React from "react";
import { CardTitle } from "@/widgets/requests/card-title";
import {
  NEW_CLIENT_REQUEST_FIELDS,
} from "@/widgets/requests/new-client-meta-card/model/new-client-meta-card.config.ts";
import clsx from "clsx";
import type { INewClient } from "@/entities/requests/client-requests/new-client";

import instagram from '@/assets/icons/requests/instagram.svg';

import s from './new-client-meta-card.module.scss';

interface NewClientMetaCardProps {
  data: INewClient;
}

export const NewClientMetaCard: React.FC<NewClientMetaCardProps> = ({
  data,
}) => {
  return (
    <div className={s.card}>
      <CardTitle
        title={'Instagram'}
        icon={instagram}
      />
      <ul className={s.fieldsList}>
        {NEW_CLIENT_REQUEST_FIELDS.map(({ key, label }) => {
          const value = data[key];

          return (
            <li key={key} className={s.item}>
              <span className={s.label}>{label}</span>
              {key === 'instagramUsername' && value && (
                <a
                  className={clsx(s.value, s.link)}
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {value}
                </a>
              )}

              {key === 'email' && value && (
                <a
                  className={clsx(s.value, s.link)}
                  href={`mailto:${value}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {value}
                </a>
              )}

              {key !== 'instagramUsername' && key !== 'email' && (
                <span className={s.value}>{value ?? "N/A"}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
