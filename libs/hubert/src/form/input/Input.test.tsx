import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '../../test-utils.js';
import { Input } from './Input.js';

describe('shared/general/form/input', () => {
  it('should render a textarea when multine prop is given', () => {
    const screen = render(<Input multiline />);
    expect(screen.getByRole('textbox')).toHaveProperty('nodeName', 'TEXTAREA');
  });
});
