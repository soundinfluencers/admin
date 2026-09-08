
import { useSearchParams } from "react-router-dom";
import filterIcon from "../assets/filter (1).svg";

import styles from "./build-campaign.module.scss";
import { useBuildCampaignView } from "../model/use-build-campaign-view";
import { SearchInput } from "@/features/admin-create-campaign/build-campaign-filters/ui/search-input";
import { BudgetSelect } from "@/features/admin-create-campaign/build-campaign-filters/ui/budget-select";
import { SortSelect } from "@/features/admin-create-campaign/build-campaign-filters/ui/sort-select";
import { SelectedFilters } from "@/features/admin-create-campaign/build-campaign-filters/ui/selected-filters";
import { ViewSwitch } from "@/features/admin-create-campaign/build-campaign-filters/ui/view-switch";
import { FilterPanel } from "@/features/admin-create-campaign/build-campaign-filters/ui/filter-panel";
import { getSocialMediaIcon } from "@/shared/libs/get-social-media-icon";
import type { SocialMedia } from "@/entities/campaign-managment/model/campaign.managment";
import type {
    CampaignCurrencyCode,
} from "@/entities/admin-create-campaign/campaign-filter/model/campaign-filter.types";
import type {
    PromoAccount,
} from "@/entities/admin-create-campaign/promo-accounts/model/promo-account.types";
import { NoData } from "@/shared/ui/no-array/no-data";
import { CardsContainer } from "@/widgets/admin-create-campaign/build-campaign/components/cards-container";

const getExactPresetPrice = (
    account: PromoAccount,
    currency: CampaignCurrencyCode,
) => {
    const price = account.prices[currency];

    return typeof price === "number" && Number.isFinite(price) ? price : null;
};

export const BuildCampaign = () => {
    const [searchParams] = useSearchParams();

    const campaignId = searchParams.get("id") ?? "";

    const isAttachMode = Boolean(campaignId);

    const {
        ddRef,
        loadMoreRef,
        isSearchMode,
        isDropdownOpen,
        search,
        setSearch,
        searchLoading,
        searchFetching,
        searchError,
        searchRefetch,
        searchResults,
        onPickSearchItem,
        filterPanelOpen,
        setPanelOpen,
        selectedBudget,
        selectedCurrency,
        selectedCurrencyCode,
        setBudget,
        setCurrency,
        selectedSort,
        setSort,
        selected,
        removeSelectedTag,
        view,
        setView,
        isSmall,
        setIsSmall,
        filtersSections,
        filtersLoading,
        selectedFilterIds,
        onToggleFilter,
        filterMethod,
        setMethod,
        promoError,
        isEmpty,
        displayCards,
        isInitialLoading,
        isFetchingMore,
        isRefetching,
        promoFetching,
    } = useBuildCampaignView(isAttachMode);

    const selectableSearchResults = isAttachMode
        ? searchResults
        : searchResults.filter(
            (account) => getExactPresetPrice(account, selectedCurrencyCode) !== null,
        );
    const selectableDisplayCards = isAttachMode
        ? displayCards
        : displayCards.filter(
            (account) => getExactPresetPrice(account, selectedCurrencyCode) !== null,
        );
    const hasNoSelectableCards =
        !isAttachMode &&
        !isInitialLoading &&
        displayCards.length > 0 &&
        selectableDisplayCards.length === 0;

    return (
        <div className={styles.root}>
            <div className={styles.title}>
                <h2>
                    {isAttachMode
                        ? "Add influencers to existing campaign"
                        : "Build your custom campaign"}
                </h2>
                <p>
                    Handpick networks, genres, and budgets to tailor your campaign
                </p>
            </div>

            <div className={styles.content}>
                <div className={styles.toolbar}>
                    <div className={styles.toolbarFiltersInput}>
                        <button
                            type="button"
                            onClick={() => setPanelOpen(!filterPanelOpen)}
                            className={`${styles.filterFlag} ${
                                filterPanelOpen ? styles.active : ""
                            }`}
                        >
                            <img src={filterIcon} alt="" />
                            <p>Filters</p>
                        </button>

                        <div ref={ddRef} className={styles.searchWithDropdown}>
                            <SearchInput
                                active={isSearchMode}
                                onChange={setSearch}
                                value={search}
                            />

                            {isSearchMode && isDropdownOpen && (
                                <div className={styles.searchDropdown}>
                                    {searchLoading || searchFetching ? (
                                        <div className={styles.searchDropdownItem}>Loading…</div>
                                    ) : searchError ? (
                                        <div className={styles.searchDropdownItem}>
                                            Failed to search
                                            <button onClick={() => searchRefetch()}>Retry</button>
                                        </div>
                                    ) : selectableSearchResults.length > 0 ? (
                                        selectableSearchResults.map((account) => (
                                            <div
                                                key={account.accountId}
                                                className={styles.searchDropdownItem}
                                                onClick={() => onPickSearchItem(account)}
                                            >
                                                <div className={styles.searchTitle}>
                                                    <img
                                                        src={
                                                            getSocialMediaIcon(
                                                                account.socialMedia as SocialMedia,
                                                            ) || undefined
                                                        }
                                                        alt=""
                                                    />
                                                    <p>{account.username}</p>
                                                </div>
                                                <div className={styles.price}>
                                                    {isAttachMode
                                                        ? account.prices.EUR ?? 0
                                                        : getExactPresetPrice(
                                                            account,
                                                            selectedCurrencyCode,
                                                        )}
                                                    {isAttachMode ? "€" : selectedCurrency.key}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className={styles.searchDropdownItem}>No results</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={styles.selects}>
                        <BudgetSelect
                            budgetSelected={selectedBudget || 0}
                            currencySelected={selectedCurrency}
                            setBudget={setBudget}
                            setCurrency={setCurrency}
                        />
                        <SortSelect
                            selectedSort={selectedSort}
                            setSelectedSort={setSort}
                        />
                    </div>
                </div>

                <div className={styles.viewAndFilters}>
                    <SelectedFilters
                        selected={selected}
                        onRemove={removeSelectedTag}
                    />

                    <ViewSwitch
                        className={styles.viewSwitcher}
                        view={view}
                        setView={setView}
                    />
                </div>

                <div
                    className={`${styles.functional} ${
                        isSmall ? styles.tableAdaptive : ""
                    }`}
                >
                    {filterPanelOpen && (
                        <FilterPanel
                            isSmall={isSmall}
                            onToggle={() => setPanelOpen(false)}
                            sections={filtersSections}
                            isLoading={filtersLoading}
                            selectedIds={selectedFilterIds}
                            onToggleFilter={onToggleFilter}
                            filterMethod={filterMethod}
                            setFilterMethod={setMethod}
                        />
                    )}

                    {promoError || isEmpty || hasNoSelectableCards ? (
                        <NoData>
                            <h2>No SocialAccounts for this filter right now</h2>
                            <p>Please change filters or search again.</p>
                        </NoData>
                    ) : (
                        <CardsContainer
                            promosCards={selectableDisplayCards}
                            isSmall={isSmall}
                            setIsSmall={setIsSmall}
                            view={view}
                            isInitialLoading={isInitialLoading}
                            isFetchingMore={isFetchingMore}
                            isRefetching={isRefetching}
                            isAttachMode={isAttachMode}
                            selectedCurrencyCode={selectedCurrencyCode}
                        />
                    )}
                </div>
            </div>

            {!isSearchMode && (
                <div
                    ref={loadMoreRef}
                    style={{
                        margin: "16px auto",
                        maxWidth: "250px",
                        padding: "12px 0",
                        textAlign: "center",
                        opacity: promoFetching ? 0.6 : 1,
                    }}
                />
            )}
        </div>
    );
};
