import { useRef, useState, type ChangeEvent, type FocusEvent, type KeyboardEvent } from "react";
import clsx from "clsx";

import s from './inline-integer-input.module.scss';

interface InlineIntegerInputProps {
  value: number;
  onApply: (value: number) => void;
  "aria-label": string;
  className?: string;
  id?: string;
}

export const InlineIntegerInput = ({
  value,
  onApply,
  "aria-label": ariaLabel,
  className,
  id,
}: InlineIntegerInputProps) => {
  const [draft, setDraft] = useState<string | null>(null);
  const cancelOnBlurRef = useRef(false);
  
  const handleFocus = () => {
    cancelOnBlurRef.current = false;
    setDraft(String(value));
  };
  
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const nextDraft = e.currentTarget.value;
    
    if (nextDraft === "") {
      setDraft("");
      return;
    }

    if (!/^[0-9]+$/.test(nextDraft)) return;

    if (!Number.isSafeInteger(Number(nextDraft))) return;
    
    setDraft(nextDraft);
  };
  
  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    const inputValue = e.currentTarget.value;
    
    setDraft(null);
    
    if (cancelOnBlurRef.current) {
      cancelOnBlurRef.current = false;
      return;
    }
    
    if (inputValue === "") return;

    if (!/^[0-9]+$/.test(inputValue)) return;

    const nextValue = Number(inputValue);

    if (!Number.isSafeInteger(nextValue) || nextValue < 0) return;

    if (nextValue === value) return;

    onApply(nextValue);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;

    if (event.key === "Enter") {
      event.preventDefault();
      
      event.currentTarget.blur();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      
      cancelOnBlurRef.current = true;
      event.currentTarget.blur();
    }
  };
  
  return (
    <input
      id={id}
      className={clsx(s.input, className)}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      spellCheck={false}
      aria-label={ariaLabel}
      value={draft ?? String(value)}
      onFocus={handleFocus}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    />
  );
};
