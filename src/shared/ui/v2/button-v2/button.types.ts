import type {
  ComponentPropsWithRef,
  ComponentType,
  SVGProps,
} from "react";

export type ButtonVariant = "base" | "primary" | "danger";

export type ButtonSize = "small" | "medium" | "large";

export type ButtonIcon = ComponentType<
  SVGProps<SVGSVGElement>
>;

type ButtonOwnProps = {
  label: string;
  icon?: ButtonIcon;
  isLoading?: boolean;
  loadingLabel?: string;
  reserveLabel?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

export type ButtonProps = ButtonOwnProps &
  Omit<
    ComponentPropsWithRef<"button">,
    | keyof ButtonOwnProps
    | "children"
    | "dangerouslySetInnerHTML"
  >;
