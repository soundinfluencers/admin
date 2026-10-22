import { useId, useState } from "react";
import * as Select from "@radix-ui/react-select";
import { EditorField } from "../../editor-field/editor-field.tsx";

import {
  formatDateRequest,
  parseDateRequest,
  type TDateRequestMode,
} from "./date-request.helpers.ts";

import Chevron from '@/shared/assets/icons/chevron-right.svg?react';

import s from "./campaign-date-request.module.scss";

interface CampaignDateRequestProps {
  readOnly: boolean;
  disabled?: boolean;
  value: string;
  onChange: (dateRequest: string) => void;
}

export const CampaignDateRequest = ({
  readOnly,
  disabled = false,
  value,
  onChange,
}: CampaignDateRequestProps) => {
  const modeId = useId();
  const dateId = useId();

  const parsed = parseDateRequest(value);

  const [draftMode, setDraftMode] = useState<TDateRequestMode | null>(null);

  const mode = readOnly ? parsed.mode : draftMode ?? parsed.mode;

  const applyValue = (nextValue: string) => {
    if (readOnly || disabled) return;
    
    if (nextValue !== value) {
      onChange(nextValue);
    }
  };

  const handleModeChange = (nextMode: TDateRequestMode) => {
    if (readOnly || disabled) return;
    
    if (nextMode === "ASAP") {
      setDraftMode(null);
      applyValue("ASAP");
      return;
    }

    setDraftMode(nextMode);
    applyValue(formatDateRequest(nextMode, parsed.date));
  };

  const handleDateChange = (date: string) => {
    if (readOnly || disabled) return;
    
    setDraftMode(mode);
    applyValue(formatDateRequest(mode, date));
  };
  
  return (
    <EditorField
      className={s.field}
      label="Publication date" 
      htmlFor={modeId}
    >
      <div className={s.control}>
        <Select.Root
          value={mode}
          onValueChange={(nextMode) => {
            if (
              nextMode === "ASAP" ||
              nextMode === "AFTER" ||
              nextMode === "BEFORE"
            ) {
              handleModeChange(nextMode);
            }
          }}
          disabled={readOnly || disabled}
        >
          <Select.Trigger id={modeId} className={s.dateMode}>
            <Select.Value />
            <Chevron className={s.chevron} />
          </Select.Trigger>

          <Select.Portal>
            <Select.Content
              className={s.dateModeDropdown}
              position="popper"
              side="bottom"
              align="start"
              sideOffset={6}
              collisionPadding={12}
            >
              <Select.Viewport>
                {(["ASAP", "AFTER", "BEFORE"] as const).map((item) => (
                  <Select.Item
                    key={item}
                    value={item}
                    className={s.dateModeOption}
                  >
                    <Select.ItemText>{item}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>

        {mode !== "ASAP" && (
          <input
            id={dateId}
            className={s.input}
            type="date"
            readOnly={readOnly || disabled}
            aria-label={`Publication date ${mode.toLowerCase()}`}
            min="2000-01-01"
            max="2099-12-31"
            value={parsed.date}
            onChange={(e) => handleDateChange(e.target.value)}
          />
        )}
      </div>
    </EditorField>
  );
};
