import * as React from 'react';
import { render } from '@testing-library/react';
import { Button } from '../../button/Button';
import { Tooltip } from './Tooltip';
import { userEvent } from 'test-utils';

describe('util/Tooltip', () => {
  it('should render', () => {
    const screen = render(
      <Tooltip label="Test">
        <Button>Test</Button>
      </Tooltip>
    );
    expect(screen.container).toMatchSnapshot();
  });

  it('should keep a button clickable', async () => {
    const fireEvent = userEvent.setup();
    const onClick = vi.fn();
    const screen = render(
      <Tooltip label="Test">
        <Button onClick={onClick}>Test</Button>
      </Tooltip>
    );
    await fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });
});
