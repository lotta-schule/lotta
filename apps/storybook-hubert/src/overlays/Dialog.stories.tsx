import * as React from 'react';
import { StoryObj } from '@storybook/react-vite';
import { Button, Dialog, DialogProps } from '@lotta-schule/hubert';
import { action } from 'storybook/actions';
import { useArgs } from 'storybook/preview-api';

export default {
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

export const Default: StoryObj<typeof Dialog> = {
  args: {
    title: 'Das ist der Titel',
    children: <p>Hier steht bedeutender Dialog Inhalt</p>,
  },
};
