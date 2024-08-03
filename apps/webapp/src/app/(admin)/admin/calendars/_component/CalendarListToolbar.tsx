'use client';

import * as React from 'react';
import { Button, Toolbar } from '@lotta-schule/hubert';

export const CalendarListToolbar = React.memo(() => {
  return (
    <Toolbar hasScrollableParent stackOnMobile withPadding>
      <Button onClick={() => alert('TODO')}>Kalender erstellen</Button>
    </Toolbar>
  );
});
CalendarListToolbar.displayName = 'CalendarListToolbar';
