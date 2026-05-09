import * as React from 'react';
import { render } from '../test-utils.js';
import { Avatar } from './Avatar.js';

describe('Avatar', () => {
  it('should correctly render an avatar with src', () => {
    const screen = render(
      <Avatar src="https://example.com/avatar.jpg" title="Avatar" />
    );

    expect(screen.getByRole('img', { name: 'Avatar' })).toBeVisible();
    expect(screen.getByRole('img', { name: 'Avatar' })).toHaveStyle({
      backgroundImage: 'url(https://example.com/avatar.jpg)',
    });
  });

  it('should correctly render an avatar with srcSet', () => {
    const screen = render(
      <Avatar
        srcSet="https://example.com/avatar.jpg 1x, https://example.com/avatar2x.jpg 2x"
        title="Avatar"
      />
    );

    const el = screen.getByRole('img', { name: 'Avatar' });
    expect(el).toBeVisible();
    expect(el.style.backgroundImage).toMatch(
      /image-set\(.*avatar\.jpg.*1x.*avatar2x\.jpg.*2x\)/s
    );
  });
});
