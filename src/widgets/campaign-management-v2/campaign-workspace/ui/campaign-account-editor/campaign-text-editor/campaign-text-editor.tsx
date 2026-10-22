import { useId, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Button } from "@/shared/ui/v2/button-v2";

import { EditorField } from "../editor-field/editor-field.tsx";

import PlusIcon from "@/shared/assets/icons/plus.svg?react";
import ChevronIcon from '@/shared/assets/icons/chevron-right.svg?react';
import TrashIcon from '@/shared/assets/icons/trash.svg?react';

import s from './campaign-text-editor.module.scss';
import { IconButton } from "@/shared/ui/v2/icon-button";

type TextOption = {
  id: string;
  text: string;
};

interface CampaignTextEditorProps {
  readOnly: boolean;
  disabled?: boolean;
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
  readOnly,
  disabled = false,
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

  const text = readOnly
    ? selectedOption?.text ?? ""
    : draftText ?? selectedOption?.text ?? "";
  const hasDraft = draftText !== null;

  const handleCancel = () => {
    setDraftText(null);
    setIsCreating(false);
  };

  const handleCreateNew = () => {
    if (readOnly || disabled) return;
    
    setDraftText("");
    setIsCreating(true);
  };

  const handleDelete = (id: string) => {
    if (readOnly || disabled) return;
    
    onDelete(id);

    if (options.length === 1) {
      setIsOpen(false);
    }
  };

  const handleApply = () => {
    if (readOnly || disabled) return;
    
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
        !readOnly ? (
          <Button
            size="small"
            label="New"
            icon={PlusIcon}
            disabled={disabled || hasDraft}
            onClick={handleCreateNew}
          />
        ) : null
      }
    >
      <Popover.Root open={!readOnly && isOpen} onOpenChange={setIsOpen}>
        <Popover.Anchor asChild>
          <div className={s.control}>
            <textarea
              id={inputId}
              className={s.textarea}
              value={text}
              readOnly={readOnly || disabled}
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
                disabled={readOnly || disabled || hasDraft || options.length === 0}
              >
                <ChevronIcon aria-hidden="true"/>
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
                      disabled={disabled}
                      onClick={() => { if (!disabled) onSelect(option.id); }}
                    >
                      {option.text}
                    </button>
                  </Popover.Close>

                  {!readOnly && (
                    <IconButton
                      variant="danger"
                      icon={TrashIcon}
                      disabled={disabled}
                      aria-label={`Delete ${label.toLowerCase()}`}
                      title="Delete item"
                      onClick={() => handleDelete(option.id)}
                    />
                  )}
                </div>
              ))}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {!readOnly && hasDraft && (
        <div className={s.actions}>
          <Button
            size="small"
            label="Cancel"
            disabled={disabled}
            onClick={handleCancel}
          />

          <Button
            variant="primary"
            size="small"
            label="Apply"
            disabled={disabled}
            onClick={handleApply}
          />
        </div>
      )}
    </EditorField>
  );
};
