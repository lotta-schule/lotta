import * as React from 'react';
import { render } from 'test/util';
import { Icon } from 'shared/Icon';
import { faCircle } from '@fortawesome/free-regular-svg-icons';

describe('Icon', () => {
  it('should render', () => {
    const screen = render(<Icon icon={faCircle} size={'xl'} />);
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });
});
