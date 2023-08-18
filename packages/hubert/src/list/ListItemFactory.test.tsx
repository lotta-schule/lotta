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
        React.Children.toArray(item.props.children as any).find(
          (child: React.ReactNode) => child === 'Test'
        )
      ).toBeTruthy();
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
    it('should render a listItem with complete information from an item', () => {
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
      expect(screen.getByRole('listitem')).toMatchInlineSnapshot(`
            <li
              class="li"
            >
              <div>
                <span>
                  <svg
                    aria-hidden="true"
                    class="root"
                    focusable="false"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                    />
                  </svg>
                </span>
              </div>
              <div
                class="mainSection"
              >
                <div>
                  Test
                </div>
                <span>
                  Test description
                </span>
              </div>
              <div>
                <svg
                  aria-hidden="true"
                  class="root"
                  focusable="false"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"
                  />
                </svg>
              </div>
            </li>
      `);
    });

    it('should render a listItem with complete information from an item', () => {
      const screen = render(
        ListItemFactory.createListItem({
          rendered: ListItemFactory.createItem({
            key: 'test',
            label: 'Test',
          }).props.children,
        } as any)
      );
      expect(screen.getByRole('listitem')).toMatchInlineSnapshot(`
            <li
              class="li"
            >
              <div>
                <span />
              </div>
              <div
                class="mainSection"
              >
                <div>
                  Test
                </div>
              </div>
            </li>
      `);
    });
  });
});
