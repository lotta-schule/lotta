'use client';

import { HTMLProps, MouseEventHandler } from 'react';
import { DragHandle } from '../icon/DragHandle';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import clsx from 'clsx';

import styles from './DraggableListItem.module.scss';

export type DraggableListItemProps = HTMLProps<HTMLDivElement> & {
  id: string;
  isDraggable?: boolean;
  onClickIcon?: MouseEventHandler<HTMLDivElement>;
  icon?: React.ReactNode;
  selected?: boolean;
  title: string;
};

export const DraggableListItem = ({
  title,
  className,
  isDraggable = true,
  selected,
  icon,
  onClick,
  onClickIcon,
  children,
  ...props
}: DraggableListItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: props.id, disabled: !isDraggable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      {...attributes}
      {...props}
      ref={setNodeRef}
      onClick={onClick}
      aria-current={selected ? 'page' : undefined}
      className={clsx(className, styles.root, {
        [styles.selected]: selected,
        [styles.isClickable]: onClick,
      })}
    >
      <li title={title} style={style}>
        {isDraggable && (
          <div
            className={styles.dragHandle}
            aria-label="Reihenfolge ändern"
            data-testid="drag-handle"
            {...listeners}
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
      {children}
    </div>
  );
};
