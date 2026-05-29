import React, { useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { useUpdateClientInvoiceMutation } from "@/features/edit-invoice/model/use-update-invoice-mutation.ts";
import { toast } from "react-toastify";
import type { TInvoiceEditableKey } from "@/features/edit-invoice/model/types.ts";

import s from './invoice-details-editable-field.module.scss';

interface InvoiceDetailsEditableFieldProps {
  invoiceId: string;
  initialValue: string;
  fieldKey: TInvoiceEditableKey;
  inputClassName?: string;

  isDisabled?: boolean;
}

export const InvoiceDetailsEditableField: React.FC<InvoiceDetailsEditableFieldProps> = ({
  invoiceId,
  initialValue,
  fieldKey,
  inputClassName,
  isDisabled = false,
}) => {
  const { mutate, isPending } = useUpdateClientInvoiceMutation();
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
        invoiceId,
        dto: {
          [fieldKey]: draft,
        },
      },
      {
        onSuccess: () => {
          handleCloseEditing();
          toast("Field updated successfully", { type: "success", position: "top-right", autoClose: 3000 });
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

  const displayValue = normalizedInitialValue.trim() ? normalizedInitialValue : "—";

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
          id={fieldKey}
          ref={inputRef}
          className={clsx(s.textInput, inputClassName)}
          type="text"
          value={draft}
          placeholder=""
          onChange={(e) => setDraft(e.target.value)}
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
