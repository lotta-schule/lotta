import * as React from 'react';

import styles from './List.module.scss';

export type ListItemSecondaryTextProps = React.HTMLProps<HTMLSpanElement>;

export const ListItemSecondaryText = ({
  children,
}: ListItemSecondaryTextProps) => (
  <span className={styles.listItemSecondaryText}>{children}</span>
);
ListItemSecondaryText.displayName = 'ListItemSecondaryText';
