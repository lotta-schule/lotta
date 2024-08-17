import * as React from 'react';
import {
  Button,
  ButtonGroup,
  Item,
  MenuButton,
  Toolbar,
} from '@lotta-schule/hubert';
import {
  faAdd,
  faCalendar,
  faCheck,
  faCircle,
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { ToolbarProps } from 'react-big-calendar';
import { useQuery } from '@apollo/client';
import { Icon } from 'shared/Icon';
import { CreateEventDialog } from './CreateEventDialog';
import { CalendarModel, CreateCalendarDialog } from './CreateCalendarDialog';

import styles from './CalendarToolbar.module.scss';

import GetCalendarsQuery from 'api/query/GetCalendarsQuery.graphql';
import { CalendarContext } from './CalendarContext';
import clsx from 'clsx';

export const CalendarToolbar = React.memo(
  ({ label, localizer, onNavigate }: ToolbarProps) => {
    const { t } = useTranslation();
    const { isCalendarActive, toggleCalendar } = React.use(CalendarContext);

    const [isCreateEventDialogOpen, setIsCreateEventDialogOpen] =
      React.useState(false);
    const [isCreateCalendarDialogOpen, setIsCreateCalendarDialogOpen] =
      React.useState(false);

    const { data, loading: isLoading } = useQuery<{
      calendars: CalendarModel[];
    }>(GetCalendarsQuery);

    return (
      <Toolbar hasScrollableParent className={styles.root}>
        <section>
          <ButtonGroup>
            <Button onClick={() => onNavigate('PREV')}>&lt;</Button>
            <Button onClick={() => onNavigate('TODAY')}>
              {localizer.messages.today}
            </Button>
            <Button
              onClick={() => onNavigate('NEXT')}
              title={t('Create event')}
            >
              &gt;
            </Button>
          </ButtonGroup>
        </section>
        <section>{label}</section>
        <section>
          <MenuButton
            title={t('Calendar')}
            onAction={(key) => {
              toggleCalendar(key as string);
            }}
            closeOnAction={false}
            placement="bottom"
            buttonProps={{
              icon: <Icon icon={faCalendar} />,
              disabled: isLoading,
            }}
          >
            {data?.calendars.map((calendar) => (
              <Item key={calendar.id} textValue={calendar.name}>
                <div style={{ color: calendar.defaultColor ?? '#ff0000' }}>
                  <Icon icon={faCircle} />
                </div>
                <div className={styles.calendarSelectionListItemContent}>
                  <span>{calendar.name}</span>
                  <span
                    className={clsx(styles.checkmark, {
                      [styles.isActive]: isCalendarActive(calendar.id),
                    })}
                  >
                    <Icon icon={faCheck} />
                  </span>
                </div>
              </Item>
            )) ?? []}
          </MenuButton>
          <MenuButton
            title={t('New')}
            onAction={(key) => {
              if (key === 'calendar') {
                setIsCreateCalendarDialogOpen(true);
              }
              if (key === 'event') {
                setIsCreateEventDialogOpen(true);
              }
            }}
            placement="bottom"
            buttonProps={{
              icon: <Icon icon={faAdd} />,
            }}
          >
            <Item key={'calendar'} textValue={t('create calendar')}>
              <span>{t('create calendar')}</span>
            </Item>
            <Item key={'event'} textValue={t('create event')}>
              <span>{t('create event')}</span>
            </Item>
          </MenuButton>
          <CreateEventDialog
            isOpen={isCreateEventDialogOpen}
            onClose={() => setIsCreateEventDialogOpen(false)}
          />
          <CreateCalendarDialog
            isOpen={isCreateCalendarDialogOpen}
            onClose={() => {
              setIsCreateCalendarDialogOpen(false);
            }}
          />
        </section>
      </Toolbar>
    );
  }
);
CalendarToolbar.displayName = 'CalendarToolbar';
