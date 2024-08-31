import * as React from 'react';
import { useMutation } from '@apollo/client';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  LoadingButton,
  ErrorMessage,
} from '@lotta-schule/hubert';
import { isAfter, isSameDay } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { GET_CALENDAR_EVENTS, UPDATE_CALENDAR_EVENT } from '../_graphql';
import { EditEventFormContent, EditEventInput } from './EditEventFormContent';
import { ResultOf } from 'gql.tada';

export type EditEventDialogProps = {
  eventToBeEdited:
    | ResultOf<typeof GET_CALENDAR_EVENTS>['calendarEvents'][number]
    | null;
  onClose(): void;
};

export const EditEventDialog = React.memo(
  ({ eventToBeEdited, onClose }: EditEventDialogProps) => {
    const formRef = React.useRef<React.ComponentRef<'input'>>(null);

    const { t } = useTranslation();
    const [eventData, setEventData] = React.useState<EditEventInput | null>(
      null
    );

    const [updateEvent, { loading: isLoading, error }] = useMutation(
      UPDATE_CALENDAR_EVENT,
      {
        variables: eventData
          ? {
              id: eventToBeEdited?.id ?? null!,
              data: {
                summary: eventData?.summary,
                description: eventData?.description || null,
                start: eventData?.start.toISOString(),
                end: eventData?.end.toISOString(),
                isFullDay: eventData?.isFullDay,
                recurrence: eventData?.recurrence,
                calendarId: eventData?.calendarId,
              },
            }
          : undefined,
        refetchQueries: [GET_CALENDAR_EVENTS],
      }
    );

    const isMultipleDays = React.useMemo(
      () => eventData && !isSameDay(eventData.start, eventData.end),
      [eventData?.start, eventData?.end]
    );

    React.useEffect(() => {
      if (eventToBeEdited) {
        const { id: _id, calendar, ...eventData } = eventToBeEdited;
        setEventData({
          ...eventData,
          start: new Date(eventData.start),
          end: new Date(eventData.end),
          calendarId: calendar.id,
        });
      } else {
        setEventData(null);
      }
    }, [eventToBeEdited]);

    React.useEffect(() => {
      if (eventToBeEdited) {
        formRef.current?.querySelector('input')?.focus();
      }
    }, [eventToBeEdited]);

    return (
      <Dialog
        open={!!eventToBeEdited}
        onRequestClose={onClose}
        title={t('edit event')}
      >
        <React.Suspense fallback={null}>
          <form>
            <DialogContent>
              <ErrorMessage error={error} />
              {eventData && (
                <EditEventFormContent
                  event={eventData}
                  onUpdate={setEventData}
                />
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => onClose()}>{t('cancel')}</Button>
              <LoadingButton
                disabled={
                  !eventData ||
                  isLoading ||
                  !eventData.summary ||
                  !eventData.calendarId ||
                  !eventData.start ||
                  (!(eventData.isFullDay && !isMultipleDays) &&
                    isAfter(eventData.start, eventData.end))
                }
                type="submit"
                onAction={async (e: SubmitEvent | React.MouseEvent) => {
                  e.preventDefault();
                  await updateEvent();
                }}
                onComplete={() => {
                  onClose();
                }}
              >
                {t('save')}
              </LoadingButton>
            </DialogActions>
          </form>
        </React.Suspense>
      </Dialog>
    );
  }
);
EditEventDialog.displayName = 'UpdateEventDialog';
