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
import { useRouter } from 'next/navigation';

import GetCalendarsQuery from 'api/query/GetCalendarsQuery.graphql';
import CreateCalendarMutation from 'api/mutation/CreateCalendarMutation.graphql';

export type CalendarModel = { id: string; name: string; defaultColor?: string };

export interface CreateCalendarDialogProps {
  isOpen: boolean;
  onClose(calendar?: CalendarModel): void;
}

export const CreateCalendarDialog = React.memo(
  ({ isOpen, onClose }: CreateCalendarDialogProps) => {
    const router = useRouter();
    const [name, setName] = React.useState('');
    const [color, setColor] = React.useState('#ff0000');

    const resetForm = () => {
      setName('');
      setColor('#ff0000');
    };

    const [createCalendar, { loading: isLoading, error }] = useMutation<
      { calendar: CalendarModel },
      any
    >(CreateCalendarMutation, {
      variables: {
        name,
        color,
      },
      onCompleted: ({ calendar }) => {
        onClose(calendar);
        resetForm();
        if (calendar) {
          router.refresh();
        }
      },
      update: (cache, { data }) => {
        if (data?.calendar) {
          cache.updateQuery({ query: GetCalendarsQuery }, (prev) => {
            if (prev?.calendars) {
              return { calendars: [...prev.calendars, data.calendar] };
            }
            return prev;
          });
        }
      },
    });

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
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <Label label="Kalenderfarbe" style={{ flex: '0 0 2em' }}>
                <Input
                  autoFocus
                  id="color"
                  type="color"
                  value={color}
                  style={{
                    height: 'calc(1.5em + calc(2* var(--lotta-spacing)))',
                    padding: 'calc(0.5 * var(--lotta-spacing))',
                    top: -1,
                  }}
                  onChange={({ currentTarget }) =>
                    setColor(currentTarget.value)
                  }
                  disabled={isLoading}
                />
              </Label>
              <Label label="Name des Kalenders" style={{ flex: '1' }}>
                <Input
                  autoFocus
                  id="name"
                  value={name}
                  onChange={({ currentTarget }) => setName(currentTarget.value)}
                  disabled={isLoading}
                  placeholder="Klausuren"
                />
              </Label>
            </div>
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
              type="submit"
              onAction={async (e) => {
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
