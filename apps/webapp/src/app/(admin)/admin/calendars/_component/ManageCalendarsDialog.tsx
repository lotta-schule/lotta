import * as React from 'react';
import { useQuery } from '@apollo/client/react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  LinearProgress,
  List,
  ListItem,
} from '@lotta-schule/hubert';
import { CALENDAR_FRAGMENT, GET_CALENDARS } from '../_graphql';
import { t } from 'i18next';
import { Icon } from 'shared/Icon';
import { faAdd, faCircle, faEdit } from '@fortawesome/free-solid-svg-icons';
import { CreateCalendarDialog } from './CreateCalendarDialog';
import { CalendarEditor } from './CalendarEditor';
import { FragmentOf } from 'gql.tada';

export interface ManageCalendarsDialogProps {
  isOpen: boolean;
  onClose(): void;
}

export const ManageCalendarsDialog = React.memo(
  ({ isOpen, onClose }: ManageCalendarsDialogProps) => {
    const { data, loading: isLoading } = useQuery(GET_CALENDARS);

    const [isCreateCalendarDialogOpen, setIsCreateCalendarDialogOpen] =
      React.useState(false);
    const [calendarBeingEdited, setCalendarBeingEdited] =
      React.useState<FragmentOf<typeof CALENDAR_FRAGMENT> | null>(null);

    return (
      <Dialog
        open={isOpen}
        onRequestClose={() => onClose()}
        title={t('manage calendars')}
      >
        {calendarBeingEdited && (
          <CalendarEditor
            key={calendarBeingEdited.id}
            calendar={calendarBeingEdited}
            onClose={() => setCalendarBeingEdited(null)}
          />
        )}
        {!calendarBeingEdited && (
          <>
            <DialogContent>
              {isLoading && (
                <LinearProgress
                  isIndeterminate
                  aria-label={t('loading calendars')}
                />
              )}
              <List>
                {!isLoading &&
                  (data?.calendars.length ? (
                    data.calendars.map((calendar) => (
                      <ListItem
                        key={calendar.id}
                        leftSection={
                          <div style={{ color: calendar.color }}>
                            <Icon icon={faCircle} />
                          </div>
                        }
                        rightSection={
                          <Button
                            icon={<Icon icon={faEdit} />}
                            title={t('edit')}
                            onClick={() => {
                              setCalendarBeingEdited(calendar);
                            }}
                          />
                        }
                      >
                        {calendar.name}
                      </ListItem>
                    ))
                  ) : (
                    <ListItem key={'emptyli'}>
                      {t('no calendars found')}
                    </ListItem>
                  ))}
              </List>
            </DialogContent>
            <DialogActions>
              <Button
                icon={<Icon icon={faAdd} />}
                title={t('create calendar')}
                onClick={() => {
                  setIsCreateCalendarDialogOpen(true);
                }}
              >
                {t('create calendar')}
              </Button>
              <CreateCalendarDialog
                isOpen={isCreateCalendarDialogOpen}
                onClose={() => {
                  setIsCreateCalendarDialogOpen(false);
                }}
              />

              <Button
                style={{ marginLeft: 'auto' }}
                onClick={() => {
                  onClose();
                }}
              >
                {t('cancel')}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    );
  }
);
ManageCalendarsDialog.displayName = 'ManageCalendarsDialog';
