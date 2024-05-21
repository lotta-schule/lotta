import * as React from 'react';
import { Icon } from 'shared/Icon';
import { AdminPage } from 'administration/AdminPage';
import { Analytics } from 'administration/system/Analytics';
import { faChartLine } from '@fortawesome/free-solid-svg-icons';

const AnalyticsRoute = () => (
  <AdminPage
    title={
      <>
        <Icon icon={faChartLine} /> Statistiken
      </>
    }
    component={() => <Analytics />}
    hasHomeLink
  />
);

export default AnalyticsRoute;
