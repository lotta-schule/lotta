import * as React from 'react';
import { Menu as HeadlessMenu } from '@headlessui/react';
import { List, ListItem, ListItemProps, ListProps } from '../list/List';
import clsx from 'clsx';

import styles from './MenuList.module.scss';

export type MenuListProps = ListProps;

export const MenuList: React.FC<MenuListProps> = ({ className, ...props }) => {
    return <List className={clsx(styles.root, className)} {...props} />;
};

export const MenuItem: React.FC<Omit<ListItemProps, 'ref'>> = ({
    className,
    children,
    onClick,
    ...props
}) => {
    return (
        <HeadlessMenu.Item>
            <ListItem
                onClick={onClick}
                className={className}
                {...(props as any)}
            >
                {children}
            </ListItem>
        </HeadlessMenu.Item>
    );
};
