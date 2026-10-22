import type {
  ComponentPropsWithRef,
  ComponentType,
  SVGProps,
} from "react";

export type IconButtonVariant = "base" | "primary" | "danger";

export type IconButtonSize = "small" | "medium" | "large";

export type IconButtonIcon = ComponentType<SVGProps<SVGSVGElement>>;

type IconButtonOwnProps = {
  icon?: IconButtonIcon;
  "aria-label": string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  isLoading?: boolean;
};

export type IconButtonProps = IconButtonOwnProps &
  Omit<
    ComponentPropsWithRef<"button">,
    keyof IconButtonOwnProps | "children" | "dangerouslySetInnerHTML"
  >;
