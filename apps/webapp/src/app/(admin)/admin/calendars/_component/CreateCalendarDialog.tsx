import * as React from 'react';
import { useMutation } from '@apollo/client/react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  ErrorMessage,
  LoadingButton,
} from '@lotta-schule/hubert';
import { useRouter } from 'next/navigation';
import { CREATE_CALENDAR, GET_CALENDARS } from '../_graphql';
import { useTranslation } from 'react-i18next';
import { BasicCalendarFormElement } from './BasicCalendarFormElement';

export interface CreateCalendarDialogProps {
  isOpen: boolean;
  onClose(): void;
}

export const CreateCalendarDialog = React.memo(
  ({ isOpen, onClose }: CreateCalendarDialogProps) => {
    const router = useRouter();
    const { t } = useTranslation();

    const [name, setName] = React.useState('');
    const [color, setColor] = React.useState('#ff0000');

    const resetForm = () => {
      setName('');
      setColor('#ff0000');
    };

    const [createCalendar, { loading: isLoading, error }] = useMutation(
      CREATE_CALENDAR,
      {
        variables: {
          data: {
            name,
            color,
          },
        },
        onCompleted: () => {
          onClose();
          resetForm();
          router.refresh();
        },
        update: (cache, { data }) => {
          if (data?.calendar) {
            cache.updateQuery({ query: GET_CALENDARS }, (prev) => {
              if (prev?.calendars) {
                return { calendars: [...prev.calendars, data.calendar] };
              }
              return prev;
            });
          }
        },
      }
    );

    return (
      <Dialog
        open={isOpen}
        onRequestClose={() => onClose()}
        title={t('create calendar')}
      >
        <form>
          <DialogContent>
            <ErrorMessage error={error} />
            Gib dem neuen Kalender einen Namen
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <BasicCalendarFormElement
                calendar={{ name, color }}
                disabled={isLoading}
                onChange={({ name, color }) => {
                  setName(name);
                  setColor(color);
                }}
              />
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
