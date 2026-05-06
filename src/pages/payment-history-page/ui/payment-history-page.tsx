import { usePaymentHistoryInfiniteQuery, usePaymentHistoryPageState } from "@/pages/payment-history-page";
import { PageBreadcrumbs } from "@/widgets/page-breadcrumbs";
import { PageTitle } from "@/widgets/page-title";
import { PaymentHistoryMatrix } from "@/widgets/payment-history/payment-history-matrix";
import { EMPTY_PAYMENT_HISTORY_MATRIX } from "@/pages/payment-history-page/model/use-payment-history-page-state.ts";
import { PaymentHistoryTollbar } from "@/widgets/payment-history/payment-history-tollbar";

import s from './payment-history-page.module.scss';

export const PaymentHistoryPage = () => {
  const {
    searchValue,
    queryParams,
    handleSearchChange,
  } = usePaymentHistoryPageState();

  const {
    matrix,
    isPending,
    isError,
    isFetchingNextPage,
    fetchNextAccountsPage,
    fetchNextCampaignsPage,
  } = usePaymentHistoryInfiniteQuery(queryParams);

  console.log("PaymentHistoryPage: matrix", matrix);

  const matrixData = matrix ?? EMPTY_PAYMENT_HISTORY_MATRIX;

  return (
    <div className={s.paymentHistoryPage}>
      <PageBreadcrumbs
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Payment History" },
        ]}
      />

      <div className={s.content}>
        <PageTitle title="Payment history" />

        <div className={s.tableWrapper}>
          <PaymentHistoryTollbar
            searchValue={searchValue}
            onSearchChange={handleSearchChange}
          />

          {isError ? (
            <div>Error loading Payment History. Please try again later.</div>
            ) : (
            <PaymentHistoryMatrix
              data={matrixData}
              isLoading={isPending}
              isFetching={isFetchingNextPage}
              onLoadMoreCampaigns={fetchNextCampaignsPage}
              onLoadMoreAccounts={fetchNextAccountsPage}
            />
          )}
        </div>
      </div>
    </div>
  );
};
