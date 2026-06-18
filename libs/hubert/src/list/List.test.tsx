import * as React from 'react';
import { render } from '../test-utils';
import { Avatar } from '../avatar/Avatar';
import { Button } from '../button/Button';
import { List } from './List';
import { ListItem } from './ListItem';

describe('List', () => {
  it('should render', () => {
    const screen = render(
      <List>
        <ListItem>Test</ListItem>
        <ListItem>Test</ListItem>
        <ListItem>Test</ListItem>
        <ListItem>Test</ListItem>
      </List>
    );
    expect(screen.getByRole('list')).toMatchSnapshot();
  });

  it('should render with subsection left', () => {
    const screen = render(
      <List>
        <ListItem leftSection={<Avatar src={''} />}>Test</ListItem>
        <ListItem leftSection={<Avatar src={''} />}>Test</ListItem>
        <ListItem leftSection={<Avatar src={''} />}>Test</ListItem>
        <ListItem leftSection={<Avatar src={''} />}>Test</ListItem>
      </List>
    );
    expect(screen.getByRole('list')).toMatchSnapshot();
  });

  it('should render with subsection right', () => {
    const screen = render(
      <List>
        <ListItem
          leftSection={<Avatar src={''} />}
          rightSection={<Button>Test</Button>}
        >
          Test
        </ListItem>
        <ListItem rightSection={<Button>Test</Button>}>Test</ListItem>
        <ListItem rightSection={<Button>Test</Button>}>Test</ListItem>
        <ListItem rightSection={<Button>Test</Button>}>Test</ListItem>
      </List>
    );
    expect(screen.getByRole('list')).toMatchSnapshot();
  });
});
