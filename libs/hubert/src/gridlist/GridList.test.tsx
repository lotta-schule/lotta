import * as React from 'react';
import { render } from '../test-utils';
import { GridList, GridListItem } from './GridList';

describe('GridList', () => {
  it('should render a GridList', () => {
    const screen = render(
      <GridList>
        <GridListItem>
          <img src="https://picsum.photos/600/400" alt="" />
        </GridListItem>
        <GridListItem>
          <img src="https://picsum.photos/600/400" alt="" />
        </GridListItem>
        <GridListItem>
          <img src="https://picsum.photos/600/400" alt="" />
        </GridListItem>
        <GridListItem>
          <img src="https://picsum.photos/600/400" alt="" />
        </GridListItem>
        <GridListItem>
          <img src="https://picsum.photos/600/400" alt="" />
        </GridListItem>
      </GridList>
    );

    expect(screen.getByRole('list')).toMatchInlineSnapshot(`
      <ul
        class="_root_iu0h6_1"
      >
        <li>
          <img
            alt=""
            src="https://picsum.photos/600/400"
          />
        </li>
        <li>
          <img
            alt=""
            src="https://picsum.photos/600/400"
          />
        </li>
        <li>
          <img
            alt=""
            src="https://picsum.photos/600/400"
          />
        </li>
        <li>
          <img
            alt=""
            src="https://picsum.photos/600/400"
          />
        </li>
        <li>
          <img
            alt=""
            src="https://picsum.photos/600/400"
          />
        </li>
      </ul>
    `);
  });
});
