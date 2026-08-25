import React, { useRef } from "react";
import { DotLoader } from "@/shared/ui/loaders/dot-loader";
import clsx from "clsx";

import Trash from '@/assets/icons/trash-2.svg?react';
import PaperClip from '@/assets/icons/paperclip.svg?react';
import X from '@/assets/icons/x.svg?react';

import s from './image-upload.module.scss';

interface ImageUploadProps {
  name: string;
  label: string;
  placeholder?: string;
  value: string;
  error?: string;
  hideErrorMessage?: boolean;
  reserveErrorSpace?: boolean;
  disabled?: boolean;
  isPending?: boolean;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
  size?: 'sm' | 'lg';
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  name,
  label,
  placeholder = "Upload Image",
  value,
  error,
  hideErrorMessage,
  reserveErrorSpace,
  disabled = false,
  isPending = false,
  onFileSelect,
  onRemove,
  size = "sm",
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const hasPreview = Boolean(value);
  const isInteractive = !disabled && !isPending;

  const openFileDialog = () => {
    if (!isInteractive) return;
    inputRef.current?.click();
  };

  const resetNativeInput = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    onFileSelect(file);
    resetNativeInput();
  };

  const handleRemoveClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    if (!isInteractive) return;

    onRemove();
    resetNativeInput();
  };

  return (
    <div className={s.imageUpload}>
      <label
        className={clsx(s.label, error && s.labelError)}
        htmlFor={name}
      >
        {label}
      </label>

      <input
        id={name}
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        disabled={!isInteractive}
        onChange={handleInputChange}
      />

      <div
        className={clsx(s.control, {
          [s.inputError]: error,
          [s.large]: size === 'lg',
          [s.controlExpanded]: hasPreview && size === 'lg',
        })}
        onClick={!hasPreview ? openFileDialog : undefined}
        role={!hasPreview && isInteractive ? "button" : undefined}
        tabIndex={!hasPreview && isInteractive ? 0 : undefined}
        onKeyDown={(event) => {
          if (hasPreview || !isInteractive) return;

          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openFileDialog();
          }
        }}
      >
        {isPending ? (
          <DotLoader/>
        ) : hasPreview ? (
          <>
            {size === 'lg' ? (
              <div className={s.wrapper}>
                <img
                  src={value}
                  alt="Uploaded preview"
                  className={clsx(s.logo, s.logoLarge)}
                  width={142}
                  height={172}
                  loading="lazy"
                />
                <button className={s.removeButton} onClick={handleRemoveClick} disabled={!isInteractive}>
                  <X className={s.removeIcon} aria-label="Remove logo" />
                </button>
              </div>
            ) : (
              <img
                src={value}
                alt="Uploaded preview"
                className={s.logo}
                width={40}
                height={40}
                loading="lazy"
              />
            )}

            {size === 'sm' && (
              <button
                type="button"
                className={s.action}
                onClick={handleRemoveClick}
                disabled={!isInteractive}
              >
                <Trash
                  className={s.actionIcon}
                  width={20}
                  height={20}
                  aria-label="Remove logo"
                />
              </button>
            )}
          </>
        ) : (
          <>
            <span className={clsx(s.placeholder)}>{placeholder}</span>

            <button
              type="button"
              className={clsx(s.action)}
            >
              <PaperClip
                className={s.actionIcon}
                width={20}
                height={20}
                aria-label={"Add logo"}
              />
            </button>
          </>
        )}
      </div>

      {(error || reserveErrorSpace) && (
        <p
          className={clsx(
            s.error,
            (!error || hideErrorMessage) && s.errorTextHidden,
          )}
        >
          {error || "\u00A0"}
        </p>
      )}
    </div>
  );
};
