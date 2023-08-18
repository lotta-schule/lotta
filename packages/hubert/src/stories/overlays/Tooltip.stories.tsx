import * as React from 'react';
import { Meta } from '@storybook/react';
import { Tooltip } from '../../util';
import { Button } from '../../button';

export default {
  title: 'overlays/Tooltip',
  component: Tooltip,
} as Meta;

export const Default = {
  args: {
    children: <Button onClick={() => alert('click')} label={'Hover me'} />,
    label: 'Simple Tooltip',
  },
};

export const Image = {
  args: {
    children: <Button onClick={() => alert('click')} label={'Hover me'} />,
    label: (
      <img
        src="https://picsum.photos/id/123/600/400"
        alt="Wahrscheinlich wunderschönes Foto"
      />
    ),
  },
};
