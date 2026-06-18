'use client';

import * as React from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { invariant } from '@epic-web/invariant';
import { DraggableListItem } from './DraggableListItem';
import { List, ListProps } from './List';
import { flushSync } from 'react-dom';

export type SortableItem = {
  id: string;
  title: string;
  description?: string;
  selected?: boolean;
  icon?: React.ReactNode;
  iconTitle?: string;
  testId?: string;
  children?: React.ReactNode | React.ReactNode[];
  onClick?: () => void;
  onClickIcon?: (e: React.MouseEvent<HTMLDivElement>) => void;
};

export type SortableDraggableListProps<T extends SortableItem = SortableItem> =
  {
    id: string;
    className?: string;
    disabled?: boolean;
    items: T[];
    onChange: (items: T[]) => void;
    onDragStart?: () => void;
    onDragEnd?: () => void;
  } & Omit<ListProps, 'children' | 'onChange'>;

export const SortableDraggableList = ({
  id,
  items,
  onChange,
  disabled,
  onDragStart,
  onDragEnd,
  ...props
}: SortableDraggableListProps<SortableItem>) => {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const handleDragEnd = React.useCallback(
    (event: any) => {
      const { active, over } = event;

      if (active.id !== over.id) {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        invariant(oldIndex !== -1, 'Old index not found');
        invariant(newIndex !== -1, 'New index not found');

        const newArray = arrayMove(items, oldIndex, newIndex);

        onChange(newArray);
      }

      setActiveId(null);

      onDragEnd?.();
    },
    [items, onChange, onDragEnd]
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <DndContext
      id={id}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      onDragCancel={() => {
        setActiveId(null);
        onDragEnd?.();
      }}
      onDragStart={({ active: { id } }) => {
        flushSync(() => {
          onDragStart?.();
        });
        setActiveId(id as string);
      }}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <List {...props}>
          {items.map(
            (
              {
                id,
                title,
                selected,
                icon,
                iconTitle,
                onClick,
                onClickIcon,
                testId,
                children,
              },
              i
            ) => (
              <DraggableListItem
                key={i}
                id={id}
                icon={icon}
                iconTitle={iconTitle}
                title={title}
                isDraggable={!disabled}
                selected={selected}
                data-testid={testId}
                style={
                  activeId !== null
                    ? activeId === id
                      ? { opacity: 1.0, marginLeft: 'var(--lotta-spacing)' }
                      : { opacity: 0.7 }
                    : {}
                }
                onClick={onClick}
                onClickIcon={onClickIcon}
              >
                {children}
              </DraggableListItem>
            )
          )}
        </List>
      </SortableContext>
      <DragOverlay>
        {activeId && (
          <DraggableListItem
            id={activeId}
            title={items.find((item) => item.id === activeId)?.title ?? ''}
            style={{ pointerEvents: 'none', scale: 0 }}
          />
        )}
      </DragOverlay>
    </DndContext>
  );
};
