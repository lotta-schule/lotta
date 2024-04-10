import { Meta, StoryObj } from '@storybook/react';
import { Browser } from '@lotta-schule/hubert';

const meta: Meta<typeof Browser> = {
  title: 'browser/Default',
  component: Browser,
} as Meta;

export default meta;

export const Default: StoryObj<typeof Browser> = {};
