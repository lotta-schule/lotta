import * as React from 'react';
import { Checkbox, List, ListItem } from '@lotta-schule/hubert';

export const CalendarList = React.memo(() => {
  return (
    <List>
      <ListItem rightSection={<Checkbox />}>Kalender A</ListItem>
      <ListItem rightSection={<Checkbox />}>Kalender B</ListItem>
    </List>
  );
});
CalendarList.displayName = 'CalendarList';
