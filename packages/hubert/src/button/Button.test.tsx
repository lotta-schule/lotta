import * as React from 'react';
import { Close } from '../icon';
import { render } from '../test-utils';
import { Button } from './Button';

describe('shared/Button', () => {
  it('should render Button with label', () => {
    render(<Button>Click</Button>);
  });

  it('should render Button with icon', () => {
    render(<Button icon={<Close />} />);
  });
});
