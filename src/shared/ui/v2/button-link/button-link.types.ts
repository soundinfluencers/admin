import type {
  ComponentPropsWithRef,
  ComponentType,
  SVGProps,
} from "react";

import type { Link } from "react-router-dom";

export type ButtonLinkVariant = "base" | "primary" | "danger";

export type ButtonLinkSize = "small" | "medium" | "large";

export type ButtonLinkIcon = ComponentType<SVGProps<SVGSVGElement>>;

type ButtonLinkContent =
  | {
  label: string;
  icon?: ButtonLinkIcon;
  "aria-label"?: string;
  fullWidth?: boolean;
}
  | {
  label?: never;
  icon: ButtonLinkIcon;
  "aria-label": string;
  fullWidth?: false;
};

type ButtonLinkOwnProps = ButtonLinkContent & {
  variant?: ButtonLinkVariant;
  size?: ButtonLinkSize;
};

type OmittedProps =
  | keyof ButtonLinkOwnProps
  | "children"
  | "dangerouslySetInnerHTML"
  | "href"
  | "to";

type NativeLinkProps = {
  href: string;
  to?: never;
} & Omit<ComponentPropsWithRef<"a">, OmittedProps>;

type RouterLinkProps = {
  to: ComponentPropsWithRef<typeof Link>["to"];
  href?: never;
} & Omit<ComponentPropsWithRef<typeof Link>, OmittedProps>;

export type ButtonLinkProps = ButtonLinkOwnProps & (NativeLinkProps | RouterLinkProps);
