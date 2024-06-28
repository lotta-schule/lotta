import * as React from 'react';
import { ItemProps } from '@react-types/shared';
import { Close, ChevronRight } from '../icon';
import { Item } from '../menu';
import { render } from '../test-utils';
import { ListItemFactory, ListItemPreliminaryItem } from './ListItemFactory';

describe('list/ListItemFactory', () => {
  describe('create Item', () => {
    it('should render an item with complete information for a listItem', () => {
      const preliminaryItem: ListItemPreliminaryItem = {
        key: 'test',
        label: 'Test',
        leftSection: <Close />,
        rightSection: <ChevronRight />,
        description: 'Test description',
      };

      const item = ListItemFactory.createItem(preliminaryItem);

      expect(item.key).toEqual('test');
      expect(item.type).toBe(Item);
      expect(
        (item.props as ItemProps<ListItemPreliminaryItem>).textValue
      ).toEqual('Test');
      expect(item.props.children).toHaveLength(4);
      expect(
        JSON.stringify(
          React.Children.toArray(item.props.children as any),
          null,
          2
        )
      ).toMatchSnapshot();
    });

    it('should also have four children for minimal information for a listItem', () => {
      const preliminaryItem: ListItemPreliminaryItem = {
        key: 'test',
        label: 'Test',
      };

      const item = ListItemFactory.createItem(preliminaryItem);

      expect(item.key).toEqual('test');
      expect(item.props.children).toHaveLength(4);
    });
  });

  describe('create ListItem', () => {
    it('should render a listItem with complete information from an item with icons', () => {
      const screen = render(
        ListItemFactory.createListItem({
          rendered: ListItemFactory.createItem({
            key: 'test',
            label: 'Test',
            leftSection: <Close />,
            rightSection: <ChevronRight />,
            description: 'Test description',
          }).props.children,
        } as any)
      );
      expect(screen.getByRole('listitem')).toMatchSnapshot();
    });

    it('should render a listItem with complete information from an item with description', () => {
      const screen = render(
        ListItemFactory.createListItem({
          rendered: ListItemFactory.createItem({
            key: 'test',
            label: 'Test',
          }).props.children,
        } as any)
      );
      expect(screen.getByRole('listitem')).toMatchSnapshot();
    });
  });
});
