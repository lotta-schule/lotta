'use client';

import * as React from 'react';
import { MoveArrow } from '../icon';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import clsx from 'clsx';

import styles from './DraggableListItem.module.scss';

export type DraggableListItemProps = React.HTMLProps<HTMLDivElement> & {
  id: string;
  isDraggable?: boolean;
  onClick?: React.MouseEventHandler<HTMLLIElement>;
  onClickIcon?: React.MouseEventHandler<HTMLDivElement>;
  icon?: React.ReactNode;
  iconTitle?: string;
  selected?: boolean;
  title: string;
};

export const DraggableListItem = ({
  title,
  className,
  isDraggable = true,
  selected,
  icon,
  iconTitle,
  onClick,
  onClickIcon,
  children,
  ...props
}: DraggableListItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: props.id, disabled: !isDraggable });

  return (
    <div
      {...attributes}
      {...props}
      ref={setNodeRef}
      style={{
        ...props.style,
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      aria-current={selected ? 'page' : undefined}
      aria-disabled={
        props['aria-disabled'] || onClick
          ? undefined
          : attributes['aria-disabled']
      }
      className={clsx(className, styles.root, {
        [styles.selected]: selected,
        [styles.isClickable]: onClick,
      })}
    >
      {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- <li> is the interactive surface; a nested button would require significant DOM restructuring */}
      <li
        title={title}
        onClick={onClick}
        onKeyDown={
          onClick
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onClick(e as unknown as React.MouseEvent<HTMLLIElement>);
                }
              }
            : undefined
        }
      >
        {isDraggable && (
          <button
            type="button"
            className={styles.dragHandle}
            aria-label="Reihenfolge ändern"
            data-testid="drag-handle"
            {...listeners}
            onClick={(e) => {
              e.stopPropagation();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation();
              }
            }}
          >
            <MoveArrow className={styles.moveCategoryHandlerIcon} />
          </button>
        )}
        <div className={styles.titleWrapper}>{title}</div>
        {icon && (
          // oxlint-disable-next-line jsx-a11y/no-static-element-interactions -- role and handlers are conditionally set together; linter can't evaluate ternary
          <div
            className={clsx(styles.icon, {
              [styles.isIconClickable]: onClickIcon,
            })}
            role={onClickIcon ? 'button' : undefined}
            tabIndex={onClickIcon ? 0 : undefined}
            aria-label={iconTitle}
            onClick={
              onClickIcon
                ? (e) => {
                    e.stopPropagation();
                    onClickIcon(e);
                  }
                : undefined
            }
            onKeyDown={
              onClickIcon
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.stopPropagation();
                      onClickIcon(
                        e as unknown as React.MouseEvent<HTMLDivElement>
                      );
                    }
                  }
                : undefined
            }
          >
            {icon}
          </div>
        )}
      </li>
      {children}
    </div>
  );
};
