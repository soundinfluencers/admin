import { useId, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import clsx from "clsx";
import { EditorField } from "../editor-field/editor-field.tsx";

import Plus from "@/shared/assets/icons/plus.svg?react";
import Chevron from '@/shared/assets/icons/chevron-right.svg?react';
import Trash from '@/shared/assets/icons/trash.svg?react';

import s from './campaign-text-editor.module.scss';

type TextOption = {
  id: string;
  text: string;
};

interface CampaignTextEditorProps {
  label: string;
  placeholder: string;
  options: TextOption[];
  selectedId: string | null;

  onSelect: (id: string) => void;
  onCreate: (text: string) => void;
  onUpdate: (id: string, text: string) => void;
  onDelete: (id: string) => void;
}

export const CampaignTextEditor = ({
  label,
  placeholder,
  options,
  selectedId,
  onSelect,
  onCreate,
  onUpdate,
  onDelete,
}: CampaignTextEditorProps) => {
  const inputId = useId();

  const [draftText, setDraftText] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((option) => option.id === selectedId) ?? null;

  const text = draftText ?? selectedOption?.text ?? "";
  const hasDraft = draftText !== null;

  const handleCancel = () => {
    setDraftText(null);
    setIsCreating(false);
  };

  const handleCreateNew = () => {
    setDraftText("");
    setIsCreating(true);
  };

  const handleDelete = (id: string) => {
    onDelete(id);

    if (options.length === 1) {
      setIsOpen(false);
    }
  };

  const handleApply = () => {
    if (draftText === null) return;

    const nextText = draftText.trim();

    if (!nextText) {
      handleCancel();
      return;
    }

    if (isCreating) {
      onCreate(nextText);
    } else if (
      selectedOption &&
      nextText !== selectedOption.text
    ) {
      onUpdate(selectedOption.id, nextText);
    }

    handleCancel();
  };

  return (
    <EditorField
      label={label}
      htmlFor={inputId}
      action={
        <button
          type="button"
          className={s.addBtn}
          onClick={handleCreateNew}
          disabled={hasDraft}
        >
          <Plus className={s.plusIcon} aria-hidden="true"/>
          New
        </button>
      }
    >
      <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
        <Popover.Anchor asChild>
          <div className={s.control}>
            <textarea
              id={inputId}
              className={s.textarea}
              value={text}
              disabled={!selectedOption && !isCreating}
              placeholder={
                isCreating ? `Enter ${placeholder}` : `Select or create ${placeholder}`
              }
              onChange={(e) => setDraftText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.preventDefault();
                  handleCancel();
                }
              }}
              spellCheck="false"
            />

            <Popover.Trigger asChild>
              <button
                type="button"
                className={s.selectTrigger}
                aria-label={`Select ${label.toLowerCase()}`}
                disabled={hasDraft || options.length === 0}
              >
                <Chevron aria-hidden="true"/>
              </button>
            </Popover.Trigger>
          </div>
        </Popover.Anchor>

        <Popover.Portal>
          <Popover.Content
            className={s.dropdown}
            side="bottom"
            align="start"
            sideOffset={6}
            collisionPadding={12}
            aria-label={`Choose ${label.toLowerCase()}`}
          >
            <div className={s.dropdownScroll}>
              {options.map((option) => (
                <div
                  key={option.id}
                  className={s.inner}
                  data-selected={option.id === selectedId}
                >
                  <Popover.Close asChild>
                    <button
                      type="button"
                      className={s.option}
                      onClick={() => onSelect(option.id)}
                    >
                      {option.text}
                    </button>
                  </Popover.Close>

                  <button
                    type="button"
                    className={s.removeBtn}
                    onClick={() => handleDelete(option.id)}
                    aria-label={`Delete ${label.toLowerCase()}`}
                  >
                    <Trash aria-hidden="true"/>
                  </button>
                </div>
              ))}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {hasDraft && (
        <div className={s.actions}>
          <button 
            type="button"
            className={clsx(s.action, s.apply)}
            onClick={handleApply}
          >
            Apply
          </button>

          <button 
            type="button"
            className={clsx(s.action, s.cancel)}
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      )}
    </EditorField>
  );
};
