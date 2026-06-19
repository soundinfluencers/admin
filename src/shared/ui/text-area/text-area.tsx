import React, { forwardRef } from "react";
import clsx from "clsx";

import s from "./text-area.module.scss";

interface TextAreaProps extends React.ComponentProps<"textarea"> {
  label?: string;
  error?: string;
  hideErrorMessage?: boolean;
  reserveErrorSpace?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, label, error, hideErrorMessage, reserveErrorSpace, id, name, ...props }, ref) => {
    const textAreaId = id ?? name;

    return (
      <div className={s.root}>
        {label && (
          <label
            htmlFor={textAreaId}
            className={clsx(s.label, {
              [s.labelError]: Boolean(error),
            })}
          >
            {label}
          </label>
        )}

          <textarea
            ref={ref}
            id={textAreaId}
            name={name}
            className={clsx(s.textArea, className, {
              [s.textAreaError]: Boolean(error),
            })}
            {...props}
          />

        {(error || reserveErrorSpace) && (
          <p
            className={clsx(
              s.error,
              (!error || hideErrorMessage) && s.errorTextHidden
            )}
          >
            {error || "\u00A0"}
          </p>
        )}
      </div>
    );
  }
);

TextArea.displayName = "TextArea";

