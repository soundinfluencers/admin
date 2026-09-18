import React from "react";
import clsx from "clsx";
import { AccountCheckbox } from "./account-checkbox.tsx";
import { ACCOUNT_INFO_FIELDS } from "../../model/new-influencer-request-details.config.tsx";
import { SOCIAL_MEDIA_DARK_ICONS, SOCIAL_MEDIA_LABEL_MAP } from "@/widgets/requests/model/social-media.constants.ts";
import { formatCurrency } from "@/shared/libs/format/format-currency.ts";
import {
  parseCountries,
  type TParsedCountry,
  parseCommunityMusicGenres, parseThemeTopics, parseCreatorMusicGenres, parseCreatorContentFocus,
} from "../../model/new-influencer-request-details.parsers.ts";
import type { TInfluencerAccount, TRequestType } from "@/entities/requests/model/requests.types.ts";

import s from './account-info.module.scss';

interface AccountInfoProps {
  account: TInfluencerAccount;
  requestId: string;
  requestType: TRequestType;
  selectedAccount: boolean;
  onSelectedAccountChange: (accountId: string) => void;
  isRequestOpen: boolean;
}

const CHIP_KEYS = new Set<typeof ACCOUNT_INFO_FIELDS[number]['key']>([
  'creatorMusicGenres',
  'creatorContentFocus',
  'communityThemeTopics',
  'communityMusicGenres',
]);

const COMMUNITY_HIDDEN: Set<typeof ACCOUNT_INFO_FIELDS[number]['key']> = new Set(['creatorContentFocus', 'creatorMusicGenres']);
const CREATOR_HIDDEN: Set<typeof ACCOUNT_INFO_FIELDS[number]['key']> = new Set(['communityMusicGenres', 'communityThemeTopics']);

const CHIPS_TOP_THRESHOLD = 6;

export const AccountInfo: React.FC<AccountInfoProps> = ({
  account,
  requestId,
  requestType,
  selectedAccount,
  onSelectedAccountChange,
  isRequestOpen,
}) => {
  const isCommunity = account.profileCategory === 'community';
  const hiddenKeys = isCommunity ? COMMUNITY_HIDDEN : CREATOR_HIDDEN;

  const visibleFields = ACCOUNT_INFO_FIELDS.filter(({ key }) => !hiddenKeys.has(key));

  const renderChips = (chips: string[]) => {
    if (!chips.length) return <span>N/A</span>;
    return chips.map((chip, i) => (
      <span key={i} className={s.chip}>{chip}</span>
    ));
  };

  const getChipsCount = (
    key: typeof ACCOUNT_INFO_FIELDS[number]["key"],
  ): number => {
    switch (key) {
      case "communityMusicGenres":
        return account.communityMusicGenres?.length ?? 0;

      case "communityThemeTopics":
        return account.communityThemeTopics?.length ?? 0;

      case "creatorMusicGenres":
        return account.creatorMusicGenres?.length ?? 0;

      case "creatorContentFocus":
        return account.creatorContentFocus?.length ?? 0;

      case "countries":
        return account.countries.filter((c) => c.country).length;

      default:
        return 0;
    }
  };

  const renderCountries = (countries: TParsedCountry[]) => {
    if (!countries.length) return <span>N/A</span>;
    return countries.map(({ ordinal, label }) => (
      <div key={ordinal} className={s.countryRow}>
        <span className={s.countryOrdinal}>{ordinal}</span>
        <span className={s.chip}>{label}</span>
      </div>
    ));
  };

  const renderValue = (
    key: typeof ACCOUNT_INFO_FIELDS[number]["key"],
  ): React.ReactNode => {
    switch (key) {
      case "price":
        return formatCurrency(account.price, "EUR");

      case "initialPrice":
        return formatCurrency(account.initialPrice, account.currency);

      case "logoUrl":
        return account.logoUrl ? (
          <img
            className={s.logo}
            src={account.logoUrl}
            alt="logo"
            width={32}
            height={32}
          />
        ) : (
          "N/A"
        );

      case "communityMusicGenres":
        return renderChips(parseCommunityMusicGenres(account.communityMusicGenres));

      case "communityThemeTopics":
        return renderChips(parseThemeTopics(account.communityThemeTopics));

      case "creatorMusicGenres":
        return renderChips(parseCreatorMusicGenres(account.creatorMusicGenres));

      case "creatorContentFocus":
        return renderChips(parseCreatorContentFocus(account.creatorContentFocus));

      case "countries":
        return renderCountries(parseCountries(account.countries));

      default: {
        const val = account[key];
        const str = val != null ? String(val) : "";

        return str || "N/A";
      }
    }
  };

  return (
    <div className={s.root}>
      <div className={s.head}>
        <div className={s.titleBlock}>
          <img
            className={s.icon}
            src={SOCIAL_MEDIA_DARK_ICONS[account.socialMedia]}
            alt=""
            width={24}
            height={24}
            aria-hidden
          />
          <h3 className={s.title}>{SOCIAL_MEDIA_LABEL_MAP[account.socialMedia]}</h3>
        </div>

        {isRequestOpen && (
          <AccountCheckbox
            accountId={account.accountId}
            checked={selectedAccount}
            onCheckedChange={() => onSelectedAccountChange(account.accountId)}
          />
        )}
      </div>

      <ul className={s.fields}>
        {visibleFields.map(({ key, label, render }) => {
          const isChip = CHIP_KEYS.has(key);
          const isCountries = key === 'countries';
          const chipsCount = isChip ? getChipsCount(key) : 0;
          const isTopAlign = isChip && chipsCount > CHIPS_TOP_THRESHOLD;

          return (
            <li key={key} className={clsx(s.field, isTopAlign && s.field_top, key === 'logoUrl' && s.field_center)}>
              <span className={s.label}>{label}</span>
              <span className={clsx(s.value, isCountries && s.value_column)}>
                {render ? render(account, requestType, requestId) : renderValue(key)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
