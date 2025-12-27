import * as React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  ErrorMessage,
} from '@lotta-schule/hubert';
import { useMutation } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';
import { differenceInCalendarDays, format } from 'date-fns';
import { ResultOf } from 'api/graphql';
import { type GET_CALENDAR_EVENTS, DELETE_CALENDAR_EVENT } from '../_graphql';

import styles from './DeleteEventConfirmationDialog.module.scss';

export type DeleteEventConfirmationDialogProps = {
  eventToDelete:
    | ResultOf<typeof GET_CALENDAR_EVENTS>['calendarEvents'][number]
    | null;
  onClose(deleted: boolean): void;
};

export const DeleteEventConfirmationDialog = React.memo(
  ({ eventToDelete, onClose }: DeleteEventConfirmationDialogProps) => {
    const { t } = useTranslation();

    const [deleteEvent, { loading: isLoading, error }] = useMutation(
      DELETE_CALENDAR_EVENT,
      {
        update: (client, { data }) => {
          if (data?.event) {
            const normalizedId = client.identify(data.event);

            if (normalizedId) {
              client.evict({ id: normalizedId });
            }
          }
        },
      }
    );

    return (
      <Dialog
        open={!!eventToDelete}
        onRequestClose={() => onClose(false)}
        title={t('delete event')}
      >
        {eventToDelete && (
          <DialogContent>
            <ErrorMessage error={error} />
            <p>{t('Do you really want to delete this event?')}</p>
            <p className={styles.eventDetails}>
              <span className={styles.eventName}>{eventToDelete?.summary}</span>
              {eventToDelete.description && (
                <span>{eventToDelete.description}</span>
              )}
              {eventToDelete.isFullDay && (
                <span className={styles.eventDates}>
                  {format(eventToDelete.start, 'PP')}
                  {differenceInCalendarDays(
                    eventToDelete.start,
                    eventToDelete.end
                  ) > 0 && ` - ${format(eventToDelete.end, 'PP')}`}
                </span>
              )}
              {!eventToDelete.isFullDay && (
                <span className={styles.eventDates}>
                  {format(eventToDelete.start, 'PP')},{' '}
                  {format(eventToDelete.start, 'p')} -{' '}
                  {format(eventToDelete.end, 'p')}
                </span>
              )}
            </p>
            {eventToDelete.recurrence && (
              <p>
                {t(
                  'This event is a recurring event. By deleting it, every occurrence will be deleted.'
                )}
              </p>
            )}
            <p>{t('This action cannot be undone.')}</p>
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={() => onClose(false)}>{t('cancel')}</Button>
          <Button
            variant="error"
            className={styles.deleteButton}
            disabled={!eventToDelete || isLoading}
            onClick={() =>
              deleteEvent({ variables: { id: eventToDelete!.id } }).then(() => {
                onClose(true);
              })
            }
          >
            {t('definitivly delete event')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);
DeleteEventConfirmationDialog.displayName = 'DeleteEventConfirmationDialog';
