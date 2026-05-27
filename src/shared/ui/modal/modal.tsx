import { type PropsWithChildren, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useClickOutside } from "@/shared/hooks/use-click-outside.ts";
import { useLockBodyScroll } from "@/shared/hooks/use-lock-body-scroll.ts";

import clsx from "clsx";
import close from '@/assets/icons/x.svg';

import s from './modal.module.scss';

interface Props extends PropsWithChildren {
  onClose?: () => void;
  isShownCloseButton?: boolean;
  className?: string;
  contentClassName?: string;
}

export const Modal = ({
  onClose,
  isShownCloseButton = false,
  children,
  className,
  contentClassName,
}: Props) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useLockBodyScroll(true);

  useClickOutside(modalRef, () => {
    if (onClose) {
      onClose();
    }
  });

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return createPortal(
    <div className={clsx(s.modal, className)} aria-hidden={false}>
      <div className={clsx(s.content, contentClassName)} ref={modalRef} role={'dialog'} aria-modal={true} tabIndex={-1}>
        {children}

        {isShownCloseButton && (
          <button
            className={s.closeBtn}
            onClick={onClose}
            type="button"
            aria-label="Close modal"
          >
            <img
              className={s.closeIcon}
              src={close}
              alt="Close modal"
              width={24}
              height={24}
            />
          </button>
        )}
      </div>
    </div>,
    document.body,
  );
};
