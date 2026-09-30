import React from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";

import chevronRight from "@/assets/icons/chevron-right.svg";

import styles from './page-breadcrumbs.module.scss';

interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface PageBreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const PageBreadcrumbs: React.FC<PageBreadcrumbsProps> = ({ items, className }) => {
  return (
    <nav className={clsx(styles.breadcrumbs, className)} aria-label="breadcrumbs">
      <ol className={styles.list}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className={styles.item}>
              {item.to && !isLast ? (
                <Link to={item.to} className={styles.link}>{item.label}</Link>
              ) : (
                <span className={styles.current}>{item.label}</span>
              )}

              {!isLast && <img src={chevronRight} className={styles.icon} alt={""} aria-hidden={true} width={24} height={24} />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
