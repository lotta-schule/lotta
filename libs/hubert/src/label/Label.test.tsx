import * as React from 'react';
import { render } from '../test-utils.js';
import { Label } from './Label.js';

describe('shared/general/label', () => {
  it('should render', () => {
    const screen = render(
      <Label label={'label'}>
        <p>Text</p>
      </Label>
    );
    expect(screen.getByText('label')).toBeVisible();
  });
});
