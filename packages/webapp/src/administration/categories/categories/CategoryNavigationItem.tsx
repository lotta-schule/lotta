import * as React from 'react';
import { DragHandle } from '@lotta-schule/hubert';
import { DraggableProvidedDragHandleProps } from 'react-beautiful-dnd';
import clsx from 'clsx';

import styles from './CategoryNavigationItem.module.scss';

export interface CategoryNavigationItemProps
  extends React.HTMLProps<HTMLDivElement> {
  dragHandleProps?: DraggableProvidedDragHandleProps;
  title: string;
}

export const CategoryNavigationItem = React.memo(
  React.forwardRef(
    (
      {
        className,
        dragHandleProps,
        title,
        ...divProps
      }: CategoryNavigationItemProps,
      ref: React.ForwardedRef<HTMLDivElement>
    ) => {
      return (
        <div
          className={clsx(className, styles.root)}
          role={'button'}
          aria-label={title}
          {...divProps}
          ref={ref}
        >
          {dragHandleProps && (
            <div
              className={styles.dragHandle}
              {...dragHandleProps}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <DragHandle className={styles.moveCategoryHandlerIcon} />
            </div>
          )}
          <div className={styles.titleWrapper}>
            <b>{title}</b>
          </div>
        </div>
      );
    }
  )
);
CategoryNavigationItem.displayName = 'CategoryNavigationItem';
