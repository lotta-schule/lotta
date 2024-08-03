import * as React from 'react';
import { AdminPage } from '../_component/AdminPage';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import { CalendarList } from './_component/CalendarList';
import { CalendarListToolbar } from './_component/CalendarListToolbar';
import {
  TwoColumnLayout,
  TwoColumnLayoutContent,
  TwoColumnLayoutSidebar,
} from 'component/layout';
import { LinearProgress } from '@lotta-schule/hubert';

async function CalendarsLayout({
  children,
}: React.PropsWithChildren<{ params: { groupId?: string } }>) {
  return (
    <AdminPage icon={faCalendar} title={'Kalender'} hasHomeLink>
      <TwoColumnLayout>
        <TwoColumnLayoutSidebar>
          <CalendarListToolbar />
          <React.Suspense
            fallback={
              <LinearProgress aria-label="Kalender werden geladen ..." />
            }
          >
            <CalendarList />
          </React.Suspense>
        </TwoColumnLayoutSidebar>
        <TwoColumnLayoutContent>{children}</TwoColumnLayoutContent>
      </TwoColumnLayout>
    </AdminPage>
  );
}
export default CalendarsLayout;
