import clsx from 'clsx';
import { List, ListProps } from '../list';

import styles from './MenuList.module.scss';

export type MenuListProps = ListProps;

export const MenuList = ({ className, ...props }: MenuListProps) => {
  return <List className={clsx(className, styles.root)} {...props} />;
};
