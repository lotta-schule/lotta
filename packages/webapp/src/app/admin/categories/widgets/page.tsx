import * as React from 'react';
import { WidgetList } from './WidgetList';
import { loadWidgets } from 'loader';

async function WidgetListPage() {
  const widgets = await loadWidgets();

  return <WidgetList widgets={widgets} />;
}

export default WidgetListPage;
