import * as React from 'react';
import { render } from '../test-utils';
import { Avatar } from './Avatar';

describe('Avatar', () => {
  it('should correctly render an avatar with src', () => {
    const screen = render(
      <Avatar src="https://example.com/avatar.jpg" title="Avatar" />
    );

    expect(screen.getByRole('img', { name: 'Avatar' })).toBeVisible();
    expect(screen.getByRole('img', { name: 'Avatar' })).toHaveStyle({
      'background-image': 'url(https://example.com/avatar.jpg)',
    });
  });

  it('should correctly render an avatar with srcSet', () => {
    const screen = render(
      <Avatar
        srcSet="https://example.com/avatar.jpg 1x, https://example.com/avatar2x.jpg 2x"
        title="Avatar"
      />
    );

    expect(screen.getByRole('img', { name: 'Avatar' })).toBeVisible();
    expect(screen.getByRole('img', { name: 'Avatar' })).toHaveStyle({
      'background-image':
        'image-set(url(https://example.com/avatar.jpg) 1x, url(https://example.com/avatar2x.jpg) 2x)',
    });
  });
});
