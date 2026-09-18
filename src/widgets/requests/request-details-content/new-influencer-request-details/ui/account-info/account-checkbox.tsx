import { Root, Indicator } from "@radix-ui/react-checkbox";

import CheckIcon from '@/assets/icons/check.svg?react';

import s from './account-checkbox.module.scss'

interface AccountCheckboxProps {
  accountId: string;
  checked: boolean;
  onCheckedChange: () => void;
}

export const AccountCheckbox = ({
  accountId,
  checked,
  onCheckedChange,
}: AccountCheckboxProps) => {
  return (
    <Root
      className={s.root}
      id={`account-checkbox-${accountId}`}
      checked={checked}
      onCheckedChange={onCheckedChange}
      aria-label={`Select social account ${accountId}`}
    >
      <Indicator className={s.indicator}>
        <CheckIcon className={s.icon} />
      </Indicator>
    </Root>
  );
};
