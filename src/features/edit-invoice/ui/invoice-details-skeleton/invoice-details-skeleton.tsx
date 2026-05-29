import s from './invoice-details-skeleton.module.scss';

const SkeletonLine = ({ className }: { className?: string }) => {
  return <span className={`${s.skeleton} ${className ?? ''}`} />;
};

export const InvoiceDetailsSkeleton = ({ role }: { role?: "influencer" | "client"}) => {
  return (
    <div className={s.root} aria-hidden="true">
      <InvoiceHeaderSkeleton />

      <div className={s.content}>
        <InvoicePartiesSkeleton />
        <InvoiceBalanceSkeleton />
        {role === 'client' && <InvoiceItemsTableSkeleton />}
        {role === 'influencer' ? <InfluencerPaymentInformationSkeleton /> : <PaymentInformationSkeleton />}
      </div>
    </div>
  );
};

const InvoiceHeaderSkeleton = () => {
  return (
    <div className={s.header}>
      <SkeletonLine className={s.logo} />

      <div className={s.headerInfo}>
        <div className={s.invoiceNumber}>
          <SkeletonLine className={s.invoiceTitle} />
          <SkeletonLine className={s.invoiceNo} />
        </div>

        <SkeletonLine className={s.date} />
      </div>
    </div>
  );
};

const InvoicePartiesSkeleton = () => {
  return (
    <div className={s.parties}>
      <div className={s.partyBlock}>
        <SkeletonLine className={s.partyTitle} />
        <SkeletonLine className={s.company} />
        <SkeletonLine className={s.lineLg} />
        <SkeletonLine className={s.lineMd} />
        <SkeletonLine className={s.lineSm} />
        <SkeletonLine className={s.lineMd} />
        <SkeletonLine className={s.contactLine} />
        <SkeletonLine className={s.contactLine} />
      </div>

      <div className={`${s.partyBlock} ${s.partyBlockRight}`}>
        <SkeletonLine className={s.partyTitle} />
        <SkeletonLine className={s.company} />
        <SkeletonLine className={s.lineLg} />
        <SkeletonLine className={s.lineMd} />
        <SkeletonLine className={s.lineSm} />
      </div>
    </div>
  );
};

const InvoiceBalanceSkeleton = () => {
  return (
    <div className={s.balanceCard}>
      <div className={s.balanceTop}>
        <SkeletonLine className={s.balanceLabel} />
        <SkeletonLine className={s.receipt} />
      </div>

      <div className={s.balanceBottom}>
        <SkeletonLine className={s.totalDue} />
        <SkeletonLine className={s.balanceValue} />
      </div>
    </div>
  );
};

const InvoiceItemsTableSkeleton = () => {
  return (
    <div className={s.tableCard}>
      <div className={s.tableHead}>
        <SkeletonLine className={s.thItem} />
        <SkeletonLine className={s.thProject} />
        <SkeletonLine className={s.thPo} />
        <SkeletonLine className={s.thReach} />
        <SkeletonLine className={s.thTotal} />
      </div>

      <div className={s.tableRow}>
        <SkeletonLine className={s.tdItem} />
        <SkeletonLine className={s.tdProject} />
        <SkeletonLine className={s.tdPo} />
        <SkeletonLine className={s.tdReach} />
        <SkeletonLine className={s.tdTotal} />
      </div>

      <div className={s.tableFooter}>
        <SkeletonLine className={s.footerTotal} />
      </div>
    </div>
  );
};

const PaymentInformationSkeleton = () => {
  return (
    <div className={s.payment}>
      <SkeletonLine className={s.paymentTitle} />

      <div className={s.bankCard}>
        <SkeletonLine className={s.methodTitle} />
        <SkeletonLine className={s.bankLineLg} />
        <SkeletonLine className={s.bankLineMd} />

        <div className={s.paymentCards}>
          <PaymentCardSkeleton />
          <PaymentCardSkeleton />
          <PaymentCardSkeleton />
        </div>
      </div>

      <div className={s.bottomCards}>
        <div className={s.smallPaymentCard}>
          <SkeletonLine className={s.methodTitle} />
          <SkeletonLine className={s.bankLineMd} />
        </div>

        <div className={s.smallPaymentCard}>
          <SkeletonLine className={s.methodTitle} />
          <SkeletonLine className={s.bankLineMd} />
        </div>
      </div>
    </div>
  );
};

const InfluencerPaymentInformationSkeleton = () => {
  return (
    <div className={s.influencerPayment}>
      <SkeletonLine className={s.influencerPaymentTitle} />

      <div className={s.influencerBankCard}>
        <SkeletonLine className={s.methodTitle} />
        <SkeletonLine className={s.influencerLine1} />
        <SkeletonLine className={s.influencerLine2} />
        <SkeletonLine className={s.influencerLine3} />
        <SkeletonLine className={s.influencerLine4} />
        <SkeletonLine className={s.influencerLine5} />
        <SkeletonLine className={s.influencerLine6} />
        <SkeletonLine className={s.influencerLine7} />
      </div>
    </div>
  );
};

const PaymentCardSkeleton = () => {
  return (
    <div className={s.paymentCard}>
      <SkeletonLine className={s.cardTitle} />
      <SkeletonLine className={s.cardLineLg} />
      <SkeletonLine className={s.cardLineMd} />
    </div>
  );
};
