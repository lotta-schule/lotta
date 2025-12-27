import * as React from 'react';
import { GangamStyleWidget } from 'test/fixtures';
import { render } from 'test/util';
import { IFrame } from './IFrame';

describe('shared/widgets/IFrame', () => {
  it('should show an iframe with the correct url', () => {
    const screen = render(<IFrame widget={GangamStyleWidget} />);
    const iframe = screen.getByTitle(/gangamstyle/i);

    expect(iframe).toBeVisible();
  });
});
