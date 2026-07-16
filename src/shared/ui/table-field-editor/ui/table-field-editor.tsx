import {
  forwardRef,
  type InputHTMLAttributes,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import s from './table-field-editor.module.scss';

interface TableFieldEditorProps {
  initialValue: string;
  onSaveChange: (value: string) => void;
  isPending?: boolean;
  onClose: () => void;
  inputId?: string;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  sanitizeValue?: (value: string) => string;
}

export const TableFieldEditor = forwardRef<HTMLInputElement, TableFieldEditorProps>(
  ({
    initialValue,
    inputId,
    inputMode,
    onClose,
    onSaveChange,
    isPending,
    sanitizeValue,
  }, forwardedRef) => {
    const [currentValue, setCurrentValue] = useState(initialValue);
    const inputRef = useRef<HTMLInputElement>(null);
    const isCancelledRef = useRef(false);

    useImperativeHandle(forwardedRef, () => inputRef.current!, []);

    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.focus();

        const length = inputRef.current.value.length;
        inputRef.current.setSelectionRange(length, length);
      }
    }, []);

    useEffect(() => {
      setCurrentValue(initialValue);
    }, [initialValue]);

    return (
      <input
        id={inputId}
        ref={inputRef}
        className={s.input}
        value={currentValue}
        placeholder=""
        inputMode={inputMode}
        onChange={(e) =>
          setCurrentValue(
            sanitizeValue
              ? sanitizeValue(e.target.value)
              : e.target.value,
          )
        }
        onBlur={() => {
          if (isCancelledRef.current) {
            isCancelledRef.current = false;
            return;
          }

          onSaveChange(currentValue);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            inputRef.current?.blur();
          }

          if (e.key === "Escape") {
            e.preventDefault();
            isCancelledRef.current = true;
            setCurrentValue(initialValue);
            onClose();
          }
        }}
        disabled={isPending}
        autoComplete={"off"}
      />
    );
  }
);
