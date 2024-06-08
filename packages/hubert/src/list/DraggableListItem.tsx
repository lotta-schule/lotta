import { HTMLProps, MouseEventHandler } from 'react';
import { DragHandle } from '../icon/DragHandle';
import { DraggableProvidedDragHandleProps } from 'react-beautiful-dnd';
import clsx from 'clsx';

import styles from './DraggableListItem.module.scss';

export type DraggableListItemProps = Omit<
  HTMLProps<HTMLLIElement>,
  'children'
> & {
  dragHandleProps?: DraggableProvidedDragHandleProps;
  onClickIcon?: MouseEventHandler<HTMLDivElement>;
  icon?: React.ReactNode;
  selected?: boolean;
  title: string;
};

export const DraggableListItem = ({
  title,
  dragHandleProps,
  className,
  selected,
  icon,
  onClick,
  onClickIcon,
  ...props
}: DraggableListItemProps) => {
  return (
    <li
      onClick={onClick}
      title={title}
      {...props}
      className={clsx(className, styles.root, {
        [styles.selected]: selected,
        [styles.isClickable]: onClick,
      })}
    >
      {dragHandleProps && (
        <div
          className={styles.dragHandle}
          aria-label="Reihenfolge ändern"
          {...dragHandleProps}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <DragHandle className={styles.moveCategoryHandlerIcon} />
        </div>
      )}
      <div className={styles.titleWrapper}>{title}</div>
      {icon && (
        <div
          className={clsx(styles.icon, {
            [styles.isIconClickable]: onClickIcon,
          })}
          onClick={(e) => {
            if (onClickIcon) {
              e.stopPropagation();
              onClickIcon(e);
            }
          }}
        >
          {icon}
        </div>
      )}
    </li>
  );
};
