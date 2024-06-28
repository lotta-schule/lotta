import * as React from 'react';
import { render } from '../test-utils';
import { Button } from './Button';

describe('button/BaseButton', () => {
  it('should render Button with label', () => {
    const screen = render(<Button>Click</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click');
  });

  it('should add the button variant as data-attribute', () => {
    const screen = render(
      <>
        <Button variant={'default'}>Default Button</Button>
        <Button variant={'fill'}>Filled Button</Button>
        <Button variant={'error'}>Error Button</Button>
        <Button variant={'borderless'}>Borderless Button</Button>
      </>
    );
    expect(screen.getByRole('button', { name: /default/i })).toHaveAttribute(
      'data-variant',
      'default'
    );
    expect(screen.getByRole('button', { name: /fill/i })).toHaveAttribute(
      'data-variant',
      'fill'
    );
    expect(screen.getByRole('button', { name: /error/i })).toHaveAttribute(
      'data-variant',
      'error'
    );
    expect(screen.getByRole('button', { name: /borderless/i })).toHaveAttribute(
      'data-variant',
      'borderless'
    );
  });

  it('should render as link when an href attribute is passed', () => {
    const screen = render(<Button href={'/'}>Go back</Button>);
    const button = screen.getByRole('button');
    expect(button.nodeName).toBe('A');
    expect(button).toHaveAttribute('href', '/');
  });

  it('should have the corrected selected attribute', () => {
    const screen = render(
      <>
        <Button selected role={'option'}>
          A selected option
        </Button>
        <Button selected role={'tab'}>
          A selected tab
        </Button>
        <Button selected>A button</Button>
      </>
    );
    expect(screen.getByRole('option')).toHaveAttribute('aria-selected');
    expect(screen.getByRole('tab')).toHaveAttribute('aria-selected');
    expect(screen.getByRole('button')).toHaveAttribute('aria-current');
  });
});
