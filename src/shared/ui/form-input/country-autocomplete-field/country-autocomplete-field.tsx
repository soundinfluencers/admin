import { useMemo } from "react";
import {
  useController,
  useFormContext,
  useWatch,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { CountryAutocomplete } from "@/shared/ui/country-autocomplete/country-autocomplete.tsx";
import { COUNTRIES_LIST } from "@/shared/ui/country-autocomplete/country-autocomplete.constants.ts";

interface CountryItem {
  country: string | null;
}

interface CountryAutocompleteFieldProps<T extends FieldValues> {
  name: Path<T>;
  countriesName?: Path<T>;
  index?: number;
  placeholder?: string;
  label?: string;
  disabled?: boolean;

  size?: "sm";
}

export function CountryAutocompleteField<T extends FieldValues>({
  name,
  countriesName,
  index,
  placeholder,
  label,
  disabled = false,
  size,
}: CountryAutocompleteFieldProps<T>) {
  const { control } = useFormContext<T>();

  const {
    field: { value, onChange },
    fieldState,
  } = useController({
    name,
    control,
  });

  const allCountries = useWatch({
    control,
    name: countriesName ?? name,
  }) as CountryItem[] | string | null | undefined;

  const excludeCountries = useMemo(() => {
    if (!countriesName || index === undefined || !Array.isArray(allCountries)) {
      return new Set<string>();
    }

    const nextSet = new Set<string>();

    allCountries.forEach((item, currentIndex) => {
      if (currentIndex === index) return;
      if (item?.country) nextSet.add(item.country);
    });

    return nextSet;
  }, [allCountries, countriesName, index]);

  return (
    <CountryAutocomplete
      name={String(name)}
      value={value ?? null}
      placeholder={placeholder}
      label={label}
      disabled={disabled}
      countries={COUNTRIES_LIST}
      excludeCountries={excludeCountries}
      onCommit={(nextValue) => {
        onChange(nextValue ?? "");
      }}
      size={size}
      error={size === "sm" ? undefined : fieldState.error?.message}
    />
  );
}
