import type { ICampaignDetails } from "@/entities/campaign/model/campaign-details.types.ts";

export type TAudienceCountries =
  ICampaignDetails["addedAccounts"][number]["countries"];

type TCountryChartItem = {
  id: string;
  name: string;
  value: number;
  fill: string;
};

type TCountriesChartResult =
  | { status: "empty" }
  | { status: "invalid" }
  | { status: "ready"; data: TCountryChartItem[] };

const COUNTRY_COLORS = [
  "#536DFE",
  "#29C58A",
  "#FFA63D",
  "#F45C7B",
  "#9368E9",
];

const OTHER_COUNTRIES_COLOR = "#D9E0EB";
const PERCENTAGE_EPSILON = 1e-8;

export const prepareAudienceCountries = (
  countries: TAudienceCountries,
): TCountriesChartResult => {
  if (!Array.isArray(countries)) {
    return { status: "invalid" };
  }

  if (countries.length === 0) {
    return { status: "empty" };
  }

  const hasInvalidCountry = countries.some(
    (item) =>
      !item ||
      typeof item.country !== "string" ||
      item.country.trim() === "" ||
      typeof item.percentage !== "number" ||
      !Number.isFinite(item.percentage) ||
      item.percentage < 0,
  );

  if (hasInvalidCountry) {
    return { status: "invalid" };
  }

  const total = countries.reduce(
    (sum, item) => sum + item.percentage,
    0,
  );

  if (total > 100 + PERCENTAGE_EPSILON) {
    return { status: "invalid" };
  }

  const data: TCountryChartItem[] = countries.map((item, index) => ({
    id: `country:${index}`,
    name: item.country,
    value: item.percentage,
    fill: COUNTRY_COLORS[index % COUNTRY_COLORS.length],
  }));

  const remaining = 100 - total;

  if (remaining > PERCENTAGE_EPSILON) {
    data.push({
      id: "other-countries",
      name: "Other countries",
      value: remaining,
      fill: OTHER_COUNTRIES_COLOR,
    });
  }

  return {
    status: "ready",
    data,
  };
};
