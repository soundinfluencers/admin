import React, { type ReactNode } from "react";
import { Container, Logo } from "@/shared/ui";

import styles from './app-header.module.scss';

interface AppHeaderProps {
  rightSlot?: ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ rightSlot }) => {
  return (
    <header className={styles.appHeader}>
      <Container>
        <div className={styles.appHeaderInner}>
          <Logo />
          {rightSlot && (rightSlot)}
        </div>
      </Container>
    </header>
  );
};
