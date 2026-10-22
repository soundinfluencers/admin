import { useId } from "react";
import clsx from "clsx";
import { AudienceCountries } from "./audience-countries.tsx";
import { getMusicGenreLabel } from "@/shared/libs/get-music-genre-label.ts";

import type { TAudienceCountries } from "./audience-countries.helpers.ts";
import type { CampaignAccountGenre } from "@/entities/campaign/model/campaign-details.types.ts";
import type { TCommunityThemeTopic, TCreatorContentFocus } from "@/shared/constants/music-taxonomy";

import s from "./campaign-account-audience.module.scss";

const averageViewsFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

const engagementRateFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

const formatMetric = (
  value: number | null | undefined,
  formatter: Intl.NumberFormat,
  suffix = "",
): string => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "—";
  }

  return `${formatter.format(value)}${suffix}`;
};

type CampaignAdditionalCategory = TCommunityThemeTopic | TCreatorContentFocus;

interface CampaignAccountAudienceProps {
  countries: TAudienceCountries;
  genres: readonly CampaignAccountGenre[];
  additionalCategories: readonly CampaignAdditionalCategory[];
  averageViews: number | null | undefined;
  engagementRate: number | null | undefined;
  profileType: "community" | "creator";
}

export const CampaignAccountAudience = ({
  countries,
  genres,
  additionalCategories,
  averageViews,
  engagementRate,
  profileType,
}: CampaignAccountAudienceProps) => {
  const countriesTitleId = useId();
  const genresTitleId = useId();
  const additionalGenresTitleId = useId();

  const additionalCategoriesTitle = profileType === "creator" ? "Content focus" : "Topics";

  const hasValidGenres =
    Array.isArray(genres) &&
    genres.every((genre) => typeof genre === "string");

  return (
    <div className={s.audienceInsight}>
      <section className={clsx(s.card, s.countriesCard)} aria-labelledby={countriesTitleId}>
        <h3 id={countriesTitleId} className={s.title}>
          Top 5 countries
        </h3>

        <AudienceCountries countries={countries} />
      </section>
      
      <section className={clsx(s.card, s.genresCard)} aria-labelledby={genresTitleId}>
        <h3 id={genresTitleId} className={s.title}>
          Genres
        </h3>

        {!hasValidGenres ? (
          <p className={s.error}>
            Genre data is unavailable or invalid. Please reload the campaign.
          </p>
        ) : genres.length === 0 ? (
          <p className={s.message}>No genre data available.</p>
        ) : (
          <ul className={s.genreList}>
            {genres.map((genre, index) => (
              <li
                key={`${genre}:${index}`}
                className={s.genreBadge}
              >
                {getMusicGenreLabel(genre)}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section
        className={clsx(s.card, s.metricsCard)}
        aria-label="Account metrics"
      >
        <dl className={s.metrics}>
          <div className={s.metric}>
            <dt className={s.metricLabel}>Average views</dt>
            <dd className={s.metricValue}>
              {formatMetric(averageViews, averageViewsFormatter)}
            </dd>
          </div>

          <div className={s.metric}>
            <dt className={s.metricLabel}>Engagement rate</dt>
            <dd className={s.metricValue}>
              {formatMetric(engagementRate, engagementRateFormatter, "%")}
            </dd>
          </div>
        </dl>
      </section>

      <section
        className={clsx(s.card, s.categoriesCard)}
        aria-labelledby={additionalGenresTitleId}
      >
        <h3 id={additionalGenresTitleId} className={s.title}>
          {additionalCategoriesTitle}
        </h3>

        {additionalCategories.length === 0 ? (
          <p className={s.message}>
            {profileType === "creator"
              ? "No content focus data available."
              : "No topic data available."}
          </p>
        ) : (
          <ul className={s.genreList}>
            {additionalCategories.map((category, index) => (
              <li
                key={`${category}:${index}`}
                className={s.genreBadge}
              >
                {getMusicGenreLabel(category)}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};
