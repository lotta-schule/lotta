import * as React from 'react';
import { Meta } from '@storybook/react';
import { BaseButton } from '../../button';
import { Avatar } from '../../avatar';

export default {
  title: 'Buttons/BaseButton',
  component: BaseButton,
  argTypes: {},
  parameters: {},
} as Meta;

export const General = {
  args: {
    children: 'Der Button ist sehr allgemein gehalten',
  },
};

export const Disabled = {
  args: {
    children: 'Der Button darf nichts',
    as: 'button',
    disabled: true,
  } as any,
};

export const FillVariant = {
  args: {
    variant: 'fill',
    children: "Es gibt eine 'fill' Variante",
  },
};

export const ErrorVariant = {
  args: {
    variant: 'error',
    children: "Es gibt eine 'error' Variante",
  },
};

export const FullWidth = {
  args: {
    fullWidth: true,
    children: 'Volle Breite',
  },
};

export const Selected = {
  args: {
    selected: true,
    children: 'Ausgewählt',
  },
};

export const Complex = {
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
