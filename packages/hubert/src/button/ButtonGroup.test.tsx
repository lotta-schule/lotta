import * as React from 'react';
import { render } from '../test-utils';
import { ButtonGroup } from './ButtonGroup';
import { Button } from './Button';

describe('ButtonGroup', () => {
  it('should render ButtonGroup with 3 buttons', () => {
    render(
      <ButtonGroup>
        <Button>A</Button>
        <Button>B</Button>
        <Button>C</Button>
      </ButtonGroup>
    );
  });
});
