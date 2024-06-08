import * as React from 'react';
import { loadWidgets } from 'loader';
import { notFound } from 'next/navigation';
import { AdminPageTitle } from '../../../_component/AdminPageTitle';
import { WidgetEditor } from '../_component/WidgetEditor';
import { serverTranslations } from 'i18n/server';

async function GroupPage({
  params: { widgetId },
}: {
  params: { widgetId: string };
}) {
  const widgets = await loadWidgets();
  const { t } = await serverTranslations();

  const widget = widgets.find((widget) => widget.id === widgetId);

  if (!widget) {
    return notFound();
  }

  return (
    <>
      <AdminPageTitle backUrl={'/admin/categories/widgets'}>
        {widget.title}
        <span
          style={{
            color: 'rgb(var(--lotta-disabled-color))',
            fontSize: '.7em',
            marginLeft: 'var(--lotta-spacing)',
            marginTop: 'calc(0.5 * var(--lotta-spacing))',
          }}
        >
          {t(widget.type)}
        </span>
      </AdminPageTitle>
      <WidgetEditor widget={widget} />
    </>
  );
}

export default GroupPage;
