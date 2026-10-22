import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Button } from "@/shared/ui/v2/button-v2";

import ChevronRight from "@/shared/assets/icons/chevron-right.svg?react";
import CirclePlusIcon from "@/shared/assets/icons/circle-plus.svg?react";
import CheckIcon from "@/shared/assets/icons/check-circle.svg?react";
import TrashIcon from "@/shared/assets/icons/trash.svg?react";

import s from './proposal-option-toolbar.module.scss';

interface ProposalOptionToolbarProps {
  options: readonly number[];
  selectedOptionIndex: number;
  onOptionChange: (optionIndex: number) => void;
  onCreateOption: () => void;
  onDeleteOption: (trigger: HTMLButtonElement) => void;
  onApproveOption: (trigger: HTMLButtonElement) => void;
  disabled?: boolean;
}

export const ProposalOptionToolbar = ({
  options,
  selectedOptionIndex,
  onOptionChange,
  onCreateOption,
  onDeleteOption,
  onApproveOption,
  disabled = false,
}: ProposalOptionToolbarProps) => {
  const labelId = useId();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState({
    hasOverflow: false,
    canScrollLeft: false,
    canScrollRight: false,
  });

  const updateScrollState = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;

    const maxScrollLeft = element.scrollWidth - element.clientWidth;
    const nextState = {
      hasOverflow: maxScrollLeft > 1,
      canScrollLeft: element.scrollLeft > 1,
      canScrollRight: element.scrollLeft < maxScrollLeft - 1,
    };

    setScrollState((previous) =>
      previous.hasOverflow === nextState.hasOverflow &&
      previous.canScrollLeft === nextState.canScrollLeft &&
      previous.canScrollRight === nextState.canScrollRight
        ? previous
        : nextState,
    );
  }, []);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    updateScrollState();
    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(element);
    if (element.firstElementChild) {
      resizeObserver.observe(element.firstElementChild);
    }

    return () => resizeObserver.disconnect();
  }, [options, updateScrollState]);

  useEffect(() => {
    const container = scrollRef.current;

    if (!container) return;

    const selectedButton = container.querySelector<HTMLButtonElement>(
      'button[aria-pressed="true"]',
    );

    if (!selectedButton) return;

    const containerRect = container.getBoundingClientRect();
    const buttonRect = selectedButton.getBoundingClientRect();

    const visibleLeft = containerRect.left + container.clientLeft;
    const visibleRight = visibleLeft + container.clientWidth - 5;

    if (buttonRect.left < visibleLeft) {
      container.scrollBy({
        left: buttonRect.left - visibleLeft,
      });
    } else if (buttonRect.right > visibleRight) {
      container.scrollBy({
        left: buttonRect.right - visibleRight,
      });
    }
  }, [selectedOptionIndex, options]);

  const scrollOptions = (direction: number) => {
    const element = scrollRef.current;
    if (!element) return;

    element.scrollBy({ left: direction * element.clientWidth * 0.75 });
  };

  return (
    <div className={s.toolbar}>
      <p id={labelId} className={s.label}>Proposal options</p>

      <div className={s.optionsGroup} role="group" aria-labelledby={labelId}>
        {scrollState.hasOverflow && (
          <button
            type="button"
            className={s.scrollButton}
            aria-label="Scroll proposal options left"
            disabled={!scrollState.canScrollLeft}
            onClick={() => scrollOptions(-1)}
          >
            <ChevronRight className={s.leftChevron} width={10} height={10} aria-hidden="true" />
          </button>
        )}

        <div ref={scrollRef} className={s.scroll} onScroll={updateScrollState}>
          <div className={s.optionsList}>
            {options.map((optionIndex) => (
              <button
                key={optionIndex}
                type="button"
                className={s.option}
                aria-pressed={selectedOptionIndex === optionIndex}
                disabled={disabled}
                onClick={() => {
                  if (!disabled && optionIndex !== selectedOptionIndex) {
                    onOptionChange(optionIndex);
                  }
                }}
              >
                {`Option ${optionIndex + 1}`}
              </button>
            ))}
          </div>
        </div>

        {scrollState.hasOverflow && (
          <button
            type="button"
            className={s.scrollButton}
            aria-label="Scroll proposal options right"
            disabled={!scrollState.canScrollRight}
            onClick={() => scrollOptions(1)}
          >
            <ChevronRight width={10} height={10} aria-hidden="true" />
          </button>
        )}
      </div>

      <Button
        className={s.createButton}
        label="Create option"
        icon={CirclePlusIcon}
        disabled={disabled}
        onClick={onCreateOption}
      />
      
      <Button
        variant="primary"
        label="Approve option"
        icon={CheckIcon}
        disabled={disabled}
        onClick={(event) => {
          if (!disabled) {
            onApproveOption(event.currentTarget);
          }
        }}
      />
      
      <Button
        variant="danger"
        label="Delete option"
        icon={TrashIcon}
        disabled={disabled}
        onClick={(event) => {
          if (!disabled) onDeleteOption(event.currentTarget);
        }}
      />
    </div>
  );
};
