import * as React from 'react';
import { WidgetList } from './WidgetList';
import { loadWidgets } from 'loader';
import { faSquareCaretRight } from '@fortawesome/free-solid-svg-icons';
import { AdminPage } from 'app/admin/_component/AdminPage';

async function WidgetListPage() {
  const widgets = await loadWidgets();

  return (
    <AdminPage icon={faSquareCaretRight} title={'Marginalen'} hasHomeLink>
      <WidgetList widgets={widgets} />
    </AdminPage>
  );
}

export default WidgetListPage;
