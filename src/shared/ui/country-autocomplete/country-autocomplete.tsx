import React, { useMemo, useRef, useState } from "react";
import { useClickOutside } from "@/shared/hooks/use-click-outside";
import { Input } from "@/shared/ui";
import type { ICountryOption } from "@/shared/ui/country-autocomplete/country-autocomplete.types.ts";

import clsx from "clsx";

import s from "./country-autocomplete.module.scss";

interface CountryAutocompleteProps {
  value: string | null;
  name?: string;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;

  countries: ICountryOption[];
  excludeCountries?: Set<string>;

  onCommit: (value: string | null) => void;
  onInputChange?: (raw: string) => void;

  size?: 'sm';
}

export const CountryAutocomplete: React.FC<CountryAutocompleteProps> = ({
  value,
  name,
  placeholder,
  label,
  error,
  disabled = false,
  countries,
  excludeCountries,
  onCommit,
  onInputChange,
  size,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const isSelectingRef = useRef(false);

  const [searchValue, setSearchValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useClickOutside(rootRef, () => {
    if (!isFocused) return;
    setIsFocused(false);
  });

  const filteredCountries = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    if (!query) return [];

    return countries
    .filter((country) => country.name.toLowerCase().includes(query))
    .filter((country) => !excludeCountries?.has(country.name));
  }, [countries, searchValue, excludeCountries]);

  const showDropdown = isFocused && filteredCountries.length > 0;
  const displayValue = isFocused ? searchValue : (value ?? "");

  const findExactCountry = (raw: string) => {
    const query = raw.trim().toLowerCase();
    if (!query) return null;

    return (
      countries.find(
        (country) => country.name.trim().toLowerCase() === query,
      ) ?? null
    );
  };

  return (
    <div
      ref={rootRef}
      className={clsx(s.root, isFocused && s.focused)}
    >
      <Input
        className={clsx(s.input, {
          [s.inputSm]: size === 'sm',
        })}
        id={name}
        name={name}
        type="text"
        value={displayValue}
        label={label}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        error={showDropdown ? undefined : error}
        onChange={(e) => {
          const rawValue = e.target.value;
          setSearchValue(rawValue);
          setIsFocused(true);
          onInputChange?.(rawValue);
        }}
        onFocus={() => {
          setSearchValue(value ?? "");
          setIsFocused(true);
        }}
        onBlur={() => {
          setIsFocused(false);

          if (isSelectingRef.current) {
            isSelectingRef.current = false;
            return;
          }

          const typedValue = searchValue.trim();

          if (!typedValue) {
            onCommit(null);
            setSearchValue("");
            return;
          }

          const exactCountry = findExactCountry(typedValue);

          if (exactCountry && !excludeCountries?.has(exactCountry.name)) {
            onCommit(exactCountry.name);
            setSearchValue("");
            return;
          }

          onCommit(null);
          setSearchValue("");
        }}
      />

      <div
        className={clsx(
          s.listWrapper,
          showDropdown && s.listWrapperVisible,
        )}
      >
        <ul className={s.list}>
          {filteredCountries.map((country) => (
            <li
              key={country.code}
              className={s.item}
              tabIndex={-1}
              aria-selected={false}
              onMouseDown={(e) => {
                e.preventDefault();
                isSelectingRef.current = true;

                onCommit(country.name);
                setSearchValue("");
                setTimeout(() => setIsFocused(false), 120);
              }}
            >
              {country.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
