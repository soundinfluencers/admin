import { useClientQuery } from "@/entities/client/api/use-client-query.ts";
import { useParams } from "react-router-dom";

import { PageBreadcrumbs } from "@/shared/ui/page-breadcrumbs";
import { PageTitle } from "@/widgets/page-title";
import { CompanyDetails } from "@/widgets/clients/company-details/ui/company-details.tsx";
import { CompanyCampaigns } from "@/widgets/clients/campaigns-status";

import styles from './company-details-page.module.scss';

export const CompanyDetailsPage = () => {
  const { clientId } = useParams();

  const { data, isLoading, isError, error } = useClientQuery(clientId);

  console.log('Client details data', data, isLoading, isError, error);

  if (!clientId) {
    return <div>Client id is missing.</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading client. Please try again later.</div>;
  }

  if (!data) {
    return <div>Client not found.</div>;
  }

  console.log('Client details data', data);

  return (
    <div className={styles.companyDetailsPage}>
      <PageBreadcrumbs
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Clients list", to: "/dashboard/clients" },
          { label: "Company details" },
        ]}
      />

      <div className={styles.content}>
        <div className={styles.header}>
          <PageTitle title={'Acenti'} />

          <CompanyDetails data={data} />
        </div>

        <div className={styles.campaigns}>
          <CompanyCampaigns data={data.campaignsActive} title={'Campaigns active'} />
          <CompanyCampaigns data={data.campaignsCompleted} title={'Campaigns completed'} />
        </div>
      </div>
    </div>
  );
};
