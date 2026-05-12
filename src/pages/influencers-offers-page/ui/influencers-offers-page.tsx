import { PageBreadcrumbs } from "@/widgets/page-breadcrumbs";
import { PageTitle } from "@/widgets/page-title";
import { PlatformsFilterBar } from "@/widgets/influencers-offers/platform-filter-bar";
import { GenreFilterBar } from "@/widgets/influencers-offers/genre-filter-bar";
import { OffersMatrixActions } from "@/widgets/influencers-offers/offers-matrix-actions";
import {
  useInfluencersOffersPageState,
} from "@/pages/influencers-offers-page/model/use-influencers-offers-page-state.ts";

import s from './influencers-offers-page.module.scss';

export const InfluencersOffersPage = () => {
  const {
    platform,
    genre,
    mode,
    handlePlatformChange,
    handleGenreChange,
    handleModeChange,
  } = useInfluencersOffersPageState();

  return (
    <div className={s.offersPage}>
      <PageBreadcrumbs
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Influencers offers" },
        ]}
      />

      <div className={s.wrapper}>
        <div className={s.header}>
          <PageTitle
            title="Influencers offers"
          />

          <div className={s.toolbar}>
            <PlatformsFilterBar platform={platform} onPlatformChange={handlePlatformChange}/>
            <GenreFilterBar genre={genre} onGenreChange={handleGenreChange}/>
          </div>
        </div>

        <div className={s.tableWrapper}>
          <OffersMatrixActions
            mode={mode}
            onToggleOffersView={handleModeChange}
          />

          {mode === "offers" ?
            (
              <div>Table</div>
            )
            :
            (
              <div>Card view</div>
            )
          }
        </div>
      </div>
    </div>
  );
};
