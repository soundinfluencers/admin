import { useCallback, useEffect, useId, useRef, useState } from "react";

import ChevronRight from "@/shared/assets/icons/chevron-right.svg?react";
import Plus from "@/shared/assets/icons/plus.svg?react";

import s from './proposal-option-toolbar.module.scss';

interface ProposalOptionToolbarProps {
  options: readonly number[];
  selectedOptionIndex: number;
  onOptionChange: (optionIndex: number) => void;
  onCreateOption: () => void;
  disabled?: boolean;
}

export const ProposalOptionToolbar = ({
  options,
  selectedOptionIndex,
  onOptionChange,
  onCreateOption,
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

      <button
        type="button"
        className={s.createButton}
        disabled={disabled}
        onClick={onCreateOption}
      >
        <Plus width={12} height={12} aria-hidden="true" />
        Create additional proposal option
      </button>
    </div>
  );
};
