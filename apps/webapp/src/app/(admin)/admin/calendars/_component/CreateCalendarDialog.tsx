import * as React from 'react';
import { useMutation } from '@apollo/client';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Input,
  ErrorMessage,
  Label,
  LoadingButton,
} from '@lotta-schule/hubert';

import CreateCalendarMutation from 'api/mutation/CreateCalendarMutation.graphql';

export type CalendarModel = { id: string; name: string; defaultColor?: string };

export interface CreateCalendarDialogProps {
  isOpen: boolean;
  onClose(calendar?: CalendarModel): void;
}

export const CreateCalendarDialog = React.memo(
  ({ isOpen, onClose }: CreateCalendarDialogProps) => {
    const [name, setName] = React.useState('');
    const [color, setColor] = React.useState<string | undefined>();

    const [createCalendar, { data, loading: isLoading, error }] = useMutation<
      { calendar: CalendarModel },
      Partial<CalendarModel>
    >(CreateCalendarMutation, {
      variables: {
        name,
        defaultColor: color,
      },
      onCompleted: ({ calendar }) => {
        onClose(calendar);
      },
    });
    const resetForm = () => {
      setName('');
      setColor(undefined);
    };

    console.log({ error, data });

    return (
      <Dialog
        open={isOpen}
        onRequestClose={() => onClose()}
        title={'Kalender erstellen'}
      >
        <form>
          <DialogContent>
            <ErrorMessage error={error} />
            Gib dem neuen Kalender einen Namen
            <Label label="Name des Kalenders">
              <Input
                autoFocus
                id="name"
                value={name}
                onChange={({ currentTarget }) => setName(currentTarget.value)}
                disabled={isLoading}
                placeholder="Klausuren"
              />
            </Label>
            <Label label="Kalenderfarbe">
              <Input
                autoFocus
                id="color"
                type="color"
                value={color || ''}
                onChange={({ currentTarget }) => setColor(currentTarget.value)}
                disabled={isLoading}
              />
            </Label>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                resetForm();
                onClose();
              }}
            >
              Abbrechen
            </Button>
            <LoadingButton
              onAction={async (e: React.FormEvent) => {
                e.preventDefault();
                await createCalendar();
              }}
              disabled={!name || isLoading}
            >
              Kalender erstellen
            </LoadingButton>
          </DialogActions>
        </form>
      </Dialog>
    );
  }
);
CreateCalendarDialog.displayName = 'CreateCalendarDialog';
