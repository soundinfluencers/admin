import { useId } from "react";
import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
  Tooltip,
  type PieSectorShapeProps,
} from "recharts";

import {
  prepareAudienceCountries,
  type TAudienceCountries,
} from "./audience-countries.helpers.ts";

import { getMusicGenreLabel } from "@/shared/libs/get-music-genre-label.ts";

import s from "./campaign-account-audience.module.scss";

interface CampaignAccountAudienceProps {
  countries: TAudienceCountries;
  genres: string[];
}

export const CampaignAccountAudience = ({
  countries,
  genres,
}: CampaignAccountAudienceProps) => {
  const countriesTitleId = useId();
  const genresTitleId = useId();

  const result = prepareAudienceCountries(countries);

  return (
    <div className={s.audienceInsight}>
      <section className={s.card} aria-labelledby={countriesTitleId}>
        <h3 id={countriesTitleId} className={s.title}>
          Top 5 countries
        </h3>

        {result.status === "empty" ? (
          <p className={s.message}>No audience country data available.</p>
        ) : result.status === "invalid" ? (
          <p className={s.error}>
            Audience country data is invalid. Please check this accounts audience information.
          </p>
        ) : (
          <div className={s.countries}>
            <div className={s.chart}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={result.data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    // innerRadius="55%"
                    outerRadius="90%"
                    stroke="#FFFFFF"
                    strokeWidth={1}
                    strokeLinejoin="round"
                    paddingAngle={0}
                    minAngle={0}
                    startAngle={90}
                    endAngle={-270}
                    isAnimationActive={false}
                    shape={(props: PieSectorShapeProps) => (
                      <Sector
                        {...props}
                        fill={result.data[props.index]?.fill}
                      />
                    )}
                  />

                  <Tooltip
                    formatter={(value) =>
                      `${Number(value).toFixed(2)}%`
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <ul className={s.legend}>
              {result.data.map((item) => (
                <li key={item.id} className={s.legendItem}>
                  <span
                    className={s.marker}
                    style={{ backgroundColor: item.fill }}
                    aria-hidden="true"
                  />

                  <span className={s.countryName}>
                    {item.name}
                  </span>

                  <span className={s.percentage}>
                    {item.value.toFixed(2)}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
      
      <div className={s.card} aria-labelledby={genresTitleId}>
        <h3 id={genresTitleId} className={s.title}>
          Genres
        </h3>

        {genres.length === 0 ? (
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
      </div>
    </div>
  );
};
