import * as React from 'react';

import styles from './List.module.scss';

export type ListItemSecondaryTextProps = React.HTMLProps<HTMLSpanElement>;

export const ListItemSecondaryText: React.FC<ListItemSecondaryTextProps> = ({
  children,
}) => <span className={styles.listItemSecondaryText}>{children}</span>;
ListItemSecondaryText.displayName = 'ListItemSecondaryText';
