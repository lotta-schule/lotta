import * as React from 'react';
import { render } from '#/test/util.js';
import { Icon } from './Icon.js';
import { faCircle } from '@fortawesome/free-regular-svg-icons';

describe('Icon', () => {
  it('should render', () => {
    const screen = render(<Icon icon={faCircle} size={'xl'} />);
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });
});
