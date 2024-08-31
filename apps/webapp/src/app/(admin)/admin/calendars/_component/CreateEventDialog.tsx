import * as React from 'react';
import { useMutation, useSuspenseQuery } from '@apollo/client';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  LoadingButton,
  ErrorMessage,
} from '@lotta-schule/hubert';
import { addHours, isAfter, isSameDay, startOfHour } from 'date-fns';
import { useTranslation } from 'react-i18next';
import {
  CREATE_CALENDAR_EVENT,
  GET_CALENDAR_EVENTS,
  GET_CALENDARS,
  RECURRENCE_FRAGMENT,
} from '../_graphql';
import { FragmentOf } from 'gql.tada';
import { EditEventFormContent } from './EditEventFormContent';

export type CreateEventDialogProps = {
  isOpen: boolean;
  onClose(): void;
};

export const CreateEventDialog = React.memo(
  ({ isOpen, onClose }: CreateEventDialogProps) => {
    const formRef = React.useRef<React.ComponentRef<'input'>>(null);

    const {
      data: { calendars },
    } = useSuspenseQuery(GET_CALENDARS, {
      fetchPolicy: 'cache-first',
    });

    const EMPTY_EVENT = React.useMemo(
      () => ({
        summary: '',
        description: '',
        calendarId: calendars.at(0)?.id ?? '',
        date: startOfHour(new Date()),
        endDate: addHours(startOfHour(new Date()), 1),
        isFullDay: true,
        recurrence: null as FragmentOf<typeof RECURRENCE_FRAGMENT> | null,
      }),
      []
    );

    const { t } = useTranslation();
    const [eventData, setEventData] = React.useState(EMPTY_EVENT);

    const [createEvent, { loading: isLoading, error }] = useMutation(
      CREATE_CALENDAR_EVENT,
      {
        variables: {
          calendarId: eventData.calendarId ?? null!,
          data: {
            summary: eventData.summary,
            description: eventData.description,
            start: eventData.date.toISOString(),
            end: eventData.endDate.toISOString(),
            isFullDay: eventData.isFullDay,
            recurrence: eventData.recurrence,
          },
        },
        refetchQueries: [GET_CALENDAR_EVENTS],
      }
    );

    const isMultipleDays = React.useMemo(
      () => !isSameDay(eventData.date, eventData.endDate),
      [eventData.date, eventData.endDate]
    );

    React.useEffect(() => {
      if (isOpen) {
        formRef.current?.querySelector('input')?.focus();
      } else {
        setEventData(EMPTY_EVENT);
      }
    }, [isOpen]);

    return (
      <Dialog open={isOpen} onRequestClose={onClose} title={t('create event')}>
        <form>
          <DialogContent>
            <ErrorMessage error={error} />
            <EditEventFormContent event={eventData} onUpdate={setEventData} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => onClose()}>{t('cancel')}</Button>
            <LoadingButton
              disabled={
                isLoading ||
                !eventData.summary ||
                !eventData.calendarId ||
                !eventData.date ||
                (!(eventData.isFullDay && !isMultipleDays) &&
                  isAfter(eventData.date, eventData.endDate))
              }
              type="submit"
              onAction={async (e: SubmitEvent | React.MouseEvent) => {
                e.preventDefault();
                await createEvent();
              }}
              onComplete={() => {
                onClose();
              }}
            >
              {t('save')}
            </LoadingButton>
          </DialogActions>
        </form>
      </Dialog>
    );
  }
);
CreateEventDialog.displayName = 'CreateEventDialog';
