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

import s from "./audience-countries.module.scss";

interface AudienceCountriesProps {
  countries: TAudienceCountries;
}

export const AudienceCountries = ({
  countries,
}: AudienceCountriesProps) => {
  const result = prepareAudienceCountries(countries);

  return (
    result.status === "empty" ? (
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
    )
  );
};
