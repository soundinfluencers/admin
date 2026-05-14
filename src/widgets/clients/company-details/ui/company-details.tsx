import React from "react";
import { CardTitle } from "@/widgets/clients/card-title";
import { CompanyFieldsCard } from "@/widgets/clients/company-details/ui/company-fields-card.tsx";
import { DeleteClientAccount } from "@/features/clients/delete-client-account";
import { leftFields, rightFields, noteField } from "@/widgets/clients/company-details/model/company-details-fields.tsx";
import type { IClientDetails } from "@/entities/client/model/client.types.ts";

import s from './company-details.module.scss';

interface CompanyDetailsProps {
  data: IClientDetails;
}

export const CompanyDetails: React.FC<CompanyDetailsProps> = ({ data }) => {
  return (
    <div className={s.companyDetails}>
      <CardTitle
        title={'Company Details'}
        rightSlot={<DeleteClientAccount clientId={data.clientId} />}
      />

      <div className={s.wrapper}>
        <CompanyFieldsCard data={data} fields={leftFields} />
        <CompanyFieldsCard data={data} fields={rightFields} />
      </div>

      <CompanyFieldsCard data={data} fields={noteField} />
    </div>
  )
};
