import * as React from 'react';
import { List, ListItem } from '@lotta-schule/hubert';
import { loadCalendars } from 'loader';
import { Icon } from 'shared/Icon';
import { faCircle } from '@fortawesome/free-solid-svg-icons';

export const CalendarList = async () => {
  const calendars = await loadCalendars();
  return (
    <List>
      {calendars.map((calendar) => (
        <ListItem
          key={calendar.id}
          leftSection={
            <Icon
              icon={faCircle}
              fontSize={'inherit'}
              style={{
                padding: 0,
                color: calendar.defaultColor || '#fff',
                border: '1px solid #cccc',
                borderRadius: '50%',
                fontSize: '0.6em',
                verticalAlign: 'baseline',
              }}
            />
          }
        >
          {calendar.name}
        </ListItem>
      ))}
    </List>
  );
};
CalendarList.displayName = 'CalendarList';
