import * as React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Button, Dialog, DialogProps } from '@lotta-schule/hubert';
import { action } from '@storybook/addon-actions';
import { useArgs } from '@storybook/preview-api';

const meta: Meta<typeof Dialog> = {
  title: 'overlays/Dialog',
  component: Dialog,
  args: {
    open: false,
    onRequestClose: action('onRequestClose'),
  },
  render: (args) => {
    const [, updateArgs] = useArgs<DialogProps>();
    return (
      <>
        <style>{'body { background-color: red; }'}</style>
        <Button onClick={() => updateArgs({ open: true })}>
          Dialog öffnen
        </Button>
        <Dialog
          {...args}
          onRequestClose={() => {
            args.onRequestClose?.();
            updateArgs({ open: false });
          }}
        />
      </>
    );
  },
};

export default meta;

export const Default: StoryObj<typeof Dialog> = {
  args: {
    title: 'Das ist der Titel',
    children: <p>Hier steht bedeutender Dialog Inhalt</p>,
  },
};
