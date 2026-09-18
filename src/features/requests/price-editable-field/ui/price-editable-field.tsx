import React, { useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { useUpdateSocialAccountPriceMutation } from "../model/use-update-price-mutation.ts";
import { toast } from "react-toastify";
import type { TRequestType } from "@/entities/requests/model/requests.types.ts";
import type { TCurrency } from "@/shared/types/types.ts";

import s from './price-editable-field.module.scss';
import { formatCurrency } from "@/shared/libs/format/format-currency.ts";

const sanitizeIntegerInput= (raw: string) => raw.replace(/\D/g, "");
// const sanitizeDecimalInput= (raw: string) => {
//   let s = raw.replace(/,/g, ".").replace(/[^\d.-]/g, "");
//
//   s = s.replace(/(?!^)-/g, "");
//
//   const firstDot = s.indexOf(".");
//   if (firstDot !== -1) {
//     s = s.slice(0, firstDot + 1) + s.slice(firstDot + 1).replace(/\./g, "");
//   }
//
//   return s;
// };

interface PriceEditableFieldProps {
  requestId: string;
  requestType: TRequestType;
  initialValue: string;
  inputClassName?: string;
  accountId: string;
  accountCurrency: TCurrency;
  isDisabled?: boolean;
}

export const PriceEditableField: React.FC<PriceEditableFieldProps> = ({
  requestId,
  requestType,
  initialValue,
  accountId,
  accountCurrency,
  inputClassName,
  isDisabled = false,
}) => {
  const { mutate, isPending } = useUpdateSocialAccountPriceMutation();
  const [draft, setDraft] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const isTouchDevice = useMemo(
    () => window.matchMedia("(pointer: coarse)").matches,
    []
  );

  const normalizedInitialValue = initialValue ?? "";

  const openEditor = (event: React.SyntheticEvent) => {
    if (isDisabled) return;
    event.stopPropagation();
    setDraft(normalizedInitialValue)
    setIsEditing(true);
  };

  const handleCloseEditing = () => {
    setIsEditing(false);
    setDraft("");
  };

  const handleChange = (rawValue: string) => {
    const nextValue = sanitizeIntegerInput(rawValue);

    if (nextValue === "") {
      setDraft("");
      return;
    }

    setDraft(nextValue);
  };

  const handleSave = () => {
    if (isPending) return;

    const nextValue = draft.trim();
    const prevValue = normalizedInitialValue.trim();

    if (nextValue === prevValue) {
      handleCloseEditing();
      return;
    }

    mutate(
      {
        requestId,
        requestType,
        body: {
          accountId,
          price: Number(draft),
        },
      },
      {
        onSuccess: () => {
          handleCloseEditing();
          toast("Price updated successfully", { type: "success", position: "top-right", autoClose: 3000 });
        },
      },
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      inputRef.current?.blur();
    }

    if (e.key === "Escape") {
      e.preventDefault();
      handleCloseEditing();
    }
  };

  const displayValue = normalizedInitialValue.trim()
    ? formatCurrency(normalizedInitialValue, accountCurrency)
    : "—";

  return (
    <div
      className={clsx(s.root, {
        [s.isDisabled]: isDisabled,
      })}
      onClick={isTouchDevice ? openEditor : undefined}
      onDoubleClick={!isTouchDevice ? openEditor : undefined}
      title={displayValue}
    >
      {isEditing ? (
        <input
          id={"price-editable-field"}
          ref={inputRef}
          className={clsx(s.textInput, inputClassName)}
          type="text"
          value={draft}
          placeholder=""
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          disabled={isPending}
          autoComplete="off"
          autoFocus
        />
      ) : (
        <span className={s.text}>{displayValue}</span>
      )}
    </div>
  );
};
