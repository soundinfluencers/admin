import React, { useCallback, useMemo, useRef, useState } from "react";
import { useUpdateClientMutation } from "@/entities/client/api/use-update-client-mutation.ts";
import type { TClientDetailsEditableKey } from "@/features/clients/model/types.ts";
import { toast } from "react-toastify";

import s from './client-note-editor.module.scss';

interface ClientNoteEditorProps {
  clientId: string;
  initialValue: string | undefined;
  fieldKey: TClientDetailsEditableKey;
}

export const ClientNoteEditor: React.FC<ClientNoteEditorProps> = ({ clientId, initialValue, fieldKey }) => {
  const { mutate, isPending } = useUpdateClientMutation();
  const [draft, setDraft] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const isTouchDevice = useMemo(
    () => window.matchMedia("(pointer: coarse)").matches,
    []
  );

  const normalizedInitialValue = initialValue ?? "";

  const openEditor = useCallback((event: React.SyntheticEvent) => {
    event.stopPropagation();
    setDraft(normalizedInitialValue)
    setIsEditorOpen(true);
  }, [normalizedInitialValue]);

  const handleCloseEditor = useCallback(() => {
    setIsEditorOpen(false);
    setDraft("");
  }, []);

  const handleSave = () => {
    if (isPending) return;

    const nextValue = draft.trim();
    const prevValue = normalizedInitialValue.trim();

    if (nextValue === prevValue) {
      handleCloseEditor();
      return;
    }

    mutate(
      {
        clientId,
        dto: {
          [fieldKey]: draft,
        },
      },
      {
        onSuccess: () => {
          toast("Client updated successfully", {
            type: "success",
            position: "top-right",
            autoClose: 3000,
          });
          handleCloseEditor();
        },
      },
    );
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      inputRef.current?.blur();
    }

    if (e.key === "Escape") {
      e.preventDefault();
      handleCloseEditor();
    }
  }, [handleCloseEditor]);

  const sanitize = useCallback((value: string): string => {
    if (fieldKey === "phone") {
      return value.replace(/[a-zA-Zа-яА-ЯёЁ]/g, "");
    }
    return value;
  }, [fieldKey]);

  const displayValue = normalizedInitialValue.trim() ? normalizedInitialValue : "—";

  return (
    <div
      className={s.root}
      onClick={isTouchDevice ? openEditor : undefined}
      onDoubleClick={!isTouchDevice ? openEditor : undefined}
    >
      {isEditorOpen ?
        (<input
          ref={inputRef}
          className={s.textInput}
          type="text"
          value={draft}
          placeholder="Enter client field"
          onChange={(e) => setDraft(sanitize(e.target.value))}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          disabled={isPending}
          autoFocus
        />
        ) : (
          <span className={s.text}>{displayValue}</span>
        )
      }
    </div>
  );
};
