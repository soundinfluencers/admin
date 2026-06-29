import { z } from "zod";

const TOP_COUNTRIES = 5;

const countryItemSchema = z.object({
  country: z.string(),
  percentage: z.string(),
});

const hasCountry = (country: string) => {
  return country.trim().length > 0;
};

const hasPercentage = (percentage: string) => {
  return percentage.trim().length > 0;
};

export const audienceInsightsSchema = z
.array(countryItemSchema)
.length(
  TOP_COUNTRIES,
  `Audience insights must contain exactly ${TOP_COUNTRIES} slots`
)
.superRefine((items, ctx) => {
  const anyTouched = items.some(
    (item) =>
      hasCountry(item.country) ||
      hasPercentage(item.percentage)
  );

  if (!anyTouched) return;

  const allFilled = items.every(
    (item) =>
      hasCountry(item.country) &&
      hasPercentage(item.percentage)
  );

  if (!allFilled) {
    ctx.addIssue({
      code: 'custom',
      path: [],
      message:
        'Fill in all 5 audience countries and their percentages',
    });

    return;
  }

  const total = items.reduce((acc, item) => {
    return acc + Number(item.percentage);
  }, 0);

  if (total > 100) {
    ctx.addIssue({
      code: 'custom',
      path: [],
      message:
        'Total audience reach percentage must not exceed 100',
    });
  }
});
