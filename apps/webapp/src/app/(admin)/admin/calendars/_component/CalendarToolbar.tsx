import * as React from 'react';
import {
  Button,
  ButtonGroup,
  Item,
  MenuButton,
  Toolbar,
  useIsMobile,
} from '@lotta-schule/hubert';
import {
  faAdd,
  faCalendar,
  faCalendarDays,
  faCheck,
  faCircle,
  faGear,
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { ToolbarProps } from 'react-big-calendar';
import { useQuery } from '@apollo/client/react';
import { Icon } from 'shared/Icon';
import { de } from 'date-fns/locale';
import { format } from 'date-fns';
import { CreateEventDialog } from './CreateEventDialog';
import { ManageCalendarsDialog } from './ManageCalendarsDialog';
import { CalendarContext } from './CalendarContext';
import { GET_CALENDARS } from '../_graphql';
import clsx from 'clsx';

import styles from './CalendarToolbar.module.scss';

export const CalendarToolbar = React.memo(
  ({ onNavigate }: Pick<ToolbarProps, 'onNavigate'>) => {
    const { t } = useTranslation();
    const isMobile = useIsMobile();
    const {
      currentView,
      currentDate,
      setCurrentView,
      isCalendarActive,
      toggleCalendar,
      setCurrentDate,
    } = React.use(CalendarContext);

    const [isCreateEventDialogOpen, setIsCreateEventDialogOpen] =
      React.useState(false);
    const [isManageCalendarsDialogOpen, setIsManageCalendarsDialogOpen] =
      React.useState(false);

    const label = React.useMemo(() => {
      if (currentView === 'month') {
        return format(currentDate, isMobile ? 'MMM yy' : 'MMMM yyyy', {
          locale: de,
        });
      }
      if (currentView === 'day') {
        return format(currentDate, isMobile ? 'EEEEEE PP' : 'PPPP', {
          locale: de,
        });
      }
      return t('today');
    }, [currentDate, currentView, isMobile, t]);

    const { data } = useQuery(GET_CALENDARS);

    const calendarMenuItems = React.useMemo(
      () => [
        <Item key={'manage_calendars'} textValue={t('manage calendars')}>
          <div>
            <Icon icon={faGear} />
          </div>
          <span>{t('manage calendars')}</span>
        </Item>,
        ...(data?.calendars.map((calendar) => (
          <Item key={calendar.id} textValue={calendar.name}>
            <div style={{ color: calendar.color }}>
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
        )) ?? []),
      ],
      [data, isCalendarActive, t]
    );

    return (
      <Toolbar hasScrollableParent className={styles.root}>
        <section>
          <ButtonGroup>
            <Button
              onClick={() => onNavigate('PREV')}
              title={t('previous month')}
            >
              &lt;
            </Button>
            <Button
              className={styles.todayButton}
              title={t('today')}
              onClick={() => onNavigate('TODAY')}
            >
              {isMobile ? label : t('today')}
            </Button>
            <Button
              onClick={() => {
                onNavigate('NEXT');
              }}
              title={t('next month')}
            >
              &gt;
            </Button>
          </ButtonGroup>
          {currentView === 'day' && (
            <Button
              onClick={() => setCurrentView('month')}
              title={t('month view')}
            >
              <Icon icon={faCalendarDays} />
            </Button>
          )}
        </section>
        <span>{!isMobile && label}</span>
        <section>
          <MenuButton
            title={t('manage calendars')}
            onAction={(key) => {
              if (key === 'manage_calendars') {
                setIsManageCalendarsDialogOpen(true);
              } else {
                toggleCalendar(key as string);
              }
            }}
            closeOnAction={false}
            placement="bottom"
            buttonProps={{
              icon: <Icon icon={faCalendar} />,
              title: t('manage calendars'),
            }}
          >
            {calendarMenuItems}
          </MenuButton>
          <Button
            icon={<Icon icon={faAdd} />}
            title={t('create event')}
            onClick={() => {
              setIsCreateEventDialogOpen(true);
            }}
            disabled={!data?.calendars.length}
          ></Button>
          <ManageCalendarsDialog
            isOpen={isManageCalendarsDialogOpen}
            onClose={() => setIsManageCalendarsDialogOpen(false)}
          />
          <CreateEventDialog
            isOpen={isCreateEventDialogOpen}
            onClose={(newEvent) => {
              setIsCreateEventDialogOpen(false);
              if (newEvent) {
                const nextDate = new Date(newEvent.start);
                if (!Number.isNaN(nextDate.getTime())) {
                  setCurrentDate(nextDate);
                }
              }
            }}
          />
        </section>
      </Toolbar>
    );
  }
);
CalendarToolbar.displayName = 'CalendarToolbar';
