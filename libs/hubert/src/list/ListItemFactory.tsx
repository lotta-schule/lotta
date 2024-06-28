import * as React from 'react';
import { CollectionElement, Node } from '@react-types/shared';
import { Item } from '../menu';
import { ListItem, ListItemProps } from './ListItem';
import { Check } from '../icon';

export type ListItemPreliminaryItem = {
  key: React.Key;
  leftSection?: React.ReactNode;
  description?: string | React.ReactNode;
  rightSection?: React.ReactNode;
  style?: React.CSSProperties;
} & (
  | {
      label: string;
      textValue?: string;
    }
  | {
      label: React.ReactNode;
      textValue: string;
    }
) &
  (
    | {
        rightSection?: React.ReactNode;
        selected?: false;
      }
    | { selected?: true; rightSection?: React.ReactNode }
  );

export const ListItemFactory = {
  createItem: ({
    label,
    textValue,
    key,
    leftSection,
    description,
    ...other
  }: ListItemPreliminaryItem) => {
    const rightSection =
      'rightSection' in other && !!other.rightSection ? (
        other.rightSection
      ) : 'selected' in other && !!other.selected ? (
        <Check />
      ) : null;
    return (
      <Item key={key} textValue={textValue ?? (label as string)}>
        <span>{leftSection}</span>
        <span style={other.style}>{label}</span>
        {description ?? null}
        {rightSection}
      </Item>
    ) as CollectionElement<ListItemPreliminaryItem>;
  },

  createListItem: (
    item: Node<ListItemPreliminaryItem>,
    otherProps: ListItemProps & { ref?: React.Ref<HTMLLIElement> } = {}
  ) => {
    if (!Array.isArray(item.rendered)) {
      throw new Error('<Item /> must have more than one child');
    }
    const leftSection = item.rendered[0];
    const content = item.rendered[1];
    const description = item.rendered[2];
    const rightSection = item.rendered[3];

    return (
      <ListItem
        {...otherProps}
        leftSection={leftSection}
        rightSection={rightSection}
        isSelected={item.value?.selected ?? otherProps.selected}
      >
        <div>{content}</div>
        {description && <span>{description}</span>}
      </ListItem>
    );
  },
};
