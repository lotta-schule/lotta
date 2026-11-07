import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from '../../test-utils';
import { Input } from './Input';

describe('shared/general/form/input', () => {
  it('should render a textarea when multine prop is given', () => {
    const screen = render(<Input multiline />);
    expect(screen.getByRole('textbox')).toHaveProperty('nodeName', 'TEXTAREA');
  });
});

describe('text typed before hydration', () => {
  it.each([false, true])(
    'reports the typed text through onChange (multiline: %s)',
    async (multiline) => {
      const { renderToString } = await import('react-dom/server');
      const { hydrateRoot } = await import('react-dom/client');
      const { act } = await import('react');

      const onChange = vi.fn();
      const element = (
        <Input
          aria-label="Suchbegriff"
          multiline={multiline as any}
          value={''}
          onChange={(e: any) => onChange(e.currentTarget.value)}
        />
      );

      const container = document.createElement('div');
      container.innerHTML = renderToString(element);
      document.body.appendChild(container);
      // the user types before the page is hydrated
      const field = container.querySelector<HTMLInputElement>(
        multiline ? 'textarea' : 'input'
      )!;
      field.value = 'abc';

      let root: ReturnType<typeof hydrateRoot>;
      await act(async () => {
        root = hydrateRoot(container, element);
      });

      expect(onChange).toHaveBeenCalledWith('abc');
      await act(async () => root.unmount());
      container.remove();
    }
  );

  it('does not call onChange when the value has not changed', () => {
    const onChange = vi.fn();
    render(<Input value={'abc'} onChange={onChange} />);
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('fields that normalize their value', () => {
  it.each([
    ['color', '#FF0000'],
    ['time', '10:00:00.000'],
    ['number', '1.50'],
  ])('does not call onChange on mount for type=%s', (type, value) => {
    const onChange = vi.fn();
    render(<Input type={type} value={value} onChange={onChange} />);
    expect(onChange).not.toHaveBeenCalled();
  });
});
