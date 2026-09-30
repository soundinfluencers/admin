import s from '../metric-content.module.scss';

interface CampaignInsightsProps {
  impressions: number;
  comments: number;
  likes: number;
  shares: number;
  saves: number;
}

export const CampaignInsights = ({
  impressions,
  comments,
  likes,
  shares,
  saves,
}: CampaignInsightsProps) => {
  return (
    <dl className={s.list}>
      <div className={s.row}>
        <dt className={s.label}>Impressions:</dt>
        <dd className={s.value}>{impressions}</dd>
      </div>

      <div className={s.row}>
        <dt className={s.label}>Likes:</dt>
        <dd className={s.value}>{likes}</dd>
      </div>

      <div className={s.row}>
        <dt className={s.label}>Comments:</dt>
        <dd className={s.value}>{comments}</dd>
      </div>      
      
      <div className={s.row}>
        <dt className={s.label}>Shares / saves:</dt>
        <dd className={s.value}>
          {shares} / {saves}
        </dd>
      </div>
    </dl>
  );
};
