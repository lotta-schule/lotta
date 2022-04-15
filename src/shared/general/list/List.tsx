import * as React from 'react';
import clsx from 'clsx';

import styles from './List.module.scss';

export type ListProps = React.HTMLProps<HTMLUListElement>;

export const List: React.FC<ListProps> = ({
    children,
    className,
    ...props
}) => {
    return (
        <ul className={clsx(styles.root, className)} {...props}>
            {children}
        </ul>
    );
};
List.displayName = 'List';

export interface ListItemProps extends React.HTMLProps<HTMLLIElement> {
    leftSection?: React.ReactNode;
    rightSection?: React.ReactNode;
}

export const ListItem: React.FC<ListItemProps> = ({
    children,
    className,
    leftSection,
    rightSection,
    ...props
}) => {
    return (
        <li className={clsx(styles.li, className)} {...props}>
            {leftSection && <div>{leftSection}</div>}
            <div className={styles.mainSection}>{children}</div>
            {rightSection && <div>{rightSection}</div>}
        </li>
    );
};
ListItem.displayName = 'ListItem';

export type ListItemSecondaryTextProps = React.HTMLProps<HTMLSpanElement>;

export const ListItemSecondaryText: React.FC<ListItemSecondaryTextProps> = ({
    children,
}) => <span className={styles.listItemSecondaryText}>{children}</span>;
ListItemSecondaryText.displayName = 'ListItemSecondaryText';
