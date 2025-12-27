import * as React from 'react';
import { StoryObj } from '@storybook/react-vite';
import { Avatar, BaseButton } from '@lotta-schule/hubert';

export default {
  title: 'Buttons/BaseButton',
  component: BaseButton,
  argTypes: {},
};

export const General: StoryObj<typeof BaseButton> = {
  args: {
    children: 'Der Button ist sehr allgemein gehalten',
  },
};

export const Disabled: StoryObj<typeof BaseButton> = {
  args: {
    children: 'Der Button darf nichts',
    disabled: true,
  },
};

export const DisabledFilled: StoryObj<typeof BaseButton> = {
  args: {
    children: 'Der Button darf nichts',
    variant: 'fill',
    disabled: true,
  },
};

export const FillVariant: StoryObj<typeof BaseButton> = {
  args: {
    variant: 'fill',
    children: "Es gibt eine 'fill' Variante",
  },
};

export const ErrorVariant: StoryObj<typeof BaseButton> = {
  args: {
    variant: 'error',
    children: "Es gibt eine 'error' Variante",
  },
};

export const FullWidth: StoryObj<typeof BaseButton> = {
  args: {
    fullWidth: true,
    children: 'Volle Breite',
  },
};

export const Selected: StoryObj<typeof BaseButton> = {
  args: {
    selected: true,
    children: 'Ausgewählt',
  },
};

export const Complex: StoryObj<typeof BaseButton> = {
  args: {
    children: (
      <div style={{ display: 'flex' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>Der Vorteil am BaseButton</label>
          <strong>Er ist sehr flexibel</strong>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            paddingLeft: '1em',
          }}
        >
          <Avatar src={''} />
        </div>
      </div>
    ),
  },
};
