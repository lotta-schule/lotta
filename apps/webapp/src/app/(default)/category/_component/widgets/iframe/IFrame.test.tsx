import * as React from 'react';
import { GangamStyleWidget } from '#/test/fixtures/index.js';
import { render } from '#/test/util.js';
import { IFrame } from './IFrame.js';

describe('shared/widgets/IFrame', () => {
  it('should show an iframe with the correct url', () => {
    const screen = render(<IFrame widget={GangamStyleWidget} />);
    const iframe = screen.getByTitle(/gangamstyle/i);

    expect(iframe).toBeVisible();
  });
});
