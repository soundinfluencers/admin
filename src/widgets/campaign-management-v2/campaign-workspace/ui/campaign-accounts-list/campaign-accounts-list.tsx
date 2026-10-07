import { useState } from "react";
import { Link } from "react-router-dom";
import { SOCIAL_MEDIA_ICONS } from "@/shared/config/social-media-icons.ts";

import type { ICampaignDetails } from "@/entities/campaign/model/campaign-details.types.ts";

import Plus from "@/shared/assets/icons/plus.svg?react";
import Search from '@/shared/assets/icons/search.svg?react';

import s from './campaign-accounts-list.module.scss';

interface CampaignAccountsListProps {
  readOnly: boolean;
  accounts: ICampaignDetails["addedAccounts"];
  campaignContent: ICampaignDetails["campaignContent"];
  selectedAddedAccountsId: string | null;
  onAccountSelect: (addedAccountsId: string) => void;
}

export const CampaignAccountsList = ({
  readOnly,
  accounts,
  campaignContent,
  selectedAddedAccountsId,
  onAccountSelect,
}: CampaignAccountsListProps) => {
  const [search, setSearch] = useState("");

  const normalizedSearch = search.trim().toLowerCase();

  const filteredAccounts = accounts.filter((account) =>
    account.username.toLowerCase().includes(normalizedSearch),
  );
  
  const contentLabels = new Map(
    campaignContent.map((content, index) => [
      content._id,
      `Video ${index + 1}`,
    ]),
  )

  return (
    <div className={s.panel}>
      <div className={s.header}>
        <div className={s.titleGroup}>
          <h3 className={s.title}>Influencers</h3>
          <span className={s.total}>{accounts.length} total</span>
        </div>

        {!readOnly && (
          <Link
            className={s.add}
            to={""}
            aria-label="Add account"
            onClick={() => alert("Function don`t implemented yet!")}
          >
            <Plus className={s.icon}/>
            Add
          </Link>
        )}
      </div>

      <div className={s.searchContainer}>
        <div className={s.searchInner}>
          <Search className={s.searchIcon} />
          <input
            id="account-name-input"
            className={s.search}
            type="search"
            aria-label="Search accounts"
            placeholder="Search accounts"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoComplete="off"
            spellCheck="false"
          />
        </div>
      </div>


      <div className={s.scroll}>
        {filteredAccounts.length > 0 ? (
          <ul className={s.list}>
            {filteredAccounts.map((account) => {
              const isSelected = account.addedAccountsId === selectedAddedAccountsId;
              const contentId = account.selectedContent?.campaignContentItemId;
              const Icon = SOCIAL_MEDIA_ICONS[account.socialMedia];
              
              const contentLabel = contentId 
                ? contentLabels.get(contentId) ?? "No Content"
                : "No Content";
              
              return (
                <li key={account.addedAccountsId}>
                  <button
                    type="button"
                    className={s.account}
                    aria-pressed={isSelected}
                    onClick={() => onAccountSelect(account.addedAccountsId)}
                  >
                    <div className={s.meta}>
                      <span className={s.socialIcon}>
                        <Icon/>
                      </span>
                      <div className={s.text}>
                        <span className={s.username}>{account.username}</span>
                        <span className={s.followers}>{account.followers} followers</span>
                      </div>
                    </div>
                    
                    <span className={s.chip}>
                      {contentLabel}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        ) : (
          <p>
            {accounts.length === 0
              ? "No accounts in the campaign yet"
              : "No accounts found"}
          </p>
        )}
      </div>

    </div>
  );
};
