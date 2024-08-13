'use client';

import * as React from 'react';
import { Button, Toolbar } from '@lotta-schule/hubert';
import { CreateCalendarDialog } from './CreateCalendarDialog';

export const CalendarListToolbar = React.memo(() => {
  const [isCreateCalendarDialogVisible, setIsCreateCalendarDialogVisible] =
    React.useState(false);
  return (
    <Toolbar hasScrollableParent stackOnMobile withPadding>
      <Button
        onClick={() => {
          setIsCreateCalendarDialogVisible(true);
        }}
      >
        Kalender erstellen
      </Button>
      <CreateCalendarDialog
        isOpen={isCreateCalendarDialogVisible}
        onClose={(calendar) => {
          setIsCreateCalendarDialogVisible(false);
        }}
      />
    </Toolbar>
  );
});
CalendarListToolbar.displayName = 'CalendarListToolbar';
