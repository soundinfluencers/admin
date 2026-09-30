import React, { useEffect, useRef, useState } from "react";
import * as Select from "@radix-ui/react-select";
import {
  CURRENCIES,
  CURRENCY_LABELS,
  isCurrency,
  type TCurrency,
} from "@/shared/constants/currency-taxonomy.ts";
import { isValidCampaignPrice } from "@/entities/campaign/model/campaign-price.ts";

import Chevron from '@/shared/assets/icons/chevron-right.svg?react';

import s from './budget-control.module.scss';

interface BudgetControlProps {
  price: number;
  currency: TCurrency;
  onPriceChange: (price: number) => void;
  onCurrencyChange: (currency: TCurrency) => void;
}

const INTEGER_INPUT_PATTERN = /^\d*$/;

export const BudgetControl = ({
  price,
  onPriceChange,
  currency,
  onCurrencyChange,
}: BudgetControlProps) => {
  const [draft, setDraft] = useState(() => String(price));
  const skipNextBlurSaveRef = useRef(false);

  useEffect(() => {
    setDraft(String(price));
  }, [price]);

  const handleChange = (rawValue: string) => {
    if (INTEGER_INPUT_PATTERN.test(rawValue)) {
      setDraft(rawValue);
    }
  };

  const handleBlur = () => {
    if (skipNextBlurSaveRef.current) {
      skipNextBlurSaveRef.current = false;
      return;
    }

    if (draft === "") {
      setDraft(String(price));
      return;
    }

    const nextValue = Number(draft);

    if (!isValidCampaignPrice(nextValue)) {
      setDraft(String(price));
      return;
    }

    setDraft(String(nextValue));

    if (nextValue === price) return;

    onPriceChange(nextValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.currentTarget.blur();
    }

    if (e.key === "Escape") {
      e.preventDefault();
      skipNextBlurSaveRef.current = true;
      setDraft(String(price));
      e.currentTarget.blur();
    }
  };

  const handleCurrencyChange = (value: string) => {
    if (isCurrency(value)) {
      onCurrencyChange(value);
    }
  }

  return (
    <div className={s.root}>
      <input
        id="price"
        className={s.input}
        type="text"
        inputMode="numeric"
        value={draft}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoComplete="off"
      />

      <Select.Root
        value={currency}
        onValueChange={handleCurrencyChange}
      >
        <Select.Trigger className={s.trigger} aria-label="Currency">
          <Select.Value />
          <Select.Icon asChild>
            <Chevron className={s.icon} aria-hidden="true" />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content
            position="popper"
            sideOffset={2}
            align="start"
            className={s.content}
          >
            <Select.Viewport className={s.viewport}>
              {CURRENCIES.map((option) => (
                <Select.Item
                  key={option}
                  value={option}
                  className={s.item}
                >
                  <Select.ItemText>{option} {CURRENCY_LABELS[option]}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}
