import * as React from 'react';
import { Analytics } from './Analytics';
import { AdminPage } from 'app/(admin)/admin/_component/AdminPage';
import { faChartLine } from '@fortawesome/free-solid-svg-icons';

async function AnalyticsPage() {
  return (
    <AdminPage icon={faChartLine} title={'Statistik'} hasHomeLink>
      <Analytics />
    </AdminPage>
  );
}

export default AnalyticsPage;
