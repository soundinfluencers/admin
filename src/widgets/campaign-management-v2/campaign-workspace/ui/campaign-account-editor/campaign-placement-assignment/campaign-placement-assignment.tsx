import { useId, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Button } from "@/shared/ui/v2/button-v2";
import { IconButton } from "@/shared/ui/v2/icon-button";
import { ButtonLink } from "@/shared/ui/v2/button-link";
import { EditorField } from "../editor-field/editor-field.tsx";
import { CampaignDateRequest } from "./campaign-date-request/campaign-date-request.tsx";

import PlusIcon from "@/shared/assets/icons/plus.svg?react";
import ChevronIcon from '@/shared/assets/icons/chevron-right.svg?react';
import ExternalLinkIcon from '@/shared/assets/icons/external-link.svg?react';
import TrashIcon from '@/shared/assets/icons/trash.svg?react';

import s from './campaign-placement-assignment.module.scss';

type ContentOption = {
  id: string;
  label: string;
  mainLink: string;
}

interface CampaignPlacementAssignmentProps {
  readOnly: boolean;
  disabled?: boolean;
  options: ContentOption[];
  dateRequest: string;
  selectedId: string | null;
  onContentSelect: (campaignContentItemId: string) => void;
  onContentCreate: (mainLink: string) => void;
  onDelete: (id: string) => void;
  onDateRequestChange: (dateRequest: string) => void;
}

export const CampaignPlacementAssignment = ({
  readOnly,
  disabled = false,
  options,
  dateRequest,
  selectedId,
  onContentSelect,
  onContentCreate,
  onDateRequestChange,
  onDelete,
}: CampaignPlacementAssignmentProps) => {
  const inputId = useId();
  const triggerId = useId();

  const [draftText, setDraftText] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((option) => option.id === selectedId) ?? null;

  const text = readOnly
    ? selectedOption?.label ?? ""
    : draftText ?? selectedOption?.label ?? "";
  
  const hasDraft = draftText !== null;
  const otherOptionsCount = Math.max(
    options.length - (selectedOption ? 1 : 0),
    0,
  );

  const handleCancel = () => {
    setDraftText(null);
    setIsCreating(false);
  };

  const handleCreateNew = () => {
    if (readOnly || disabled) return;
    
    setDraftText("");
    setIsCreating(true);
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
      onContentCreate(nextText);
    }

    handleCancel();
  };

  const handleDelete = (id: string) => {
    if (readOnly || disabled) return;
    
    onDelete(id);

    if (options.length === 1) {
      setIsOpen(false);
    }
  };

  return (
    <div className={s.placementAssignment}>
      <EditorField
        label="Assigned video"
        htmlFor={isCreating ? inputId : triggerId}
        action={
          !readOnly ? (
            <Button 
              size="small"
              label="New"
              icon={PlusIcon}
              disabled={disabled || hasDraft}
              onClick={handleCreateNew}
              aria-label="Add new content"
            />
          ) : null
        }
      >

        <Popover.Root open={!readOnly && isOpen} onOpenChange={setIsOpen}>
          <Popover.Anchor asChild>
            <div className={s.control}>
              {isCreating && !readOnly ? (
                <input
                  id={inputId}
                  className={s.input}
                  value={text}
                  disabled={disabled || (!selectedOption && !isCreating)}
                  placeholder={
                    isCreating ? `Enter content link…` : `Select or create content link…`
                  }
                  onChange={(e) => setDraftText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      e.preventDefault();
                      handleCancel();
                    }
                  }}
                />
              ) : (
                <div className={s.preview}>
                  {selectedOption?.mainLink.trim() ? (
                    <a
                      href={selectedOption.mainLink}
                      className={s.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open content in a new tab"
                    >
                      {text}
                      <ExternalLinkIcon aria-hidden="true"/>
                    </a>
                  ) : (
                    <span>{selectedOption?.label ?? "Select or create content"}</span>
                  )}
                  {selectedOption && otherOptionsCount > 0 && (
                    <p className={s.subtitle}>
                      {otherOptionsCount} other{' '}
                      {otherOptionsCount === 1 ? 'option' : 'options'} available
                    </p>
                  )}
                </div>
              )}

              <Popover.Trigger asChild>
                <button
                  id={triggerId}
                  type="button"
                  className={s.selectTrigger}
                  aria-label="Select assigned video"
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
              aria-label="Choose assigned video"
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
                        title={option.mainLink}
                        disabled={disabled}
                        onClick={() => { 
                          if (!disabled) onContentSelect(option.id); 
                        }}
                      >
                        {option.mainLink}
                      </button>
                    </Popover.Close>

                    <div className={s.optionActions}>
                      <ButtonLink
                        size="small"
                        icon={ExternalLinkIcon}
                        href={option.mainLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${option.label} in a new tab`}
                        title="Open content in a new tab"
                      />

                      {!readOnly && (
                        <IconButton
                          variant="danger"
                          icon={TrashIcon}
                          disabled={disabled}
                          aria-label={`Delete ${option.label}`}
                          title="Delete content"
                          onClick={() => handleDelete(option.id)}
                        />
                      )}
                    </div>
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

      <CampaignDateRequest
        readOnly={readOnly}
        disabled={disabled}
        value={dateRequest}
        onChange={onDateRequestChange}
      />
    </div>
  );
};
