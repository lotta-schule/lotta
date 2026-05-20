import * as React from 'react';
import { AdminPage } from '../_component/AdminPage.js';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';

async function CalendarsLayout({ children }: React.PropsWithChildren) {
  return (
    <AdminPage icon={faCalendar} title={'Kalender'} hasHomeLink takesFullSpace>
      {children}
    </AdminPage>
  );
}
export default CalendarsLayout;
