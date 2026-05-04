import * as React from 'react';
import { Analytics } from './Analytics.js';
import { AdminPage } from '#/app/(admin)/admin/_component/AdminPage.js';
import { faChartLine } from '@fortawesome/free-solid-svg-icons';

async function AnalyticsPage() {
  return (
    <AdminPage icon={faChartLine} title={'Statistik'} hasHomeLink>
      <Analytics />
    </AdminPage>
  );
}

export default AnalyticsPage;
