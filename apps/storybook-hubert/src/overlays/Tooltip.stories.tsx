import * as React from 'react';
import { Meta } from '@storybook/react-vite';
import { Button, Tooltip } from '@lotta-schule/hubert';

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
