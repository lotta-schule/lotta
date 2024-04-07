import * as React from 'react';
import { render, within } from '../test-utils';
import { ButtonGroup } from './ButtonGroup';
import { Button } from './Button';

describe('ButtonGroup', () => {
  it('should render ButtonGroup with 3 buttons', () => {
    const screen = render(
      <ButtonGroup>
        <Button>A</Button>
        <Button>B</Button>
        <Button>C</Button>
      </ButtonGroup>
    );

    expect(screen.getByRole('group')).toBeVisible();
    expect(
      within(screen.getByRole('group')).getAllByRole('button')
    ).toHaveLength(3);
  });
});
