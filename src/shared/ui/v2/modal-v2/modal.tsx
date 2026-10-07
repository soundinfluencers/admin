import type { ReactElement, ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import clsx from "clsx";

import CloseIcon from "@/shared/assets/icons/close.svg?react";

import s from "./modal.module.scss";

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  trigger?: ReactElement;
  className?: string;
}

export const Modal = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  trigger,
  className,
}: ModalProps) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && (
        <Dialog.Trigger asChild>
          {trigger}
        </Dialog.Trigger>
      )}

      <Dialog.Portal>
        <Dialog.Overlay className={s.overlay}>
          <Dialog.Content
            className={clsx(s.content, className)}
            {...(!description ? { "aria-describedby": undefined } : {})}
          >
            <div className={s.header}>
              <div className={s.titleGroup}>
                <Dialog.Title className={s.title}>
                  {title}
                </Dialog.Title>

                {description && (
                  <Dialog.Description className={s.description}>
                    {description}
                  </Dialog.Description>
                )}
              </div>

              <Dialog.Close asChild>
                <button
                  type="button"
                  className={s.close}
                  aria-label="Close dialog"
                >
                  <CloseIcon aria-hidden="true" className={s.icon} />
                </button>
              </Dialog.Close>
            </div>

            {children}
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
