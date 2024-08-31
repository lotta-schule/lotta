import * as React from 'react';
import { AdminPage } from '../_component/AdminPage';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';

async function CalendarsLayout({
  children,
}: React.PropsWithChildren<{ params: { groupId?: string } }>) {
  return (
    <AdminPage icon={faCalendar} title={'Kalender'} hasHomeLink takesFullSpace>
      {children}
    </AdminPage>
  );
}
export default CalendarsLayout;
