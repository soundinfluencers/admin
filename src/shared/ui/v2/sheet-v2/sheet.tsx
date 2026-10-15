import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import clsx from "clsx";

import CloseIcon from "@/shared/assets/icons/close.svg?react";

import s from "./sheet.module.scss";

export interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  trigger?: ReactElement;
  className?: string;
  bodyClassName?: string;
  onCloseAutoFocus?: ComponentPropsWithoutRef<typeof Dialog.Content>["onCloseAutoFocus"];
}

export const Sheet = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  trigger,
  className,
  bodyClassName,
  onCloseAutoFocus,
}: SheetProps) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && (
        <Dialog.Trigger asChild>
          {trigger}
        </Dialog.Trigger>
      )}

      <Dialog.Portal>
        <Dialog.Overlay className={s.overlay} />

        <Dialog.Content
          className={clsx(s.content, className)}
          onCloseAutoFocus={onCloseAutoFocus}
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
                aria-label="Close sheet"
              >
                <CloseIcon aria-hidden="true" className={s.icon} />
              </button>
            </Dialog.Close>
          </div>

          <div className={clsx(s.body, bodyClassName)}>
            {children}
          </div>

          {footer != null && footer !== false && (
            <div className={s.footer}>
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
