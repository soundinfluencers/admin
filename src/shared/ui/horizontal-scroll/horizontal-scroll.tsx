import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";

import ChevronIcon from '@/assets/icons/chevron-right.svg?react';

import s from "./horizontal-scroll.module.scss";

type HorizontalScrollProps = {
  label?: string;
  children: ReactNode;
  scrollStep?: number;
};

export const HorizontalScroll = ({
  label,
  children,
  scrollStep = 280,
}: HorizontalScrollProps) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const element = scrollRef.current;

    if (!element) {
      return;
    }

    const maxScrollLeft = element.scrollWidth - element.clientWidth;

    setCanScrollLeft(element.scrollLeft > 0);
    setCanScrollRight(element.scrollLeft < maxScrollLeft - 1);
  }, []);

  const handleScrollLeft = () => {
    scrollRef.current?.scrollBy({
      left: -scrollStep,
      behavior: "smooth",
    });
  };

  const handleScrollRight = () => {
    scrollRef.current?.scrollBy({
      left: scrollStep,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const element = scrollRef.current;

    if (!element) {
      return;
    }

    updateScrollState();

    element.addEventListener("scroll", updateScrollState, {
      passive: true,
    });

    const resizeObserver = new ResizeObserver(updateScrollState);

    resizeObserver.observe(element);

    if (element.firstElementChild) {
      resizeObserver.observe(element.firstElementChild);
    }

    return () => {
      element.removeEventListener("scroll", updateScrollState);
      resizeObserver.disconnect();
    };
  }, [updateScrollState]);

  return (
    <div className={s.root}>
      <div className={s.header}>
        {label && <p className={s.label}>{label}</p>}

        <div className={s.controls}>
          <button
            className={clsx(s.control, s.prev)}
            type="button"
            disabled={!canScrollLeft}
            aria-label="Scroll left"
            onClick={handleScrollLeft}
          >
            <ChevronIcon/>
          </button>

          <button
            className={clsx(s.control, s.next)}
            type="button"
            disabled={!canScrollRight}
            aria-label="Scroll right"
            onClick={handleScrollRight}
          >
            <ChevronIcon/>
          </button>
        </div>
      </div>

      <div ref={scrollRef} className={s.scroll}>
        {children}
      </div>
    </div>
  );
};
