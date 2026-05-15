
//@ts-nocheck
import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import styles from "./campaign-managment-add-accounts.module.scss";
import { AddAccountsToolbar } from "@/widgets/campaign-management-add-accounts/add-accounts-toolbar/ui/add-accounts-toolbar";
import { FiltersPanel } from "@/features/campaign-management-add-accounts/filters-panel/ui/filters-panel";
import { AccountsList } from "@/widgets/campaign-management-add-accounts/accounts-list/ui/accounts-list";
import {
    useCampaignManagementAddAccountsStore,
} from "@/entities/campaign-managment-add-accounts/store/campaign-management-add-accounts.store";
import { useCampaignManagementStore } from "@/entities/campaign-managment/store/campaign-management.store";
import { fetchCampaignFilters } from "@/entities/campaign-managment-add-accounts/api/fetch-filters";
import { fetchFilteredSocialAccounts } from "@/entities/campaign-managment-add-accounts/api/fetch-social-accounts";
import { searchSocialAccounts } from "@/entities/campaign-managment-add-accounts/api/search-social-accounts";
import {
    buildFilterBody,
    calcSelectedTotal,
    ensureContentForAccounts,
    getSelectedSocialMedias,
    mapCardToEditableAccount,
} from "@/entities/campaign-managment-add-accounts/model/add-accounts.helpers";
import {
    AddAccountsFooter,
} from "@/widgets/campaign-management-add-accounts/add-accounts-footer/ui/add-accounts-footer.tsx";
import {NoData} from "@/shared/ui/no-array/no-data.tsx";

export const CampaignManagmentAddAccounts = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const campaignId = searchParams.get("id") ?? "";
    const status = searchParams.get("status") ?? "";
    const optionIndex = Number(searchParams.get("optionIndex") ?? 1);

    const {
        selected,
        sortBy,
        currency,
        budget,
        filterMethod,
        selectedCards,
        view,
        filtersOpen,
        setSortBy,
        setCurrency,
        setBudget,
        setFilterMethod,
        setView,
        setFiltersOpen,
        toggleCard,
        removeItem,
        toggleItem,
        initDefaultSocials,
        clearSelectedCards,
    } = useCampaignManagementAddAccountsStore();
    console.log("selectedCards", selectedCards);
    const editable = useCampaignManagementStore((s) => s.editable);
    const addAccounts = useCampaignManagementStore((s) => s.addAccounts);
    const addContentItem = useCampaignManagementStore((s) => s.addContentItem);
    const setAccountSelectedContent = useCampaignManagementStore(
        (s) => s.setAccountSelectedContent,
    );

    const [search, setSearch] = React.useState("");
    const [page] = React.useState(1);
    const [limit, setLimit] = React.useState(24);
    const [isLoadingMore, setIsLoadingMore] = React.useState(false);
    const loadMoreRef = React.useRef<HTMLDivElement | null>(null);

    const filtersQuery = useQuery({
        queryKey: ["campaign-management-filters"],
        queryFn: fetchCampaignFilters,
    });

    React.useEffect(() => {
        const socialBlock = filtersQuery.data?.data?.filterArr?.find(
            (item) => item.id === "social-platforms-1",
        );

        if (!socialBlock?.filters?.length) return;
        initDefaultSocials(socialBlock.filters);
    }, [filtersQuery.data, initDefaultSocials]);

    const socialMedias = React.useMemo(
        () => getSelectedSocialMedias(selected),
        [selected],
    );

    const filterBody = React.useMemo(
        () =>
            buildFilterBody({
                selected,
                budget,
                filterMethod,
            }),
        [selected, budget, filterMethod],
    );

    const isSearchMode = search.trim().length >= 2;

    const listQuery = useQuery({
        queryKey: [
            "campaign-management-social-accounts",
            page,
            limit,
            sortBy,
            currency,
            filterBody,
        ],
        queryFn: () =>
            fetchFilteredSocialAccounts({
                page,
                limit,
                sortBy,
                body: filterBody,
            }),
        enabled: socialMedias.length > 0 && !isSearchMode,
        placeholderData: (prev) => prev,
    });
    const searchQuery = useQuery({
        queryKey: [
            "campaign-management-social-accounts-search",
            search,
            socialMedias,
        ],
        queryFn: () =>
            searchSocialAccounts({
                query: search.trim(),
                socialMedias,
                page: 1,
                limit: 20,
            }),
        enabled: isSearchMode && socialMedias.length > 0,
    });

    const accounts = React.useMemo(() => {
        if (isSearchMode) {
            return searchQuery.data?.data?.accounts ?? [];
        }

        return listQuery.data?.data?.accounts ?? [];
    }, [isSearchMode, searchQuery.data, listQuery.data]);

    const canLoadMore =
        !isSearchMode &&
        accounts.length >= limit &&
        !listQuery.isFetching;

    React.useEffect(() => {
        if (!canLoadMore) return;

        const el = loadMoreRef.current;
        if (!el) return;

        const obs = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (!entry?.isIntersecting) return;

                setIsLoadingMore(true);
                setLimit((prev) => prev + 24);
            },
            {
                root: null,
                rootMargin: "100px 0px",
                threshold: 0,
            },
        );

        obs.observe(el);

        return () => obs.disconnect();
    }, [canLoadMore]);

    React.useEffect(() => {
        if (!listQuery.isFetching) {
            setIsLoadingMore(false);
        }
    }, [listQuery.isFetching]);

    const onCancel = React.useCallback(() => {
        navigate(
            `/dashboard/campaigns/campaign-management?id=${campaignId}&status=${status}&optionIndex=${optionIndex}`,
        );
    }, [navigate, campaignId, status, optionIndex]);

    const onAdd = React.useCallback(() => {
        if (!editable || selectedCards.length === 0) return;

        const mappedAccounts = selectedCards.map(mapCardToEditableAccount);

        const ensured = ensureContentForAccounts({
            accounts: mappedAccounts,
            campaignContent: editable.campaignContent,
            addContentItem,
        });

        const accountsWithSelected = mappedAccounts.map((account) => {
            const ensuredItem = ensured.get(String(account.socialMedia).toLowerCase());

            return {
                ...account,
                selectedCampaignContentItem: ensuredItem
                    ? {
                        campaignContentItemId: ensuredItem.contentId,
                        descriptionId: ensuredItem.firstDescriptionId,
                    }
                    : null,
            };
        });

        addAccounts(accountsWithSelected);

        accountsWithSelected.forEach((account) => {
            const key = String(account.addedAccountsId ?? account.socialAccountId);
            if (!key || !account.selectedCampaignContentItem) return;

            setAccountSelectedContent(key, account.selectedCampaignContentItem);
        });

        clearSelectedCards();
        onCancel();
    }, [
        editable,
        selectedCards,
        addContentItem,
        addAccounts,
        setAccountSelectedContent,
        clearSelectedCards,
        onCancel,
    ]);

    const activeQuery = isSearchMode ? searchQuery : listQuery;

    const isInitialLoading =

        activeQuery.isFetching && accounts.length === 0;
    const isFetchingMore = !isSearchMode && listQuery.isFetching && isLoadingMore;
    const isRefetching = !isSearchMode && listQuery.isFetching && !isLoadingMore && accounts.length > 0;

    return (
        <div className={styles.page}>
            <h2>Add influencer</h2>
            <AddAccountsToolbar
                search={search}
                setSearch={setSearch}
                budget={budget}
                setBudget={setBudget}
                currency={currency}
                setCurrency={setCurrency}
                sortBy={sortBy}
                setSortBy={setSortBy}
                view={view}
                setView={setView}
                filtersOpen={filtersOpen}
                toggleFilters={() => setFiltersOpen(!filtersOpen)}
                selected={selected}
                removeItem={removeItem}
            />

            <div
                className={`${styles.content} ${view === "table" ? styles.contentTable : ""}`}
            >
                {filtersOpen && (
                    <FiltersPanel
                        filters={filtersQuery.data?.data?.filterArr ?? []}
                        selected={selected}
                        filterMethod={filterMethod}
                        onChangeMethod={setFilterMethod}
                        onToggleItem={toggleItem}
                        onClose={() => setFiltersOpen(false)}
                        loading={filtersQuery.isLoading}
                    />
                )}

                {listQuery.isError || searchQuery.isError ? (
                    <NoData>
                        <h2>Failed to load social accounts</h2>
                        <p>Please try changing filters or search again.</p>
                    </NoData>
                ) :  <AccountsList
                    accounts={accounts}
                    selectedCards={selectedCards}
                    currency={currency}
                    view={view}
                    onToggleCard={toggleCard}
                    isLoading={isInitialLoading}
                    isFetchingMore={isFetchingMore}
                    isRefetching={isRefetching}
                />}
            </div>
            {/*{!isSearchMode && canLoadMore && (*/}
            {/*    <div ref={loadMoreRef} className={styles.loadMoreTrigger}>*/}
            {/*        {listQuery.isFetching ? "Loading…" : "Scroll to load more"}*/}
            {/*    </div>*/}
            {/*)}*/}

            <AddAccountsFooter
                selectedCount={selectedCards.length}
                totalPrice={calcSelectedTotal(selectedCards, currency)}
                currency={currency}
                onCancel={onCancel}
                onAdd={onAdd}
            />
        </div>
    );
};