import { useParams } from "react-router-dom";
import { useGetNewClientRequestQuery } from "@/entities/requests/client-requests/new-client";
import { UpdateNewClient } from "@/features/requests/update-new-client";
import { PageTitle } from "@/widgets/page-title";
import { PageBreadcrumbs } from "@/widgets/page-breadcrumbs";

import s from './new-client-request-page.module.scss';
import { NewClientMetaCard } from "@/widgets/requests/new-client-meta-card";

export const NewClientRequestPage = () => {
  const { requestId } = useParams();

  const { data, isPending, isError } = useGetNewClientRequestQuery(requestId);

  if (!requestId) return <div>Request id is missing or invalid.</div>;

  console.log(data, isPending, isError);

  return (
    <div className={s.newClientRequestPage}>
      <PageBreadcrumbs
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Requests", to: "/dashboard/requests" },
          { label: "Request from a new client" },
        ]}
      />

      <div className={s.content}>
        <PageTitle title="Request from a new client accounts"/>

        {isPending && (
          <div>Skeleton loader</div>
        )}

        {!isPending && isError && <div>Failed to load client request</div>}

        {!isPending && data && (
          <>
            <NewClientMetaCard data={data}/>

            <UpdateNewClient requestId={requestId}/>
          </>
        )}
      </div>
    </div>
  );
};
